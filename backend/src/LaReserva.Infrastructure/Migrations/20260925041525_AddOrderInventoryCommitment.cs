using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderInventoryCommitment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "stock_committed",
                schema: "la_reserva",
                table: "orders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE la_reserva.orders SET status = 'En revisión' WHERE status = 'Aprobada';
                UPDATE la_reserva.orders SET status = 'Entregada' WHERE status = 'Finalizada';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "stock_committed",
                schema: "la_reserva",
                table: "orders");
        }
    }
}
