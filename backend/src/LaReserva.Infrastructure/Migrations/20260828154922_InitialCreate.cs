using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "la_reserva");

            migrationBuilder.CreateTable(
                name: "customers",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "text", nullable: false),
                    total_orders = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    customer_name = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    total_lps = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "products",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    origin = table.Column<string>(type: "text", nullable: false),
                    region = table.Column<string>(type: "text", nullable: false),
                    process = table.Column<string>(type: "text", nullable: false),
                    roast = table.Column<string>(type: "text", nullable: false),
                    presentation_grams = table.Column<int>(type: "integer", nullable: false),
                    price_lps = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    stock = table.Column<int>(type: "integer", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    image_alt = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_products", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    subject_id = table.Column<string>(type: "text", nullable: false),
                    subject_type = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    replaced_by_hash = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order_id = table.Column<string>(type: "text", nullable: false),
                    product_id = table.Column<string>(type: "text", nullable: false),
                    product_name = table.Column<string>(type: "text", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_price_lps = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_items_orders_order_id",
                        column: x => x.order_id,
                        principalSchema: "la_reserva",
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_accounts",
                schema: "la_reserva",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    recommended_product_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customer_accounts", x => x.id);
                    table.ForeignKey(
                        name: "fk_customer_accounts_products_recommended_product_id",
                        column: x => x.recommended_product_id,
                        principalSchema: "la_reserva",
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "quality_profiles",
                schema: "la_reserva",
                columns: table => new
                {
                    product_id = table.Column<string>(type: "text", nullable: false),
                    grain_type = table.Column<string>(type: "text", nullable: false),
                    altitude_masl = table.Column<int>(type: "integer", nullable: false),
                    humidity_pct = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    harvest_date = table.Column<DateOnly>(type: "date", nullable: false),
                    producer = table.Column<string>(type: "text", nullable: false),
                    grade = table.Column<string>(type: "text", nullable: false),
                    cupping_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    notes = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quality_profiles", x => x.product_id);
                    table.ForeignKey(
                        name: "fk_quality_profiles_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "la_reserva",
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "customer_preferences",
                schema: "la_reserva",
                columns: table => new
                {
                    account_id = table.Column<string>(type: "text", nullable: false),
                    goals = table.Column<string[]>(type: "text[]", nullable: false),
                    brew_methods = table.Column<string[]>(type: "text[]", nullable: false),
                    drink_styles = table.Column<string[]>(type: "text[]", nullable: false),
                    flavor_families = table.Column<string[]>(type: "text[]", nullable: false),
                    intensity = table.Column<string>(type: "text", nullable: false),
                    budget = table.Column<string>(type: "text", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customer_preferences", x => x.account_id);
                    table.ForeignKey(
                        name: "fk_customer_preferences_customer_accounts_account_id",
                        column: x => x.account_id,
                        principalSchema: "la_reserva",
                        principalTable: "customer_accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_customer_accounts_email",
                schema: "la_reserva",
                table: "customer_accounts",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_customer_accounts_recommended_product_id",
                schema: "la_reserva",
                table: "customer_accounts",
                column: "recommended_product_id");

            migrationBuilder.CreateIndex(
                name: "ix_customers_email",
                schema: "la_reserva",
                table: "customers",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_order_items_order_id",
                schema: "la_reserva",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_subject_id_subject_type",
                schema: "la_reserva",
                table: "refresh_tokens",
                columns: new[] { "subject_id", "subject_type" });

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token_hash",
                schema: "la_reserva",
                table: "refresh_tokens",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                schema: "la_reserva",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "customer_preferences",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "customers",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "order_items",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "quality_profiles",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "refresh_tokens",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "users",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "customer_accounts",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "orders",
                schema: "la_reserva");

            migrationBuilder.DropTable(
                name: "products",
                schema: "la_reserva");
        }
    }
}
