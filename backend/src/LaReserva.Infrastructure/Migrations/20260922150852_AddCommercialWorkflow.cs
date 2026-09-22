using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommercialWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "history_json",
                schema: "la_reserva",
                table: "commercial_requests",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "status",
                schema: "la_reserva",
                table: "commercial_requests",
                type: "text",
                nullable: false,
                defaultValue: "Nueva");

            migrationBuilder.AddColumn<Guid>(
                name: "version",
                schema: "la_reserva",
                table: "commercial_requests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_commercial_requests_assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests",
                column: "assigned_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_commercial_requests_users_assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests",
                column: "assigned_user_id",
                principalSchema: "la_reserva",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_commercial_requests_users_assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests");

            migrationBuilder.DropIndex(
                name: "ix_commercial_requests_assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests");

            migrationBuilder.DropColumn(
                name: "assigned_user_id",
                schema: "la_reserva",
                table: "commercial_requests");

            migrationBuilder.DropColumn(
                name: "history_json",
                schema: "la_reserva",
                table: "commercial_requests");

            migrationBuilder.DropColumn(
                name: "status",
                schema: "la_reserva",
                table: "commercial_requests");

            migrationBuilder.DropColumn(
                name: "version",
                schema: "la_reserva",
                table: "commercial_requests");
        }
    }
}
