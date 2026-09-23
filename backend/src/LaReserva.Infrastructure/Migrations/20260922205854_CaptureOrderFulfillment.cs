using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CaptureOrderFulfillment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "account_id",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
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
                name: "delivery_notes",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "grind",
                schema: "la_reserva",
                table: "order_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "presentation_grams",
                schema: "la_reserva",
                table: "order_items",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "roast",
                schema: "la_reserva",
                table: "order_items",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_account_id",
                schema: "la_reserva",
                table: "orders",
                column: "account_id");

            migrationBuilder.AddForeignKey(
                name: "fk_orders_customer_accounts_account_id",
                schema: "la_reserva",
                table: "orders",
                column: "account_id",
                principalSchema: "la_reserva",
                principalTable: "customer_accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_orders_customer_accounts_account_id",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "ix_orders_account_id",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "account_id",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "city",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_address",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_notes",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "phone",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "grind",
                schema: "la_reserva",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "presentation_grams",
                schema: "la_reserva",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "roast",
                schema: "la_reserva",
                table: "order_items");
        }
    }
}
