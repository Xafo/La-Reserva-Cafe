using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using LaReserva.Api;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LaReserva.Tests;

public sealed class OnboardingEndpointTests
{
    [Fact]
    public async Task Endpoint_ProtectsAccountAndValidatesBeforeSaving()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        var database = Guid.NewGuid().ToString();
        var postgres = Environment.GetEnvironmentVariable("DIRECTO_TEST_CONNECTION");
        if (!string.IsNullOrEmpty(postgres))
        {
            var connection = new Npgsql.NpgsqlConnectionStringBuilder(postgres);
            if (connection.Host != "127.0.0.1" || connection.Database?.StartsWith("directo_test_", StringComparison.Ordinal) != true)
                throw new InvalidOperationException("La prueba PostgreSQL requiere una base directo_test_* en 127.0.0.1.");
            builder.Services.AddDbContext<LaReservaDbContext>(o => o.UseNpgsql(postgres).UseSnakeCaseNamingConvention());
        }
        else builder.Services.AddDbContext<LaReservaDbContext>(o => o.UseInMemoryDatabase(database));
        builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        builder.Services.AddScoped<IPasswordHasher<CustomerAccount>, PasswordHasher<CustomerAccount>>();
        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddSingleton<IOptions<JwtOptions>>(Options.Create(new JwtOptions { Issuer = "test", Audience = "test", SigningKey = new string('x', 64) }));
        builder.Services.AddAuthentication("test").AddScheme<AuthenticationSchemeOptions, TestIdentity>("test", _ => { });
        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("Team", p => p.RequireClaim("subject_type", "team"))
            .AddPolicy("CustomersView", p => p.RequireRole("Administrador", "Compras", "Ventas", "Supervisor"))
            .AddPolicy("CustomersWrite", p => p.RequireRole("Administrador", "Compras", "Ventas"));
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapLaReservaEndpoints();
        await app.StartAsync();
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
        if (!string.IsNullOrEmpty(postgres)) await db.Database.MigrateAsync();
        db.CustomerAccounts.Add(new CustomerAccount
        {
            Id = "owner", Name = "Demo", Email = "owner@example.com", Phone = "", City = "",
            PasswordHash = "unused", CreatedAt = DateTimeOffset.UtcNow,
            Preferences = new CustomerPreference { AccountId = "owner", Intensity = "Suave", Budget = "Hasta L400", Goals = [] },
        });
        db.Customers.Add(new Customer
        {
            Id = "customer-owner", Name = "Demo", Email = "owner@example.com", Phone = "", City = "", Type = "Cliente", TotalOrders = 0,
        });
        await db.SaveChangesAsync();
        db.Orders.Add(new Order
        {
            Id = "OC-OWNER-1", CustomerName = "Demo", CustomerEmail = "owner@example.com", Status = "Pendiente", CreatedAt = DateTimeOffset.UtcNow,
            TotalLps = 320, AccountId = "owner",
            Items = [new OrderItem { OrderId = "OC-OWNER-1", ProductId = "coffee", ProductName = "Café", Quantity = 1, UnitPriceLps = 320 }],
        });
        await db.SaveChangesAsync();
        var onboarding = new OnboardingDto(1, "new", new()
        {
            ["n1"] = "Solo negro", ["n2"] = "Florales y delicados", ["n3"] = "Suave y ligero",
            ["n4"] = "Método manual", ["n5"] = "Un regalo especial",
        }, DateTimeOffset.UnixEpoch);
        var request = new UpdateOnboardingRequest(onboarding, null);
        using var client = app.GetTestClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/accounts/owner/orders")).StatusCode);
        client.DefaultRequestHeaders.Add("X-Test-Subject", "other");
        client.DefaultRequestHeaders.Add("X-Test-Type", "customer");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/accounts/owner/orders")).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Subject");
        client.DefaultRequestHeaders.Add("X-Test-Subject", "owner");
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "team");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request)).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "customer");
        var currentAccount = await client.GetFromJsonAsync<CustomerAccountDto>("/api/accounts/me");
        Assert.Equal("owner", currentAccount!.Id);
        var ownedOrders = Assert.IsType<OrderDto[]>(await client.GetFromJsonAsync<OrderDto[]>("/api/accounts/owner/orders"));
        Assert.Single(ownedOrders);
        Assert.Equal("OC-OWNER-1", ownedOrders[0].Id);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request with { Onboarding = onboarding with { Version = 2 } })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request with { RecommendedProductId = "missing" })).StatusCode);
        var response = await client.PutAsJsonAsync("/api/accounts/owner/onboarding", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var saved = await response.Content.ReadFromJsonAsync<CustomerAccountDto>();
        Assert.Equal("new", saved!.Onboarding!.Profile);
        Assert.True(saved.Onboarding.UpdatedAt > DateTimeOffset.UnixEpoch);
        db.ChangeTracker.Clear();
        var account = await db.CustomerAccounts.Include(a => a.Preferences).SingleAsync();
        Assert.Equal("Suave", account.Preferences!.Intensity);
        Assert.Equal("Un regalo especial", account.ToDto().Onboarding!.Answers["n5"]);

        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsync("/api/accounts/owner/commercial-requests/business", null)).StatusCode);
        var profiles = new[]
        {
            new OnboardingDto(1, "business", new() { ["e1"] = "11 a 50 personas", ["e2"] = "Quincenal", ["e3"] = "$50 – $150", ["e4"] = "Molido" }, DateTimeOffset.UtcNow),
            new OnboardingDto(1, "cafe", new() { ["c1"] = "15 a 30 kg", ["c2"] = "Ambos", ["c3"] = "Sí, quiero exclusividad", ["c4"] = "Consistencia" }, DateTimeOffset.UtcNow),
            new OnboardingDto(1, "producer", new() { ["p1"] = "Soy ambos", ["p2"] = "Honduras", ["p3"] = "50 a 200 kg", ["p4"] = "Sí, tengo marca" }, DateTimeOffset.UtcNow),
        };
        foreach (var profile in profiles)
        {
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", new UpdateOnboardingRequest(profile, "missing"))).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", new UpdateOnboardingRequest(profile, null))).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsync($"/api/accounts/other/commercial-requests/{profile.Profile}", null)).StatusCode);
            var first = await client.PutAsync($"/api/accounts/owner/commercial-requests/{profile.Profile}", null);
            Assert.Equal(HttpStatusCode.OK, first.StatusCode);
            var firstJson = await first.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            Assert.False(firstJson.GetProperty("externalMessageSent").GetBoolean());
            Assert.False(firstJson.TryGetProperty("history", out _));
            Assert.False(firstJson.TryGetProperty("assignedUserId", out _));
            var second = await client.PutAsync($"/api/accounts/owner/commercial-requests/{profile.Profile}", null);
            var secondJson = await second.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            Assert.Equal(firstJson.GetProperty("id").GetGuid(), secondJson.GetProperty("id").GetGuid());
        }
        db.ChangeTracker.Clear();
        Assert.Equal(3, await db.CommercialRequests.CountAsync());
        Assert.Equal("business", System.Text.Json.JsonSerializer.Deserialize<OnboardingDto>((await db.CommercialRequests.SingleAsync(r => r.Profile == "business")).OnboardingJson)!.Profile);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/commercial-requests")).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "team");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/commercial-requests")).StatusCode);
        client.DefaultRequestHeaders.Add("X-Test-Role", "Ventas");
        var listing = await client.GetAsync("/api/commercial-requests");
        Assert.Equal(HttpStatusCode.OK, listing.StatusCode);
        var listingJson = await listing.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        Assert.Equal(3, listingJson.GetProperty("items").GetArrayLength());
        Assert.False(listingJson.GetProperty("hasMore").GetBoolean());
        var customerListing = Assert.IsType<CustomerDto[]>(await client.GetFromJsonAsync<CustomerDto[]>("/api/customers"));
        Assert.Equal(1, customerListing.Single(value => value.Id == "customer-owner").TotalOrders);
        db.Users.Add(new User { Id = "sales", Name = "Ventas", Email = "sales@example.com", Role = "Ventas", Active = true, PasswordHash = "unused" });
        db.Users.Add(new User { Id = "inactive", Name = "Inactivo", Email = "inactive@example.com", Role = "Ventas", Active = false, PasswordHash = "unused" });
        await db.SaveChangesAsync();
        var row = await db.CommercialRequests.SingleAsync(r => r.Profile == "producer");
        var route = $"/api/commercial-requests/{row.Id}/workflow";
        var update = new UpdateCommercialWorkflowRequest("En contacto", "sales", row.Version, "Revisión inicial.");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync(route, update with { Status = "Propuesta enviada" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync(route, update with { AssignedUserId = "inactive" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync(route, update with { AssignedUserId = null })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PatchAsJsonAsync(route, update with { Note = " " })).StatusCode);
        var followed = await client.PatchAsJsonAsync(route, update);
        Assert.Equal(HttpStatusCode.OK, followed.StatusCode);
        var followedJson = await followed.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        Assert.Equal("En contacto", followedJson.GetProperty("status").GetString());
        Assert.Equal(2, followedJson.GetProperty("history").GetArrayLength());
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync(route, update)).StatusCode);
        update = update with { Version = followedJson.GetProperty("version").GetGuid(), Status = "Cerrada", Note = "Cierre de prueba." };
        Assert.Equal(HttpStatusCode.OK, (await client.PatchAsJsonAsync(route, update)).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Add("X-Test-Role", "Supervisor");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PatchAsJsonAsync(route, update)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/commercial-requests")).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "customer");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PatchAsJsonAsync(route, update)).StatusCode);
        var same = await client.PutAsync("/api/accounts/owner/commercial-requests/producer", null);
        Assert.Equal("Cerrada", (await same.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>()).GetProperty("status").GetString());
        var changed = profiles[2] with { Answers = new(profiles[2].Answers) { ["p3"] = "Más de 200 kg" } };
        Assert.Equal(HttpStatusCode.OK, (await client.PutAsJsonAsync("/api/accounts/owner/onboarding", new UpdateOnboardingRequest(changed, null))).StatusCode);
        var reopened = await client.PutAsync("/api/accounts/owner/commercial-requests/producer", null);
        var reopenedJson = await reopened.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        Assert.Equal("Nueva", reopenedJson.GetProperty("status").GetString());
        db.ChangeTracker.Clear();
        var reopenedRecord = await db.CommercialRequests.SingleAsync(r => r.Profile == "producer");
        Assert.Equal("sales", reopenedRecord.AssignedUserId);
        var history = System.Text.Json.JsonSerializer.Deserialize<CommercialHistoryEntry[]>(reopenedRecord.HistoryJson)!;
        Assert.Equal("50 a 200 kg", history[3].PreviousOnboarding!.Answers["p3"]);
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "team");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsync("/api/accounts/owner/commercial-requests/producer", null)).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Subject");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsync("/api/accounts/owner/commercial-requests/producer", null)).StatusCode);
    }

    private sealed class TestIdentity(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var subject = Request.Headers["X-Test-Subject"].ToString();
            if (string.IsNullOrEmpty(subject)) return Task.FromResult(AuthenticateResult.NoResult());
            var identity = new ClaimsIdentity([new Claim("sub", subject), new Claim("subject_type", Request.Headers["X-Test-Type"].ToString()), new Claim(ClaimTypes.Role, Request.Headers["X-Test-Role"].ToString())], "test");
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), "test")));
        }
    }
}
