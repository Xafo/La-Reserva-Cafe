using System.Net;
using System.Net.Http.Json;
using LaReserva.Api;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace LaReserva.Tests;

public sealed class OrderSubmissionEndpointTests
{
    [Fact]
    public async Task RepeatedRequestIdReturnsTheSavedOrderWithoutCreatingAnother()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        var databaseRoot = new InMemoryDatabaseRoot();
        var databaseName = Guid.NewGuid().ToString();
        builder.Services.AddDbContext<LaReservaDbContext>(options => options.UseInMemoryDatabase(databaseName, databaseRoot));
        builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        builder.Services.AddScoped<IPasswordHasher<CustomerAccount>, PasswordHasher<CustomerAccount>>();
        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddSingleton<IOptions<JwtOptions>>(Options.Create(new JwtOptions { Issuer = "test", Audience = "test", SigningKey = new string('x', 64) }));
        builder.Services.AddAuthentication();
        builder.Services.AddAuthorization();
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapLaReservaEndpoints();
        await app.StartAsync();

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
        db.Products.Add(new Product
        {
            Id = "coffee", Name = "Café", Stock = 10, Active = true, PriceLps = 320,
            Origin = "Honduras", Region = "Demo", Process = "Lavado", Roast = "Medio",
            PresentationGrams = 340, Description = "Demo", ImageUrl = "", ImageAlt = "", Version = Guid.NewGuid(),
            Quality = new QualityProfile { ProductId = "coffee", GrainType = "Arábica", Producer = "Demo", Grade = "Premium" },
        });
        await db.SaveChangesAsync();

        var request = new CreateOrderRequest
        {
            CustomerName = "Cliente de prueba", CustomerEmail = "qa@example.com", CustomerPhone = "9999-9999",
            DeliveryAddress = "Barrio Centro", DeliveryCity = "Tegucigalpa", RequestId = Guid.NewGuid(),
            Items = [new CreateOrderItemRequest("coffee", 1, "Molido")],
        };
        Assert.Null(OrderRules.Validate(request));
        var roundTrip = System.Text.Json.JsonSerializer.Deserialize<CreateOrderRequest>(System.Text.Json.JsonSerializer.Serialize(request));
        Assert.NotNull(roundTrip);
        Assert.Null(OrderRules.Validate(roundTrip!));
        using var client = app.GetTestClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/commerce")).StatusCode);
        var quote = await client.PostAsJsonAsync("/api/orders/quote", new QuoteRequest(
            [new CreateOrderItemRequest("coffee", 1, "Molido")], "Tegucigalpa"));
        Assert.Equal(HttpStatusCode.OK, quote.StatusCode);
        var first = await client.PostAsJsonAsync("/api/orders", request);
        var second = await client.PostAsJsonAsync("/api/orders", request);

        Assert.True(first.StatusCode == HttpStatusCode.Created, await first.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var firstOrder = await first.Content.ReadFromJsonAsync<OrderDto>();
        var secondOrder = await second.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(firstOrder);
        Assert.Equal(firstOrder!.Id, secondOrder!.Id);
        db.ChangeTracker.Clear();
        var saved = await db.Orders.Include(order => order.Items).SingleAsync();
        Assert.Equal(request.RequestId, saved.RequestId);
        Assert.Equal("Molido", saved.Items.Single().Grind);
    }
}
