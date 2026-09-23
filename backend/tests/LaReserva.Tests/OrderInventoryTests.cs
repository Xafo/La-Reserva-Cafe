using LaReserva.Application;
using LaReserva.Domain;

namespace LaReserva.Tests;

public sealed class OrderInventoryTests
{
    [Fact]
    public void ApprovalChecksAllLinesAndAggregatesDifferentGrindsBeforeReserving()
    {
        var product = Coffee(5);
        var order = Pending(3, 3);
        Assert.NotNull(OrderInventory.Apply(order, "Aprobada", new Dictionary<string, Product> { [product.Id] = product }));
        Assert.Equal(5, product.Stock);
        Assert.Equal("Pendiente", order.Status);
        order.Items[1].Quantity = 2;
        Assert.Null(OrderInventory.Apply(order, "Aprobada", new Dictionary<string, Product> { [product.Id] = product }));
        Assert.Equal(0, product.Stock);
        Assert.True(order.StockReserved);
    }

    [Fact]
    public void CancelLegacyApprovalNeverCreatesStockAndInactiveProductsCannotBeApproved()
    {
        var product = Coffee(10);
        product.Active = false;
        var order = Pending(1);
        var products = new Dictionary<string, Product> { [product.Id] = product };
        Assert.NotNull(OrderInventory.Apply(order, "Aprobada", products));
        order.Status = "Aprobada";
        Assert.Null(OrderInventory.Apply(order, "Cancelada", products));
        Assert.Equal(10, product.Stock);
        Assert.False(order.StockReserved);
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
