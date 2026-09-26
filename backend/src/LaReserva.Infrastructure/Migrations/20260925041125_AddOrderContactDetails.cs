using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderContactDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS customer_email text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS customer_phone text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS delivery_address text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS delivery_city text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS delivery_notes text;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "customer_email",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "customer_phone",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_address",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_city",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_notes",
                schema: "la_reserva",
                table: "orders");
        }
    }
}
