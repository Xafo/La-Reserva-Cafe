using LaReserva.Domain;

namespace LaReserva.Application;

public static class OrderInventory
{
    public static string? Apply(Order order, string status, IReadOnlyDictionary<string, Product> products)
    {
        if (order.Status == status) return null;
        if (!(order.Status == "Pendiente" && status is "Aprobada" or "Cancelada"
            || order.Status == "Aprobada" && status is "Finalizada" or "Cancelada"))
            return "Transición inválida. Aprobá antes de finalizar; los pedidos cancelados o finalizados no se reabren.";

        var quantities = order.Items.GroupBy(i => i.ProductId).ToDictionary(g => g.Key, g => g.Sum(i => (long)i.Quantity));
        if (status == "Aprobada")
        {
            if (quantities.Count == 0 || quantities.Any(q => q.Value <= 0 || !products.TryGetValue(q.Key, out var p) || !p.Active || p.Stock < q.Value))
                return "No hay existencias suficientes de todos los cafés activos. El pedido sigue pendiente.";
            foreach (var (id, quantity) in quantities) products[id].Stock -= (int)quantity;
            order.StockReserved = true;
        }
        else if (status == "Cancelada" && order.StockReserved)
        {
            if (quantities.Any(q => !products.TryGetValue(q.Key, out var p) || (long)p.Stock + q.Value > int.MaxValue))
                return "No se puede devolver el inventario. Revisá los productos del pedido.";
            foreach (var (id, quantity) in quantities) products[id].Stock += (int)quantity;
            order.StockReserved = false;
        }
        // Older approved orders have no reservation evidence; never manufacture a stock return.
        order.Status = status;
        return null;
    }
}
