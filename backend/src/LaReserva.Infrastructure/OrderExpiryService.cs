using LaReserva.Application;
using LaReserva.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LaReserva.Infrastructure;

public sealed class OrderExpiryService(IServiceScopeFactory scopes, TimeProvider clock) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (await timer.WaitForNextTickAsync(stoppingToken)) await ExpireAsync(stoppingToken);
    }

    internal async Task ExpireAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
        var policy = await db.OperationalPolicies.SingleOrDefaultAsync(value => value.Id == 1, cancellationToken);
        if (policy is null || !policy.AutomaticExpiryEnabled) return;
        var cutoff = clock.GetUtcNow().AddHours(-policy.PendingOrderExpiryHours);
        var orders = await db.Orders.Include(value => value.Items)
            .Where(value => (value.Status == "Pendiente" || value.Status == "En revisión") && value.CreatedAt <= cutoff)
            .ToListAsync(cancellationToken);
        if (orders.Count == 0) return;
        var ids = orders.SelectMany(value => value.Items).Select(value => value.ProductId).Distinct().ToArray();
        var products = await db.Products.Where(value => ids.Contains(value.Id)).ToDictionaryAsync(value => value.Id, cancellationToken);
        foreach (var order in orders)
        {
            if (OrderInventory.Apply(order, "Vencida", products) is not null) continue;
            db.AuditEntries.Add(new AuditEntry { ActorId = "system", Action = "Vencer orden", Entity = "Orden", EntityId = order.Id, OccurredAt = clock.GetUtcNow() });
        }
        await db.SaveChangesAsync(cancellationToken);
    }
}
