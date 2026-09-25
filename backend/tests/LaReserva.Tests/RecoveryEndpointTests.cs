using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using LaReserva.Api;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LaReserva.Tests;

public sealed class RecoveryEndpointTests
{
    [Fact]
    public async Task Recovery_UsesSingleUseTokensAndRevokesSessionsWithoutExternalEmail()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        builder.Configuration["Commerce:ScenarioEnabled"] = "true";
        var database = Guid.NewGuid().ToString();
        var postgres = Environment.GetEnvironmentVariable("DIRECTO_SECURITY_TEST_CONNECTION");
        if (!string.IsNullOrEmpty(postgres))
        {
            var connection = new Npgsql.NpgsqlConnectionStringBuilder(postgres);
            if (connection.Host != "127.0.0.1" || connection.Database?.StartsWith("directo_test_", StringComparison.Ordinal) != true)
                throw new InvalidOperationException("La prueba PostgreSQL requiere una base directo_test_* en 127.0.0.1.");
            builder.Services.AddDbContext<LaReservaDbContext>(o => o.UseNpgsql(postgres).UseSnakeCaseNamingConvention());
        }
        else builder.Services.AddDbContext<LaReservaDbContext>(o => o.UseInMemoryDatabase(database).ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning)));
        builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        builder.Services.AddScoped<IPasswordHasher<CustomerAccount>, PasswordHasher<CustomerAccount>>();
        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddSingleton<IOptions<JwtOptions>>(Options.Create(new JwtOptions { Issuer = "test", Audience = "test", SigningKey = new string('x', 64) }));
        builder.Services.AddAuthentication("test").AddScheme<AuthenticationSchemeOptions, TestIdentity>("test", _ => { });
        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("Team", p => p.RequireClaim("subject_type", "team"))
            .AddPolicy("CustomersView", p => p.RequireRole("Administrador", "Compras", "Ventas", "Supervisor"))
            .AddPolicy("ReportsView", p => p.RequireRole("Administrador", "Ventas", "Supervisor"))
            .AddPolicy("ProductsWrite", p => p.RequireRole("Administrador", "Compras", "Supervisor"))
            .AddPolicy("CustomersWrite", p => p.RequireRole("Administrador", "Compras", "Ventas"));
        var email = new FakeEmail();
        builder.Services.AddSingleton<IPasswordResetEmail>(email);
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapLaReservaEndpoints();
        await app.StartAsync();
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
        if (!string.IsNullOrEmpty(postgres)) await db.Database.MigrateAsync();
        var hasher = new PasswordHasher<User>();
        var user = new User { Id = "recovery-user", Name = "Demo", Email = "recovery@example.com", Role = "Administrador", Active = true, PasswordHash = "" };
        user.PasswordHash = hasher.HashPassword(user, "Original-test-password-123!");
        db.Users.Add(user); await db.SaveChangesAsync();
        var originalVersion = user.SessionVersion;
        await scope.ServiceProvider.GetRequiredService<ITokenService>().CreateSessionAsync(user.Id, user.Email, user.Role, "team", default);
        using var client = app.GetTestClient();
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/auth/forgot-password", new ForgotPasswordRequest(user.Email))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/auth/forgot-password", new ForgotPasswordRequest("unknown@example.com"))).StatusCode);
        Assert.Single(email.Tokens);
        var token = email.Tokens.Single();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/auth/reset-password", new ResetPasswordRequest(token, "short"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/auth/reset-password", new ResetPasswordRequest(token, "Replacement-test-password-456!"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/auth/reset-password", new ResetPasswordRequest(token, "Another-test-password-789!"))).StatusCode);
        db.ChangeTracker.Clear();
        var saved = await db.Users.SingleAsync();
        Assert.NotEqual(originalVersion, saved.SessionVersion);
        Assert.Equal(PasswordVerificationResult.Success, hasher.VerifyHashedPassword(saved, saved.PasswordHash, "Replacement-test-password-456!"));
        Assert.Empty(await db.RefreshTokens.ToListAsync());
        Assert.NotNull((await db.PasswordResetTokens.SingleAsync()).UsedAt);
        Assert.Single(await db.AuditEntries.ToListAsync());
        const string expiredToken = "expired-local-fixture-token";
        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(), UserId = user.Id,
            TokenHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(expiredToken))),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(-1),
        });
        await db.SaveChangesAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/auth/reset-password", new ResetPasswordRequest(expiredToken, "Expired-test-password-123!"))).StatusCode);
        email.Enabled = false;
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.PostAsJsonAsync("/api/auth/forgot-password", new ForgotPasswordRequest(user.Email))).StatusCode);
    }

    private sealed class FakeEmail : IPasswordResetEmail
    {
        public bool Enabled { get; set; } = true;
        public List<string> Tokens { get; } = [];
        public Task SendAsync(string email, string token, CancellationToken cancellationToken) { Tokens.Add(token); return Task.CompletedTask; }
    }

    private sealed class TestIdentity(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var subject = Request.Headers["X-Test-Subject"].ToString();
            if (string.IsNullOrEmpty(subject)) return Task.FromResult(AuthenticateResult.NoResult());
            var identity = new ClaimsIdentity([new Claim("sub", subject), new Claim("subject_type", Request.Headers["X-Test-Type"].ToString()), new Claim(ClaimTypes.Role, Request.Headers["X-Test-Role"].ToString())], "test");
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), "test")));
        }
    }
}
