using System.Security.Claims;
using System.Text.Json;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LaReserva.Api;

public static partial class ApiEndpoints
{
    private static bool IsCommercial(string profile) => profile is "business" or "cafe" or "producer";

    private static void MapCommercialRequests(IEndpointRouteBuilder routes)
    {
        // PUT maintains one request per account/profile; retries never create duplicates.
        routes.MapPut("/api/accounts/{id}/commercial-requests/{profile}", async (
            string id, string profile, ClaimsPrincipal principal, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (principal.FindFirstValue("subject_type") != "customer" || principal.FindFirstValue("sub") != id)
                return Results.Forbid();
            if (!IsCommercial(profile)) return Results.BadRequest(new { error = "Elegí un perfil comercial." });
            var account = await db.CustomerAccounts.SingleOrDefaultAsync(a => a.Id == id, cancellationToken);
            if (account is null) return Results.NotFound();
            var onboarding = account.ToDto().Onboarding;
            if (onboarding?.Profile != profile || OnboardingRules.Validate(onboarding) is not null)
                return Results.BadRequest(new { error = "Guardá primero las respuestas completas de este perfil." });
            var request = await db.CommercialRequests.SingleOrDefaultAsync(r => r.AccountId == id && r.Profile == profile, cancellationToken);
            if (request is null)
            {
                request = new CommercialRequest { Id = Guid.NewGuid(), AccountId = id, Profile = profile,
                    OnboardingJson = account.OnboardingJson!, CreatedAt = DateTimeOffset.UtcNow };
                db.CommercialRequests.Add(request);
                CommercialWorkflow.Record(request, id, "customer", "Nueva", null, "Solicitud registrada por el cliente.");
            }
            else if (!CommercialWorkflow.SameAnswers(JsonSerializer.Deserialize<OnboardingDto>(request.OnboardingJson)!, onboarding!))
            {
                CommercialWorkflow.Record(request, id, "customer", "Nueva", request.AssignedUserId,
                    "El cliente actualizó sus necesidades; requiere nueva revisión.", JsonSerializer.Deserialize<OnboardingDto>(request.OnboardingJson));
            }
            request.OnboardingJson = account.OnboardingJson!;
            try { await db.SaveChangesAsync(cancellationToken); }
            catch (DbUpdateConcurrencyException)
            {
                return Results.Conflict(new { error = "La solicitud cambió desde otra sesión. Reintentá para registrar tus respuestas actuales." });
            }
            catch (DbUpdateException exception) when (exception.InnerException is Npgsql.PostgresException { SqlState: "23505" })
            {
                return Results.Conflict(new { error = "La solicitud ya se registró desde otra sesión. Reintentá para actualizarla." });
            }
            // Customer confirmation excludes internal notes and staff assignments.
            return Results.Ok(new { request.Id, request.Profile, request.Status, request.CreatedAt, request.UpdatedAt, ExternalMessageSent = false });
        }).RequireAuthorization();

        routes.MapGet("/api/commercial-requests", async (int? page, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var index = Math.Clamp(page ?? 1, 1, 100000);
            var rows = await (from request in db.CommercialRequests.AsNoTracking()
                              join account in db.CustomerAccounts.AsNoTracking() on request.AccountId equals account.Id
                              orderby request.UpdatedAt descending, request.Id
                              select new { request, account }).Skip((index - 1) * 50).Take(51).ToListAsync(cancellationToken);
            return Results.Ok(new { items = rows.Take(50).Select(r => ToCommercialDto(r.request, r.account)), hasMore = rows.Count > 50 });
        }).RequireAuthorization("Team", "CustomersView");

        routes.MapGet("/api/commercial-requests/assignees", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
            Results.Ok(await db.Users.AsNoTracking().Where(u => u.Active && (u.Role == "Administrador" || u.Role == "Compras" || u.Role == "Ventas"))
                .OrderBy(u => u.Name).Select(u => new { u.Id, u.Name, u.Role }).ToListAsync(cancellationToken)))
            .RequireAuthorization("Team", "CustomersWrite");

        routes.MapPatch("/api/commercial-requests/{id:guid}/workflow", async (
            Guid id, UpdateCommercialWorkflowRequest update, ClaimsPrincipal principal, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var actor = principal.FindFirstValue("sub");
            if (string.IsNullOrEmpty(actor)) return Results.Forbid();
            var request = await db.CommercialRequests.SingleOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (request is null) return Results.NotFound();
            if (request.Version != update.Version) return Results.Conflict(new { error = "Otra persona actualizó la solicitud. Recargá antes de guardar." });
            if (!CommercialWorkflow.CanTransition(request.Status, update.Status))
                return Results.BadRequest(new { error = "La transición de estado no está permitida." });
            if (string.IsNullOrWhiteSpace(update.Note) || update.Note.Trim().Length > 1000)
                return Results.BadRequest(new { error = "Incluí una nota de seguimiento entre 1 y 1000 caracteres." });
            if (update.AssignedUserId is not null)
            {
                var assignee = await db.Users.SingleOrDefaultAsync(u => u.Id == update.AssignedUserId, cancellationToken);
                if (assignee is null || !assignee.Active || !CommercialWorkflow.CanAssign(assignee.Role))
                    return Results.BadRequest(new { error = "Elegí un responsable activo de Administración, Compras o Ventas." });
            }
            if (update.Status is "En contacto" or "Propuesta enviada" && update.AssignedUserId is null)
                return Results.BadRequest(new { error = "Asigná un responsable antes de avanzar el seguimiento." });
            CommercialWorkflow.Record(request, actor, "team", update.Status, update.AssignedUserId, update.Note.Trim());
            try { await db.SaveChangesAsync(cancellationToken); }
            catch (DbUpdateConcurrencyException) { return Results.Conflict(new { error = "Otra persona actualizó la solicitud. Recargá antes de guardar." }); }
            var account = await db.CustomerAccounts.SingleAsync(a => a.Id == request.AccountId, cancellationToken);
            return Results.Ok(ToCommercialDto(request, account));
        }).RequireAuthorization("Team", "CustomersWrite");
    }

    private static object ToCommercialDto(CommercialRequest request, CustomerAccount account) => new
    {
        request.Id, request.AccountId, request.Profile, request.CreatedAt, request.UpdatedAt,
        Name = account.Name, Email = account.Email, Phone = account.Phone, City = account.City,
        Onboarding = JsonSerializer.Deserialize<OnboardingDto>(request.OnboardingJson),
        request.Status, request.AssignedUserId, request.Version,
        History = JsonSerializer.Deserialize<CommercialHistoryEntry[]>(request.HistoryJson), ExternalMessageSent = false,
    };
}
