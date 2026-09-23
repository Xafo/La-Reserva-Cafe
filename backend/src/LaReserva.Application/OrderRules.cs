namespace LaReserva.Application;

public static class OrderRules
{
    public static readonly string[] Grinds = ["En grano", "Espresso", "Filtro", "Prensa francesa"];

    public static string? Validate(CreateOrderRequest request)
    {
        if (!Required(request.CustomerName, 150) || !Required(request.Phone, 40)
            || !Required(request.DeliveryAddress, 500) || !Required(request.City, 120)
            || request.DeliveryNotes?.Length > 1000)
            return "Completá nombre (hasta 150 caracteres), teléfono (40), dirección (500) y ciudad (120). Las notas admiten hasta 1000 caracteres.";
        if (request.Items is null || request.Items.Length is < 1 or > 50
            || request.Items.Any(item => item is null || !Required(item.ProductId, 150)
                || item.Quantity is < 1 or > 1000 || !Grinds.Contains(item.Grind)))
            return "Incluí de 1 a 50 líneas, con producto, cantidad de 1 a 1000 y una molienda válida.";
        if (request.Items.GroupBy(item => item.ProductId).Any(group => group.Sum(item => item.Quantity) > 1000))
            return "El máximo por café es de 1000 unidades por pedido.";
        return null;
    }

    private static bool Required(string? value, int max) => !string.IsNullOrWhiteSpace(value) && value.Length <= max;
}
