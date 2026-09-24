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

public sealed class OrderEndpointTests
{
    [Fact]
    public async Task Order_PersistsFulfillmentSnapshotAndProtectsAccountOwnership()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        builder.Configuration["Commerce:ScenarioEnabled"] = "true";
        var database = Guid.NewGuid().ToString();
        var postgres = Environment.GetEnvironmentVariable("DIRECTO_ORDER_TEST_CONNECTION");
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
            .AddPolicy("ReportsView", p => p.RequireRole("Administrador", "Ventas", "Supervisor"))
            .AddPolicy("ProductsWrite", p => p.RequireRole("Administrador", "Compras", "Supervisor"))
            .AddPolicy("CustomersWrite", p => p.RequireRole("Administrador", "Compras", "Ventas"));
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapLaReservaEndpoints();
        await app.StartAsync();
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
        if (!string.IsNullOrEmpty(postgres)) await db.Database.MigrateAsync();
        db.CustomerAccounts.Add(new CustomerAccount { Id = "order-owner", Name = "Demo", Email = "order@example.com", Phone = "", City = "", PasswordHash = "unused", CreatedAt = DateTimeOffset.UtcNow });
        var product = new Product { Id = "order-coffee", Name = "Café de prueba", Origin = "Honduras", Region = "Demo", Process = "Lavado", Roast = "Medio", PresentationGrams = 340, PriceLps = 320, Stock = 10, Active = true, Description = "Demo", ImageUrl = "", ImageAlt = "", Quality = new QualityProfile { ProductId = "order-coffee", GrainType = "Arábica", Producer = "Demo", Grade = "Premium" } };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        using var client = app.GetTestClient();
        async Task<HttpResponseMessage> Post(CreateOrderRequest payload)
        {
            var quoteResponse = await client.PostAsJsonAsync("/api/orders/quote", new QuoteRequest(payload.Items, payload.City ?? "", payload.Wholesale));
            var token = quoteResponse.IsSuccessStatusCode ? (await quoteResponse.Content.ReadFromJsonAsync<OrderQuote>())!.Token : null;
            return await client.PostAsJsonAsync("/api/orders", payload with { RequestId = Guid.NewGuid(), QuoteToken = token });
        }
        var request = new CreateOrderRequest(" Cliente demo ", [new("order-coffee", 2, "Filtro")], " 00000000 ", " Dirección de prueba ", " Tegucigalpa ", " Entrada lateral ");
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Phone = " " })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Items = null! })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Items = [null!] })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Items = [new("order-coffee", 2, "inventada")] })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Items = [new("order-coffee", 0, "Filtro")] })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Post(request with { Items = [new("order-coffee", 700, "Filtro"), new("order-coffee", 500, "En grano")] })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Post(request with { AccountId = "order-owner" })).StatusCode);
        var created = await Post(request);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var receipt = (await created.Content.ReadFromJsonAsync<OrderDto>())!;
        Assert.Null(receipt.AccountId);
        Assert.Equal("Cliente demo", receipt.CustomerName);
        Assert.Equal("00000000", receipt.Phone);
        Assert.Equal("Dirección de prueba", receipt.DeliveryAddress);
        Assert.Equal("Tegucigalpa", receipt.City);
        Assert.Equal("Entrada lateral", receipt.DeliveryNotes);
        Assert.Equal(720m, receipt.TotalLps);
        Assert.Equal("Filtro", receipt.Items.Single().Grind);
        Assert.Equal(340, receipt.Items.Single().PresentationGrams);
        Assert.Equal("Medio", receipt.Items.Single().Roast);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/orders")).StatusCode);
        client.DefaultRequestHeaders.Add("X-Test-Subject", "order-owner");
        client.DefaultRequestHeaders.Add("X-Test-Type", "customer");
        Assert.Equal(HttpStatusCode.Unauthorized, (await Post(request with { AccountId = "another" })).StatusCode);
        var owned = await Post(request with { AccountId = "order-owner", DeliveryNotes = " " });
        Assert.Equal(HttpStatusCode.Created, owned.StatusCode);
        var ownedDto = (await owned.Content.ReadFromJsonAsync<OrderDto>())!;
        Assert.Equal("order-owner", ownedDto.AccountId);
        Assert.Null(ownedDto.DeliveryNotes);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/orders")).StatusCode);
        product.Name = "Nombre nuevo"; product.PresentationGrams = 1000; product.Roast = "Oscuro"; product.PriceLps = 900;
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();
        var persisted = await db.Orders.Include(o => o.Items).SingleAsync(o => o.Id == receipt.Id);
        Assert.Equal("Café de prueba", persisted.Items.Single().ProductName);
        Assert.Equal(340, persisted.Items.Single().PresentationGrams);
        Assert.Equal("Medio", persisted.Items.Single().Roast);
        Assert.Equal(320m, persisted.Items.Single().UnitPriceLps);
        Assert.Equal("00000000", persisted.Phone);
        client.DefaultRequestHeaders.Remove("X-Test-Type");
        client.DefaultRequestHeaders.Add("X-Test-Type", "team");
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/orders")).StatusCode);
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        var pdf = await client.GetAsync($"/api/orders/{receipt.Id}/pdf");
        Assert.Equal(HttpStatusCode.OK, pdf.StatusCode);
        Assert.Equal("application/pdf", pdf.Content.Headers.ContentType!.MediaType);
        db.Orders.Add(new Order { Id = "legacy-1d", CustomerName = "Anterior", Status = "Pendiente", CreatedAt = DateTimeOffset.UtcNow, Items = [new OrderItem { OrderId = "legacy-1d", ProductId = "order-coffee", ProductName = "Anterior", Quantity = 1, UnitPriceLps = 100 }] });
        await db.SaveChangesAsync();
        var legacyPdf = await client.GetAsync("/api/orders/legacy-1d/pdf");
        Assert.Equal(HttpStatusCode.OK, legacyPdf.StatusCode);
        client.DefaultRequestHeaders.Add("X-Test-Role", "Supervisor");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Add("X-Test-Role", "Ventas");
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Finalizada", "Pendiente"))).StatusCode);
        db.ChangeTracker.Clear();
        var staleProduct = (await db.Products.Include(p => p.Quality).SingleAsync(p => p.Id == "order-coffee")).ToDto();
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        db.ChangeTracker.Clear();
        Assert.Equal(8, (await db.Products.FindAsync("order-coffee"))!.Stock);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Cancelada", "Pendiente"))).StatusCode);
        var largeRequest = request with { Items = [new("order-coffee", 9, "Filtro")] };
        var large = (await (await Post(largeRequest)).Content.ReadFromJsonAsync<OrderDto>())!;
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{large.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Cancelada", "Aprobada"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Cancelada", "Aprobada"))).StatusCode);
        db.ChangeTracker.Clear();
        Assert.Equal(10, (await db.Products.FindAsync("order-coffee"))!.Stock);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{receipt.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Cancelada"))).StatusCode);
        client.DefaultRequestHeaders.Remove("X-Test-Role"); client.DefaultRequestHeaders.Add("X-Test-Role", "Administrador");
        Assert.Equal(HttpStatusCode.Conflict, (await client.PutAsJsonAsync("/api/products/order-coffee", staleProduct)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{ownedDto.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PatchAsJsonAsync($"/api/orders/{ownedDto.Id}/status", new UpdateOrderStatusRequest("Finalizada", "Aprobada"))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{ownedDto.Id}/status", new UpdateOrderStatusRequest("Cancelada", "Finalizada"))).StatusCode);
        db.ChangeTracker.Clear();
        Assert.Equal(8, (await db.Products.FindAsync("order-coffee"))!.Stock);
        // Deterministic competing transactions: both read the last units before either saves.
        if (!string.IsNullOrEmpty(postgres))
        {
            var competingRequest = request with { Items = [new("order-coffee", 6, "Filtro")] };
            var first = (await (await Post(competingRequest)).Content.ReadFromJsonAsync<OrderDto>())!;
            var second = (await (await Post(competingRequest)).Content.ReadFromJsonAsync<OrderDto>())!;
            using var scope1 = app.Services.CreateScope(); using var scope2 = app.Services.CreateScope();
            var db1 = scope1.ServiceProvider.GetRequiredService<LaReservaDbContext>();
            var db2 = scope2.ServiceProvider.GetRequiredService<LaReservaDbContext>();
            var order1 = await db1.Orders.Include(o => o.Items).SingleAsync(o => o.Id == first.Id);
            var order2 = await db2.Orders.Include(o => o.Items).SingleAsync(o => o.Id == second.Id);
            var products1 = await db1.Products.ToDictionaryAsync(p => p.Id);
            var products2 = await db2.Products.ToDictionaryAsync(p => p.Id);
            Assert.Null(OrderInventory.Apply(order1, "Aprobada", products1));
            Assert.Null(OrderInventory.Apply(order2, "Aprobada", products2));
            await db1.SaveChangesAsync();
            await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => db2.SaveChangesAsync());
            db.ChangeTracker.Clear();
            Assert.Equal(2, (await db.Products.FindAsync("order-coffee"))!.Stock);
            var unchanged = await db.Orders.FindAsync(second.Id);
            Assert.Equal("Pendiente", unchanged!.Status);
            Assert.False(unchanged.StockReserved);
        }

        // A lost response followed by a retry returns the same order, even after catalog changes.
        var retryQuote = (await (await client.PostAsJsonAsync("/api/orders/quote", new QuoteRequest(request.Items, request.City!))).Content.ReadFromJsonAsync<OrderQuote>())!;
        var retryRequest = request with { RequestId = Guid.NewGuid(), QuoteToken = retryQuote.Token };
        var retryFirst = await client.PostAsJsonAsync("/api/orders", retryRequest);
        var retrySecond = await client.PostAsJsonAsync("/api/orders", retryRequest);
        Assert.Equal(HttpStatusCode.Created, retryFirst.StatusCode);
        Assert.Equal(HttpStatusCode.OK, retrySecond.StatusCode);
        Assert.Equal((await retryFirst.Content.ReadFromJsonAsync<OrderDto>())!.Id, (await retrySecond.Content.ReadFromJsonAsync<OrderDto>())!.Id);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/orders", retryRequest with { CustomerName = "Otro contenido" })).StatusCode);
        Assert.Equal(1, await db.Orders.CountAsync(o => o.RequestId == retryRequest.RequestId));
        if (!string.IsNullOrEmpty(postgres))
        {
            var concurrentRequest = retryRequest with { RequestId = Guid.NewGuid() };
            var concurrentResponses = await Task.WhenAll(client.PostAsJsonAsync("/api/orders", concurrentRequest), client.PostAsJsonAsync("/api/orders", concurrentRequest));
            Assert.All(concurrentResponses, r => Assert.True(r.IsSuccessStatusCode));
            Assert.Equal(1, await db.Orders.CountAsync(o => o.RequestId == concurrentRequest.RequestId));
        }
        var outside = (await (await Post(request with { City = "Otra ciudad" })).Content.ReadFromJsonAsync<OrderDto>())!;
        Assert.Null(outside.Terms!.ShippingLps);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{outside.Id}/status", new UpdateOrderStatusRequest("Aprobada", "Pendiente"))).StatusCode);
        var delivery = new DeliveryQuoteRequest(150m, "Escenario acordado; sin entrega real", CommerceRules.Token(outside.Terms));
        var deliveryResponse = await client.PatchAsJsonAsync($"/api/orders/{outside.Id}/delivery", delivery);
        Assert.Equal(HttpStatusCode.OK, deliveryResponse.StatusCode);
        Assert.Equal(outside.TotalLps + 150, (await deliveryResponse.Content.ReadFromJsonAsync<OrderDto>())!.TotalLps);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PatchAsJsonAsync($"/api/orders/{outside.Id}/delivery", delivery)).StatusCode);
        var summaryResponse = await client.GetAsync("/api/reports/summary");
        Assert.Equal(HttpStatusCode.OK, summaryResponse.StatusCode);
        var summary = (await summaryResponse.Content.ReadFromJsonAsync<ReportSummaryDto>())!;
        Assert.Equal(720m, summary.SalesLps);
        Assert.Single(summary.TopProducts);
        Assert.Equal(2, summary.TopProducts[0].Units);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/reports/summary?from=2026-09-23&to=2026-09-01")).StatusCode);
        foreach (var type in new[] { "ventas", "inventario", "ordenes", "mas-vendidos", "movimientos" })
        {
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/reports/export?type={type}&format=pdf")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/reports/export?type={type}&format=xlsx")).StatusCode);
        }

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
