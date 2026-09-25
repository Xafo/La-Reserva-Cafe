using ClosedXML.Excel;
using System.Globalization;
using System.Text.Json;
using LaReserva.Application;
using LaReserva.Domain;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LaReserva.Api;

public static class ReportDocuments
{
    public static byte[] OrderPdf(Order order) => Document.Create(document => document.Page(page =>
    {
        page.Margin(36);
        page.Header().Text("LA RESERVA CAFÉ · Pedido").FontSize(18).SemiBold();
        page.Content().Column(column =>
        {
            column.Spacing(8);
            column.Item().Text($"Orden: {order.Id}");
            column.Item().Text($"Cliente: {order.CustomerName}");
            column.Item().Text($"Teléfono: {order.Phone ?? "No registrado (pedido anterior)"}");
            column.Item().Text($"Entrega: {order.DeliveryAddress ?? "No registrada"} · {order.City ?? "Ciudad no registrada"}");
            if (!string.IsNullOrEmpty(order.DeliveryNotes)) column.Item().Text($"Notas: {order.DeliveryNotes}");
            column.Item().Text($"Estado: {order.Status}");
            column.Item().Text($"Fecha: {order.CreatedAt:yyyy-MM-dd HH:mm}");
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns => { columns.RelativeColumn(4); columns.RelativeColumn(); columns.RelativeColumn(); });
                table.Header(header => { header.Cell().Text("Producto").SemiBold(); header.Cell().Text("Cant.").SemiBold(); header.Cell().Text("Total").SemiBold(); });
                foreach (var item in order.Items) { table.Cell().Text($"{item.ProductName}\n{(item.PresentationGrams is null ? "Presentación no registrada" : $"{item.PresentationGrams} g")} · {item.Roast ?? "Tueste no registrado"} · {item.Grind ?? "Molienda no registrada"}"); table.Cell().Text(item.Quantity.ToString()); table.Cell().Text($"L {item.UnitPriceLps * item.Quantity:N2}"); }
            });
            column.Item().AlignRight().Text($"Importe registrado: L {order.TotalLps:N2}").FontSize(14).SemiBold();
            if (order.ToDto().Terms is { } terms)
            {
                column.Item().Text($"Subtotal: L {terms.SubtotalLps:N2} · Descuento: L {terms.DiscountLps:N2} · Envío: {(terms.ShippingLps is null ? "Por cotizar" : $"L {terms.ShippingLps:N2}")}");
                column.Item().Text($"Condiciones: {terms.Version}{(terms.Scenario ? " · ESCENARIO DE PRUEBA" : " · Propuesta manual")}");
            }
            column.Item().Text("La Reserva Café. Este documento no acredita un pago. Entrega y envío sujetos a confirmación.").FontSize(10);
        });
    })).GeneratePdf();

    public sealed record ReportTable(string Title, string Scope, string[] Headers, List<string[]> Rows);

    public static ReportTable BuildReport(string type, IReadOnlyCollection<Product> products, IReadOnlyCollection<Order> orders, ReportPeriod period, string? status)
    {
        string N(decimal number) => number.ToString("0.##", CultureInfo.InvariantCulture);
        var scope = $"{period.From:yyyy-MM-dd} a {period.To:yyyy-MM-dd} · Honduras (UTC−6). Ventas según fecha de finalización; excluye históricos sin esa fecha. Importes HNL incluyen envío registrado.";
        if (type is "productos" or "inventario")
            return new(type, "Existencias disponibles actuales, descontadas las reservas; no es inventario histórico.", ["ID", "Café", "Activo", "Gramos", "Disponible", "Precio HNL"],
                products.OrderBy(p => p.Id).Select(p => new[] { p.Id, p.Name, p.Active ? "Sí" : "No", N(p.PresentationGrams), N(p.Stock), N(p.PriceLps) }).ToList());
        var sales = ReportRules.Sales(orders, period);
        if (type == "mas-vendidos") return new(type, scope, ["Café", "Unidades finalizadas"], ReportRules.Ranking(sales).Select(p => new[] { p.Name, N(p.Units) }).ToList());
        if (type == "movimientos") return new("Historial de pedidos", scope + " Cambios registrados; no representa entradas manuales de almacén.", ["Pedido", "Fecha", "Estado", "Actor", "Detalle"],
            orders.SelectMany(o => (JsonSerializer.Deserialize<OrderEvent[]>(o.HistoryJson) ?? []).Where(e => period.Contains(e.At)).Select(e => new[] { o.Id, e.At.ToOffset(TimeSpan.FromHours(-6)).ToString("yyyy-MM-dd HH:mm"), e.Status, e.Actor, e.Note })).OrderBy(r => r[1]).ToList());
        var selected = type == "ventas" ? sales : orders.Where(o => period.Contains(o.CreatedAt) && (status is null || o.Status == status)).ToArray();
        return new(type, scope + (type == "ordenes" ? " Pedidos filtrados por fecha de creación y estado seleccionado." : ""), ["Pedido", "Cliente", "Estado", "Fecha", "Total HNL"],
            selected.OrderBy(o => o.CreatedAt).Select(o => new[] { o.Id, o.CustomerName, o.Status, (type == "ventas" ? o.CompletedAt ?? o.CreatedAt : o.CreatedAt).ToOffset(TimeSpan.FromHours(-6)).ToString("yyyy-MM-dd HH:mm"), N(o.TotalLps) }).ToList());
    }

    public static byte[] ReportExcel(ReportTable report)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Reporte");
        sheet.Cell(1, 1).Value = $"La Reserva Café · {report.Title}";
        sheet.Cell(2, 1).Value = report.Scope;
        for (var c = 0; c < report.Headers.Length; c++) sheet.Cell(4, c + 1).Value = report.Headers[c];
        for (var r = 0; r < report.Rows.Count; r++)
            for (var c = 0; c < report.Headers.Length; c++)
            {
                var cell = sheet.Cell(r + 5, c + 1); var value = report.Rows[r][c];
                if (decimal.TryParse(value, NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var number)) cell.Value = number;
                else cell.Value = value;
            }
        sheet.Row(4).Style.Font.Bold = true; sheet.SheetView.FreezeRows(4);
        sheet.Columns().AdjustToContents(4, Math.Max(5, report.Rows.Count + 4));
        foreach (var column in sheet.ColumnsUsed()) column.Width = Math.Min(55, Math.Max(15, column.Width));
        sheet.RowsUsed().Style.Alignment.WrapText = true;
        using var stream = new MemoryStream(); workbook.SaveAs(stream); return stream.ToArray();
    }

    public static byte[] ReportPdf(ReportTable report) => Document.Create(document => document.Page(page =>
    {
        page.Size(PageSizes.A4.Landscape()); page.Margin(24); page.DefaultTextStyle(s => s.FontSize(9));
        page.Header().Text($"La Reserva Café · {report.Title}").FontSize(17).SemiBold();
        page.Content().Column(column =>
        {
            column.Spacing(10); column.Item().Text(report.Scope);
            if (report.Rows.Count == 0) column.Item().Text("Sin registros para este período.");
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(cols => { foreach (var _ in report.Headers) cols.RelativeColumn(); });
                table.Header(header => { foreach (var value in report.Headers) header.Cell().Padding(4).Text(value).SemiBold(); });
                foreach (var row in report.Rows) foreach (var value in row) table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(4).Text(value);
            });
        });
        page.Footer().AlignRight().Text(text => { text.Span("Página "); text.CurrentPageNumber(); });
    })).GeneratePdf();

}
