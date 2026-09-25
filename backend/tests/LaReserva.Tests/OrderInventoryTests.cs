using LaReserva.Application;
using LaReserva.Domain;

namespace LaReserva.Tests;

public sealed class OrderInventoryTests
{
    [Fact]
    public void ConfirmationAggregatesLinesAndCommitsInventoryOnce()
    {
        var product = Coffee(5);
        var order = Pending(3, 3);
        Assert.NotNull(OrderInventory.Apply(order, "Confirmada", new Dictionary<string, Product> { [product.Id] = product }));
        Assert.Equal(5, product.Stock);
        Assert.Equal("Pendiente", order.Status);
        order.Items[1].Quantity = 2;
        Assert.Null(OrderInventory.Apply(order, "Confirmada", new Dictionary<string, Product> { [product.Id] = product }));
        Assert.Equal(0, product.Stock);
        Assert.True(order.StockReserved);
        Assert.True(order.StockCommitted);
        Assert.Null(OrderInventory.Apply(order, "Confirmada", new Dictionary<string, Product> { [product.Id] = product }));
        Assert.Equal(0, product.Stock);
    }

    [Fact]
    public void InsufficientOrInactiveStockLeavesOrderPending()
    {
        var product = Coffee(10);
        var order = Pending(11);
        var products = new Dictionary<string, Product> { [product.Id] = product };
        Assert.NotNull(OrderInventory.Apply(order, "Confirmada", products));
        Assert.Equal(10, product.Stock);
        Assert.Equal("Pendiente", order.Status);
        product.Active = false;
        Assert.NotNull(OrderInventory.Apply(Pending(1), "Confirmada", products));
    }

    [Theory]
    [InlineData("Cancelada")]
    [InlineData("Vencida")]
    public void CancellationOrExpiryReturnsCommittedInventory(string finalStatus)
    {
        var product = Coffee(10);
        var order = Pending(2);
        var products = new Dictionary<string, Product> { [product.Id] = product };
        Assert.Null(OrderInventory.Apply(order, "Confirmada", products));
        Assert.Equal(8, product.Stock);
        Assert.Null(OrderInventory.Apply(order, finalStatus, products));
        Assert.Equal(10, product.Stock);
        Assert.False(order.StockCommitted);
    }

    private static Order Pending(params int[] quantities) => new()
    {
        Id = "order", CustomerName = "Demo", Status = "Pendiente",
        Items = quantities.Select(q => new OrderItem { OrderId = "order", ProductId = "coffee", ProductName = "Demo", Quantity = q }).ToList(),
    };

    private static Product Coffee(int stock) => new()
    {
        Id = "coffee", Name = "Demo", Stock = stock, Active = true, Origin = "Honduras", Region = "Demo",
        Process = "Lavado", Roast = "Medio", Description = "Demo", ImageUrl = "", ImageAlt = "",
        Quality = new QualityProfile { ProductId = "coffee", GrainType = "Arábica", Producer = "Demo", Grade = "Premium" },
    };
}
