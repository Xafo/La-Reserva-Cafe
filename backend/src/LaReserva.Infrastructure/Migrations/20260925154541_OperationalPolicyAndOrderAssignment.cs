using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations;

public partial class OperationalPolicyAndOrderAssignment : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "assigned_user_id", schema: "la_reserva", table: "orders", type: "text", nullable: true);
        migrationBuilder.CreateIndex(
            name: "ix_orders_assigned_user_id", schema: "la_reserva", table: "orders", column: "assigned_user_id");
        migrationBuilder.AddForeignKey(
            name: "fk_orders_users_assigned_user_id", schema: "la_reserva", table: "orders", column: "assigned_user_id",
            principalSchema: "la_reserva", principalTable: "users", principalColumn: "id", onDelete: ReferentialAction.Restrict);
        migrationBuilder.CreateTable(
            name: "operational_policies", schema: "la_reserva",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false),
                pending_order_expiry_hours = table.Column<int>(type: "integer", nullable: false),
                automatic_expiry_enabled = table.Column<bool>(type: "boolean", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
            },
            constraints: table => table.PrimaryKey("pk_operational_policies", x => x.id));
        migrationBuilder.InsertData(
            schema: "la_reserva", table: "operational_policies",
            columns: new[] { "id", "automatic_expiry_enabled", "pending_order_expiry_hours", "updated_at" },
            values: new object[] { 1, true, 48, new DateTimeOffset(2026, 9, 25, 0, 0, 0, TimeSpan.Zero) });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "operational_policies", schema: "la_reserva");
        migrationBuilder.DropForeignKey(name: "fk_orders_users_assigned_user_id", schema: "la_reserva", table: "orders");
        migrationBuilder.DropIndex(name: "ix_orders_assigned_user_id", schema: "la_reserva", table: "orders");
        migrationBuilder.DropColumn(name: "assigned_user_id", schema: "la_reserva", table: "orders");
    }
}
