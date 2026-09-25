using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using LaReserva.Application;
using LaReserva.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace LaReserva.Infrastructure;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string SigningKey { get; init; }
    public int AccessTokenMinutes { get; init; } = 15;
    public int RefreshTokenDays { get; init; } = 7;
}

public sealed class TokenService(
    LaReservaDbContext dbContext,
    IOptions<JwtOptions> options,
    TimeProvider timeProvider) : ITokenService
{
    private readonly JwtOptions _options = options.Value;

    public async Task<TokenPair> CreateSessionAsync(
        string subjectId,
        string email,
        string role,
        string subjectType,
        CancellationToken cancellationToken)
    {
        var refreshToken = CreateRefreshToken();
        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = HashToken(refreshToken),
            SubjectId = subjectId,
            SubjectType = subjectType,
            CreatedAt = timeProvider.GetUtcNow(),
            ExpiresAt = timeProvider.GetUtcNow().AddDays(_options.RefreshTokenDays),
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        return new TokenPair(await CreateAccessToken(subjectId, email, role, subjectType), refreshToken);
    }

    public async Task<TokenPair?> RefreshAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var currentHash = HashToken(refreshToken);
        var current = await dbContext.RefreshTokens.SingleOrDefaultAsync(
            value => value.TokenHash == currentHash,
            cancellationToken);

        if (current is null || current.RevokedAt is not null || current.ExpiresAt <= now)
            return null;

        string email;
        string role;
        if (current.SubjectType == "team")
        {
            var user = await dbContext.Users.FindAsync([current.SubjectId], cancellationToken);
            if (user is null || !user.Active) return null;
            email = user.Email;
            role = user.Role;
        }
        else
        {
            var account = await dbContext.CustomerAccounts.FindAsync([current.SubjectId], cancellationToken);
            if (account is null) return null;
            email = account.Email;
            role = "ClienteTienda";
        }

        var replacement = CreateRefreshToken();
        var replacementHash = HashToken(replacement);
        current.RevokedAt = now;
        current.ReplacedByHash = replacementHash;
        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = replacementHash,
            SubjectId = current.SubjectId,
            SubjectType = current.SubjectType,
            CreatedAt = now,
            ExpiresAt = now.AddDays(_options.RefreshTokenDays),
        });
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return null;
        }

        return new TokenPair(
            await CreateAccessToken(current.SubjectId, email, role, current.SubjectType),
            replacement);
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(refreshToken);
        var token = await dbContext.RefreshTokens.SingleOrDefaultAsync(
            value => value.TokenHash == tokenHash && value.RevokedAt == null,
            cancellationToken);
        if (token is null) return;
        token.RevokedAt = timeProvider.GetUtcNow();
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Otra solicitud ya revocó la misma sesión.
        }
    }

    private async Task<string> CreateAccessToken(string subjectId, string email, string role, string subjectType)
    {
        var sessionVersion = subjectType == "team" ? (await dbContext.Users.FindAsync(subjectId))?.SessionVersion.ToString() : "customer";
        var now = timeProvider.GetUtcNow();
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)),
            SecurityAlgorithms.HmacSha256);
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, subjectId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("subject_type", subjectType),
                new Claim("session_version", sessionVersion ?? "missing"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            ]),
            NotBefore = now.UtcDateTime,
            Expires = now.AddMinutes(_options.AccessTokenMinutes).UtcDateTime,
            SigningCredentials = credentials,
        };
        return new JwtSecurityTokenHandler().CreateEncodedJwt(descriptor);
    }

    private static string CreateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    private static string HashToken(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}
