namespace LaReserva.Application;

public interface IPasswordResetEmail
{
    bool Enabled { get; }
    Task SendAsync(string email, string token, CancellationToken cancellationToken);
}
