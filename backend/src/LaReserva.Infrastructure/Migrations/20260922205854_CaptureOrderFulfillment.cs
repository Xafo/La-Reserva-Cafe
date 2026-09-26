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
            // This migration was partially applied in production before it was
            // recorded in EF's history. Make retries safe for that database state.
            migrationBuilder.Sql("""
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS account_id text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS city text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS delivery_address text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS delivery_notes text;
                ALTER TABLE la_reserva.orders ADD COLUMN IF NOT EXISTS phone text;
                ALTER TABLE la_reserva.order_items ADD COLUMN IF NOT EXISTS grind text;
                ALTER TABLE la_reserva.order_items ADD COLUMN IF NOT EXISTS presentation_grams integer;
                ALTER TABLE la_reserva.order_items ADD COLUMN IF NOT EXISTS roast text;
                CREATE INDEX IF NOT EXISTS ix_orders_account_id ON la_reserva.orders (account_id);

                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.table_constraints
                        WHERE constraint_schema = 'la_reserva'
                          AND table_name = 'orders'
                          AND constraint_name = 'fk_orders_customer_accounts_account_id'
                    ) THEN
                        ALTER TABLE la_reserva.orders
                            ADD CONSTRAINT fk_orders_customer_accounts_account_id
                            FOREIGN KEY (account_id)
                            REFERENCES la_reserva.customer_accounts (id)
                            ON DELETE SET NULL;
                    END IF;
                END $$;
                """);
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
