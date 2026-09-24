using LaReserva.Application;
using LaReserva.Domain;

namespace LaReserva.Tests;

public sealed class CommerceRulesTests
{
    [Theory]
    [InlineData(5, 5)]
    [InlineData(14, 5)]
    [InlineData(15, 8)]
    [InlineData(29, 8)]
    [InlineData(30, 10)]
    public void WholesaleUsesActualWeightAndTierBoundaries(int bags, int percent)
    {
        var products = Products();
        var quote = CommerceRules.Quote(new([new("p-blend", bags)], "Tegucigalpa", true), products, true);
        Assert.Equal(bags, quote.Terms.Kilograms);
        Assert.Equal(320m * bags * percent / 100, quote.Terms.DiscountLps);
        Assert.Equal(0m, quote.Terms.ShippingLps);
    }

    [Fact]
    public void ShippingUnknownAndDisabledScenarioNeverInventATariff()
    {
        var products = Products();
        Assert.Equal(80m, CommerceRules.Quote(new([new("p-blend", 1)], " Tegucigalpa "), products, true).Terms.ShippingLps);
        Assert.Null(CommerceRules.Quote(new([new("p-blend", 1)], "Otra ciudad"), products, true).Terms.ShippingLps);
        Assert.Null(CommerceRules.Quote(new([new("p-blend", 1)], "Tegucigalpa"), products, false).Terms.ShippingLps);
        Assert.Throws<ArgumentException>(() => CommerceRules.Quote(new([new("p-blend", 4)], "Tegucigalpa", true), products, true));
        Assert.Throws<ArgumentException>(() => CommerceRules.Quote(new([new("p-blend", 5)], "Tegucigalpa", true), products, false));
        products["p-blend"].PriceLps = 210m;
        Assert.Equal(80m, CommerceRules.Quote(new([new("p-blend", 5)], "Tegucigalpa", true), products, true).Terms.ShippingLps); // 1050 - 52.50 < 1000
    }

    [Fact]
    public void SalesUseCompletionTimeAndHondurasDayBoundaries()
    {
        var period = ReportRules.Period("2026-09-01", "2026-09-01", DateTimeOffset.UtcNow);
        Order Sale(string id, string status, DateTimeOffset? date) => new() { Id = id, CustomerName = "Demo", Status = status, CompletedAt = date, TotalLps = 100, Items = [new() { OrderId = id, ProductId = "coffee", ProductName = "Café", Quantity = 2 }] };
        var orders = new[] { Sale("in", "Finalizada", period.Start), Sale("out", "Finalizada", period.End), Sale("old", "Finalizada", null), Sale("pending", "Pendiente", period.Start), Sale("cancelled", "Cancelada", period.Start) };
        var sales = ReportRules.Sales(orders, period);
        Assert.Equal("in", Assert.Single(sales).Id);
        Assert.Equal(2, Assert.Single(ReportRules.Ranking(sales)).Units);
    }

    private static Dictionary<string, Product> Products() => new() { ["p-blend"] = new() { Id = "p-blend", Name = "Demo", PresentationGrams = 1000, PriceLps = 320, Active = true, Origin = "Honduras", Region = "Demo", Process = "Lavado", Roast = "Medio", Description = "Demo", ImageUrl = "", ImageAlt = "", Quality = null! } };
}
