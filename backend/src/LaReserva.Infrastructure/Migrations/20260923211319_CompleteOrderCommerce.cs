using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CompleteOrderCommerce : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "completed_at",
                schema: "la_reserva",
                table: "orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "history_json",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "request_hash",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "request_id",
                schema: "la_reserva",
                table: "orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "terms_json",
                schema: "la_reserva",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_request_id",
                schema: "la_reserva",
                table: "orders",
                column: "request_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_orders_request_id",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "completed_at",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "history_json",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "request_hash",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "request_id",
                schema: "la_reserva",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "terms_json",
                schema: "la_reserva",
                table: "orders");
        }
    }
}
