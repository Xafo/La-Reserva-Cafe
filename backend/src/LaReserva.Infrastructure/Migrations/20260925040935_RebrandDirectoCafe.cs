using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LaReserva.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RebrandDirectoCafe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE la_reserva.products
                SET name = 'Directo Cafe Blend',
                    image_alt = REPLACE(image_alt, 'La Reserva', 'Directo Cafe')
                WHERE id = 'p-blend';

                UPDATE la_reserva.products
                SET image_alt = REPLACE(image_alt, 'La Reserva', 'Directo Cafe')
                WHERE image_alt LIKE '%La Reserva%';

                UPDATE la_reserva.quality_profiles
                SET producer = 'Directo Cafe'
                WHERE producer = 'Tostaduria La Reserva';

                UPDATE la_reserva.order_items
                SET product_name = 'Directo Cafe Blend'
                WHERE product_id = 'p-blend' AND product_name = 'La Reserva Blend';

                UPDATE la_reserva.users
                SET email = REPLACE(email, '@lareserva.hn', '@directocafe.hn')
                WHERE email LIKE '%@lareserva.hn';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE la_reserva.products
                SET name = 'La Reserva Blend',
                    image_alt = REPLACE(image_alt, 'Directo Cafe', 'La Reserva')
                WHERE id = 'p-blend';

                UPDATE la_reserva.products
                SET image_alt = REPLACE(image_alt, 'Directo Cafe', 'La Reserva')
                WHERE image_alt LIKE '%Directo Cafe%';

                UPDATE la_reserva.quality_profiles
                SET producer = 'Tostaduria La Reserva'
                WHERE producer = 'Directo Cafe';

                UPDATE la_reserva.order_items
                SET product_name = 'La Reserva Blend'
                WHERE product_id = 'p-blend' AND product_name = 'Directo Cafe Blend';

                UPDATE la_reserva.users
                SET email = REPLACE(email, '@directocafe.hn', '@lareserva.hn')
                WHERE email LIKE '%@directocafe.hn';
                """);
        }
    }
}
