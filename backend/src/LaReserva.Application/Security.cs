namespace LaReserva.Application;

public sealed record TokenPair(string AccessToken, string RefreshToken);

public interface ITokenService
{
    Task<TokenPair> CreateSessionAsync(string subjectId, string email, string role, string subjectType, CancellationToken cancellationToken);
    Task<TokenPair?> RefreshAsync(string refreshToken, CancellationToken cancellationToken);
    Task RevokeAsync(string refreshToken, CancellationToken cancellationToken);
}
