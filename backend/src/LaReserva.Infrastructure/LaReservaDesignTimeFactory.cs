using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LaReserva.Infrastructure;

// Genera migraciones sin arrancar la API, sembrar datos ni requerir secretos.
public sealed class LaReservaDesignTimeFactory : IDesignTimeDbContextFactory<LaReservaDbContext>
{
    public LaReservaDbContext CreateDbContext(string[] args) => new(
        new DbContextOptionsBuilder<LaReservaDbContext>()
            .UseNpgsql("Host=localhost;Database=design_time;Username=design_time")
            .UseSnakeCaseNamingConvention().Options);
}
