using System.Text.Json;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LaReserva.Tests;

public sealed class TokenServiceTests
{
    [Fact]
    public async Task RefreshToken_IsHashedAndRotated()
    {
        await using var db = CreateDbContext();
        db.Users.Add(new User
        {
            Id = "u-1",
            Name = "Admin",
            Email = "admin@lareserva.hn",
            Role = "Administrador",
            PasswordHash = "hash",
        });
        await db.SaveChangesAsync();
        var service = CreateService(db);

        var first = await service.CreateSessionAsync("u-1", "admin@lareserva.hn", "Administrador", "team", default);
        var storedFirst = await db.RefreshTokens.SingleAsync();

        Assert.NotEqual(first.RefreshToken, storedFirst.TokenHash);
        Assert.Null(storedFirst.RevokedAt);

        var second = await service.RefreshAsync(first.RefreshToken, default);

        Assert.NotNull(second);
        Assert.NotEqual(first.RefreshToken, second.RefreshToken);
        Assert.NotNull(storedFirst.RevokedAt);
        Assert.Equal(2, await db.RefreshTokens.CountAsync());
        Assert.Null(await service.RefreshAsync(first.RefreshToken, default));
    }

    [Fact]
    public void CustomerAccountDto_DoesNotSerializePasswordData()
    {
        var account = new CustomerAccount
        {
            Id = "a-1",
            Name = "Cliente",
            Email = "cliente@example.com",
            PasswordHash = "secret-hash",
            Phone = "123",
            City = "Tegucigalpa",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var json = JsonSerializer.Serialize(account.ToDto());

        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("secret-hash", json, StringComparison.Ordinal);
    }

    private static LaReservaDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<LaReservaDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LaReservaDbContext(options);
    }

    private static TokenService CreateService(LaReservaDbContext db) => new(
        db,
        Options.Create(new JwtOptions
        {
            Issuer = "tests",
            Audience = "tests",
            SigningKey = "a-test-signing-key-with-at-least-32-bytes",
            AccessTokenMinutes = 15,
            RefreshTokenDays = 7,
        }),
        TimeProvider.System);
}
