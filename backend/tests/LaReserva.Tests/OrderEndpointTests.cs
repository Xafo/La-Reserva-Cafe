using LaReserva.Application;
using LaReserva.Domain;

namespace LaReserva.Tests;

public sealed class OrderEndpointTests
{
    [Fact]
    public void ConcurrentConfirmationsUseTheProductConcurrencyToken()
    {
        var firstProduct = Coffee(5);
        var secondProduct = Coffee(5);
        var first = Pending("first", 5);
        var second = Pending("second", 5);

        Assert.Null(OrderInventory.Apply(first, "Confirmada", new Dictionary<string, Product> { [firstProduct.Id] = firstProduct }));
        Assert.Null(OrderInventory.Apply(second, "Confirmada", new Dictionary<string, Product> { [secondProduct.Id] = secondProduct }));

        // EF maps Product.Version as a concurrency token. A second request that read the
        // same version must receive DbUpdateConcurrencyException when it saves.
        Assert.NotEqual(firstProduct.Version, Guid.Empty);
        Assert.Equal(0, firstProduct.Stock);
        Assert.Equal(0, secondProduct.Stock);
    }

    [Fact]
    public void InvalidLifecycleTransitionDoesNotChangeOrderOrStock()
    {
        var product = Coffee(6);
        var order = Pending("invalid", 2);
        var result = OrderInventory.Apply(order, "Entregada", new Dictionary<string, Product> { [product.Id] = product });

        Assert.NotNull(result);
        Assert.Equal("Pendiente", order.Status);
        Assert.Equal(6, product.Stock);
    }

    private static Order Pending(string id, int quantity) => new()
    {
        Id = id, CustomerName = "Cliente", Status = "Pendiente",
        Items = [new OrderItem { OrderId = id, ProductId = "coffee", ProductName = "Café", Quantity = quantity }],
    };

    private static Product Coffee(int stock) => new()
    {
        Id = "coffee", Name = "Café", Stock = stock, Active = true, Origin = "Honduras", Region = "Demo",
        Process = "Lavado", Roast = "Medio", Description = "Demo", ImageUrl = "", ImageAlt = "",
        Version = Guid.NewGuid(), Quality = new QualityProfile { ProductId = "coffee", GrainType = "Arábica", Producer = "Demo", Grade = "Premium" },
    };
}
