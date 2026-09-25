using System.Globalization;
using LaReserva.Domain;

namespace LaReserva.Application;

public sealed record ReportPeriod(DateOnly From, DateOnly To)
{
    public DateTimeOffset Start => new DateTimeOffset(From.ToDateTime(TimeOnly.MinValue), TimeSpan.FromHours(-6)).ToUniversalTime();
    public DateTimeOffset End => new DateTimeOffset(To.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.FromHours(-6)).ToUniversalTime();
    public bool Contains(DateTimeOffset? at) => at >= Start && at < End;
}

public static class ReportRules
{
    public static ReportPeriod Period(string? from, string? to, DateTimeOffset now)
    {
        var today = DateOnly.FromDateTime(now.ToOffset(TimeSpan.FromHours(-6)).DateTime);
        if (from is null && to is null) return new(new(today.Year, today.Month, 1), today);
        if (!DateOnly.TryParseExact(from, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var start)
            || !DateOnly.TryParseExact(to, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var end)
            || start > end || end.DayNumber - start.DayNumber > 366 || end == DateOnly.MaxValue)
            throw new ArgumentException("Indicá desde/hasta válidos, en orden y con un máximo de 367 días.");
        return new(start, end);
    }
    public static Order[] Sales(IEnumerable<Order> orders, ReportPeriod period) => orders
        .Where(o => o.Status is "Confirmada" or "En preparación" or "Entregada")
        .Where(o => period.Contains(o.CompletedAt ?? o.CreatedAt)).ToArray();
    public static TopProductDto[] Ranking(IEnumerable<Order> sales) => sales.SelectMany(o => o.Items)
        .GroupBy(i => i.ProductId).Select(g => new TopProductDto(g.First().ProductName, g.Sum(i => i.Quantity)))
        .OrderByDescending(x => x.Units).ThenBy(x => x.Name, StringComparer.Ordinal).ToArray();
}
