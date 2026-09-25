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
            migrationBuilder.AddColumn<string>(
                name: "customer_email",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "customer_phone",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "delivery_address",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "delivery_city",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "delivery_notes",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);
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
