using LaReserva.Domain;

namespace LaReserva.Application;

public static class OrderInventory
{
    public static string? Apply(Order order, string status, IReadOnlyDictionary<string, Product> products)
    {
        if (order.Status == status) return null;
        if (!(order.Status == "Pendiente" && status is "En revisión" or "Cancelada" or "Vencida"
            || order.Status == "En revisión" && status is "Confirmada" or "Cancelada" or "Vencida"
            || order.Status == "Confirmada" && status is "En preparación" or "Cancelada"
            || order.Status == "En preparación" && status is "Entregada" or "Cancelada"))
            return "Transición inválida para el estado actual del pedido.";

        var quantities = order.Items.GroupBy(i => i.ProductId).ToDictionary(g => g.Key, g => g.Sum(i => (long)i.Quantity));
        if (status == "Confirmada" && !order.StockCommitted)
        {
            if (quantities.Count == 0 || quantities.Any(q => q.Value <= 0 || !products.TryGetValue(q.Key, out var p) || !p.Active || p.Stock < q.Value))
                return "No hay existencias suficientes de todos los cafés activos. El pedido sigue pendiente.";
            foreach (var (id, quantity) in quantities) products[id].Stock -= (int)quantity;
            order.StockCommitted = true;
            order.StockReserved = true;
        }
        else if (status is "Cancelada" or "Vencida" && order.StockCommitted)
        {
            if (quantities.Any(q => !products.TryGetValue(q.Key, out var p) || (long)p.Stock + q.Value > int.MaxValue))
                return "No se puede devolver el inventario. Revisá los productos del pedido.";
            foreach (var (id, quantity) in quantities) products[id].Stock += (int)quantity;
            order.StockCommitted = false;
            order.StockReserved = false;
        }
        // Older orders without a confirmed inventory commitment never manufacture a stock return.
        order.Status = status;
        return null;
    }
}
