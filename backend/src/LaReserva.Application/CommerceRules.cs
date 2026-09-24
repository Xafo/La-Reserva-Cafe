using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LaReserva.Domain;

namespace LaReserva.Application;

public sealed record QuoteRequest(CreateOrderItemRequest[] Items, string City, bool Wholesale = false);
public sealed record OrderTerms(string Version, bool Scenario, decimal SubtotalLps, decimal DiscountLps,
    decimal? ShippingLps, decimal TotalLps, decimal Kilograms, bool Wholesale, string? DeliveryNote = null);
public sealed record OrderQuote(OrderTerms Terms, string Token);
public sealed record DeliveryQuoteRequest(decimal ShippingLps, string Note, string ExpectedToken);
public sealed record OrderEvent(DateTimeOffset At, string Actor, string Status, string Note);

public static class CommerceRules
{
    public static readonly JsonElement Scenario = JsonDocument.Parse(typeof(CommerceRules).Assembly
        .GetManifestResourceStream("commerce-scenario-v1.json")!).RootElement.Clone();
    public static string[] WholesaleIds => Scenario.GetProperty("commercial").GetProperty("wholesale").GetProperty("scopeProductIds").EnumerateArray().Select(x => x.GetString()!).ToArray();
    public static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    public static string Token(OrderTerms terms) => Hash(JsonSerializer.Serialize(terms));

    public static OrderQuote Quote(QuoteRequest request, IReadOnlyDictionary<string, Product> products, bool scenario)
    {
        if (request.Items is null || request.Items.Length is < 1 or > 50 || string.IsNullOrWhiteSpace(request.City) || request.City.Length > 120
            || request.Items.Any(i => i is null || string.IsNullOrWhiteSpace(i.ProductId) || i.Quantity is < 1 or > 1000 || !products.ContainsKey(i.ProductId))
            || request.Items.GroupBy(i => i.ProductId).Any(g => g.Sum(i => i.Quantity) > 1000))
            throw new ArgumentException("Revisá ciudad, productos y cantidades de la cotización.");
        var subtotal = request.Items.Sum(i => products[i.ProductId].PriceLps * i.Quantity);
        var kg = request.Items.Sum(i => (decimal)products[i.ProductId].PresentationGrams * i.Quantity) / 1000m;
        decimal discountPct = 0;
        var rules = Scenario.GetProperty("commercial");
        if (request.Wholesale)
        {
            if (!scenario) throw new ArgumentException("Las tarifas mayoristas aún requieren propuesta comercial.");
            var wholesale = rules.GetProperty("wholesale");
            if (kg < wholesale.GetProperty("minimumKg").GetDecimal() || request.Items.Any(i => !WholesaleIds.Contains(i.ProductId)))
                throw new ArgumentException("El escenario mayorista requiere al menos 5 kg y solo cafés del catálogo empresarial.");
            discountPct = wholesale.GetProperty("tiers").EnumerateArray().Where(t => kg >= t.GetProperty("minKg").GetDecimal()).Last().GetProperty("discountPct").GetDecimal();
        }
        var discount = decimal.Round(subtotal * discountPct / 100, 2, MidpointRounding.AwayFromZero);
        var shipping = rules.GetProperty("shipping");
        decimal? fee = scenario && shipping.GetProperty("coverage").EnumerateArray().Any(c => string.Equals(c.GetString(), request.City.Trim(), StringComparison.OrdinalIgnoreCase))
            ? (subtotal - discount >= shipping.GetProperty("freeFromProductSubtotalLps").GetDecimal() ? 0 : shipping.GetProperty("feeLps").GetDecimal()) : null;
        var terms = new OrderTerms(scenario ? "demo-v1" : "manual-v1", scenario, subtotal, discount, fee, subtotal - discount + (fee ?? 0), kg, request.Wholesale);
        return new(terms, Token(terms));
    }

    public static void Record(Order order, string actor, string note)
    {
        var events = JsonSerializer.Deserialize<List<OrderEvent>>(order.HistoryJson) ?? [];
        events.Add(new(DateTimeOffset.UtcNow, actor, order.Status, note));
        order.HistoryJson = JsonSerializer.Serialize(events);
    }
}
