using System.Security.Claims;
using System.Text.Json;
using LaReserva.Application;
using LaReserva.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LaReserva.Api;

public static partial class ApiEndpoints
{
    private static void MapCommerce(IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/commerce", (IConfiguration configuration) => Results.Ok(new
        {
            scenarioEnabled = configuration.GetValue<bool>("Commerce:ScenarioEnabled"),
            scenario = CommerceRules.Scenario,
        }));
        routes.MapPost("/api/orders/quote", async (QuoteRequest request, IConfiguration configuration, LaReservaDbContext db, CancellationToken token) =>
        {
            if (request.Items is null || request.Items.Any(i => i is null)) return Results.BadRequest(new { error = "Faltan productos." });
            var ids = request.Items.Select(i => i.ProductId).Distinct().ToArray();
            var products = await db.Products.AsNoTracking().Where(p => ids.Contains(p.Id) && p.Active).ToDictionaryAsync(p => p.Id, token);
            try { return Results.Ok(CommerceRules.Quote(request, products, configuration.GetValue<bool>("Commerce:ScenarioEnabled"))); }
            catch (ArgumentException error) { return Results.BadRequest(new { error = error.Message }); }
        });
        routes.MapPatch("/api/orders/{id}/delivery", async (string id, DeliveryQuoteRequest request, ClaimsPrincipal principal, LaReservaDbContext db, CancellationToken token) =>
        {
            if (request.ShippingLps < 0 || request.ShippingLps > 100000 || decimal.Round(request.ShippingLps, 2) != request.ShippingLps
                || string.IsNullOrWhiteSpace(request.Note) || request.Note.Length > 1000)
                return Results.BadRequest(new { error = "Indicá costo de envío válido y evidencia del acuerdo con el cliente (hasta 1000 caracteres)." });
            var order = await db.Orders.Include(o => o.Items).SingleOrDefaultAsync(o => o.Id == id, token);
            if (order is null) return Results.NotFound();
            var terms = order.ToDto().Terms;
            if (order.Status != "Pendiente" || terms is null || terms.ShippingLps is not null || CommerceRules.Token(terms) != request.ExpectedToken)
                return Results.Conflict(new { error = "El pedido cambió o su envío ya fue cotizado. Recargá antes de continuar." });
            terms = terms with { ShippingLps = request.ShippingLps, TotalLps = terms.SubtotalLps - terms.DiscountLps + request.ShippingLps, DeliveryNote = request.Note.Trim() };
            order.TermsJson = JsonSerializer.Serialize(terms); order.TotalLps = terms.TotalLps;
            CommerceRules.Record(order, principal.FindFirstValue("sub") ?? "team", $"Envío acordado: L {request.ShippingLps}. {request.Note.Trim()}");
            try { await db.SaveChangesAsync(token); }
            catch (DbUpdateConcurrencyException) { return Results.Conflict(new { error = "El pedido cambió durante el guardado." }); }
            return Results.Ok(order.ToDto());
        }).RequireAuthorization("Team", "CustomersWrite");
        routes.MapGet("/api/orders/{id}/history", async (string id, LaReservaDbContext db, CancellationToken token) =>
        {
            var order = await db.Orders.AsNoTracking().SingleOrDefaultAsync(o => o.Id == id, token);
            return order is null ? Results.NotFound() : Results.Ok(new { events = JsonSerializer.Deserialize<OrderEvent[]>(order.HistoryJson), deliveryToken = order.ToDto().Terms is { } terms ? CommerceRules.Token(terms) : null });
        }).RequireAuthorization("Team");
    }
}
