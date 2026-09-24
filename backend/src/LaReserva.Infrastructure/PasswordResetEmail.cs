using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;
using LaReserva.Application;
using Microsoft.Extensions.Options;

namespace LaReserva.Infrastructure;

public sealed class EmailOptions
{
    public string Provider { get; set; } = "Disabled";
    public string From { get; set; } = "";
    public string ResetUrl { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";

    public bool IsValid() => Provider == "Disabled" ||
        (MailAddress.TryCreate(From, out _) && Uri.TryCreate(ResetUrl, UriKind.Absolute, out var url) &&
         (url.Scheme == "https" || (url.Scheme == "http" && url.IsLoopback)) &&
         string.IsNullOrEmpty(url.Query) && string.IsNullOrEmpty(url.Fragment) &&
         ((Provider == "Brevo" && !string.IsNullOrWhiteSpace(ApiKey)) ||
          (Provider == "Smtp" && !string.IsNullOrWhiteSpace(Host) && Port is > 0 and <= 65535)));
}

public sealed class PasswordResetEmail(IOptions<EmailOptions> options, HttpClient http) : IPasswordResetEmail
{
    public bool Enabled => options.Value.Provider != "Disabled";

    public async Task SendAsync(string email, string token, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (!Enabled) throw new InvalidOperationException("El correo de recuperación no está configurado.");
        // El fragmento no se transmite al servidor ni a los registros del proxy.
        var link = $"{settings.ResetUrl}#token={Uri.EscapeDataString(token)}";
        const string subject = "Restablecer contraseña — Directo Cafe";
        var body = $"Para cambiar tu contraseña, abre este enlace:\n\n{link}\n\nEl enlace vence en 30 minutos y solo puede usarse una vez. Si no lo solicitaste, ignora este correo.";

        if (settings.Provider == "Brevo")
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Add("api-key", settings.ApiKey);
            request.Content = JsonContent.Create(new
            {
                sender = new { email = settings.From, name = "Directo Cafe" },
                to = new[] { new { email } },
                subject,
                textContent = body,
            });
            using var response = await http.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
            return;
        }

        using var message = new MailMessage(settings.From, email, subject, body);
        using var client = new SmtpClient(settings.Host, settings.Port)
        {
            EnableSsl = settings.EnableSsl,
            UseDefaultCredentials = false,
            Credentials = string.IsNullOrWhiteSpace(settings.Username) ? null : new NetworkCredential(settings.Username, settings.Password),
        };
        await client.SendMailAsync(message, cancellationToken);
    }
}
