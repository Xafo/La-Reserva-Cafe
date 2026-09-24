using ClosedXML.Excel;
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
        page.Header().Text("Directo Cafe · Orden de compra").FontSize(18).SemiBold();
        page.Content().Column(column =>
        {
            column.Spacing(8);
            column.Item().Text($"Orden: {order.Id}");
            column.Item().Text($"Cliente: {order.CustomerName}");
            column.Item().Text($"Fecha: {order.CreatedAt:yyyy-MM-dd HH:mm}");
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns => { columns.RelativeColumn(4); columns.RelativeColumn(); columns.RelativeColumn(); });
                table.Header(header => { header.Cell().Text("Producto").SemiBold(); header.Cell().Text("Cant.").SemiBold(); header.Cell().Text("Total").SemiBold(); });
                foreach (var item in order.Items) { table.Cell().Text(item.ProductName); table.Cell().Text(item.Quantity.ToString()); table.Cell().Text($"L {item.UnitPriceLps * item.Quantity:N2}"); }
            });
            column.Item().AlignRight().Text($"Total: L {order.TotalLps:N2}").FontSize(14).SemiBold();
        });
    })).GeneratePdf();

    public static byte[] Excel(string type, IReadOnlyCollection<Product> products, IReadOnlyCollection<Order> orders)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Reporte");
        if (type == "inventario" || type == "productos")
        {
            sheet.Cell(1, 1).Value = "Producto"; sheet.Cell(1, 2).Value = "Stock"; sheet.Cell(1, 3).Value = "Precio LPS";
            var row = 2; foreach (var item in products) { sheet.Cell(row, 1).Value = item.Name; sheet.Cell(row, 2).Value = item.Stock; sheet.Cell(row++, 3).Value = item.PriceLps; }
        }
        else
        {
            sheet.Cell(1, 1).Value = "Orden"; sheet.Cell(1, 2).Value = "Cliente"; sheet.Cell(1, 3).Value = "Estado"; sheet.Cell(1, 4).Value = "Total LPS";
            var row = 2; foreach (var item in orders) { sheet.Cell(row, 1).Value = item.Id; sheet.Cell(row, 2).Value = item.CustomerName; sheet.Cell(row, 3).Value = item.Status; sheet.Cell(row++, 4).Value = item.TotalLps; }
        }
        sheet.Columns().AdjustToContents();
        using var stream = new MemoryStream(); workbook.SaveAs(stream); return stream.ToArray();
    }
}
