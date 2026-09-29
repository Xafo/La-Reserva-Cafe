using System.Text;
using System.Threading.RateLimiting;
using LaReserva.Api;
using LaReserva.Application;
using LaReserva.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;
var builder = WebApplication.CreateBuilder(args);
if (builder.Configuration["RENDER_EXTERNAL_HOSTNAME"] is { Length: > 0 } renderHostname)
{
    builder.Configuration["AllowedHosts"] = renderHostname + ";localhost;127.0.0.1";
    builder.Configuration["Email:ResetUrl"] ??= $"https://{renderHostname}/admin/reset-password";
}
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Falta la configuración JWT.");
if (string.IsNullOrWhiteSpace(jwt.SigningKey) || Encoding.UTF8.GetByteCount(jwt.SigningKey) < 32)
    throw new InvalidOperationException("Jwt:SigningKey debe configurarse con al menos 32 bytes.");

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpClient<IPasswordResetEmail, PasswordResetEmail>(client => client.Timeout = TimeSpan.FromSeconds(20));
builder.Services.AddHttpClient<ProductImageStorage>(client => client.Timeout = TimeSpan.FromSeconds(30));
builder.Services.AddProblemDetails();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var db = context.HttpContext.RequestServices.GetRequiredService<LaReservaDbContext>();
                var principal = context.Principal!;
                var id = principal.FindFirst("sub")?.Value;
                if (principal.FindFirst("subject_type")?.Value == "team")
                {
                    var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == id, context.HttpContext.RequestAborted);
                    if (user is null || !user.Active || user.Role != principal.FindFirst("role")?.Value
                        || user.SessionVersion.ToString() != principal.FindFirst("session_version")?.Value)
                        context.Fail("La sesión fue revocada.");
                }
                else if (!await db.CustomerAccounts.AnyAsync(a => a.Id == id, context.HttpContext.RequestAborted))
                    context.Fail("La cuenta ya no está disponible.");
            },
        };
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = "email",
            RoleClaimType = "role",
        };
    });
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Team", policy => policy.RequireClaim("subject_type", "team"))
    .AddPolicy("Administrator", policy => policy.RequireRole("Administrador"))
    .AddPolicy("ProductsWrite", policy => policy.RequireRole("Administrador", "Compras", "Supervisor"))
    .AddPolicy("CustomersView", policy => policy.RequireRole("Administrador", "Compras", "Ventas", "Supervisor"))
    .AddPolicy("CustomersWrite", policy => policy.RequireRole("Administrador", "Compras", "Ventas"))
    .AddPolicy("ReportsView", policy => policy.RequireRole("Administrador", "Ventas", "Supervisor"));

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Demasiados intentos. Esperá un minuto e intentá de nuevo." },
            cancellationToken);
    };
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        ClientAddress(context),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        }));
});

static string ClientAddress(HttpContext context)
{
    // Render sits behind Cloudflare. The TCP address may be a shared proxy,
    // which would otherwise make unrelated visitors consume the same quota.
    var cloudflareAddress = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(cloudflareAddress)) return cloudflareAddress;

    var forwardedAddress = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
        ?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
        .FirstOrDefault();
    return !string.IsNullOrWhiteSpace(forwardedAddress)
        ? forwardedAddress
        : context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

builder.Services.AddHealthChecks();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();
var uploadsPath = builder.Configuration["Uploads:Path"] ?? "/app/uploads";
Directory.CreateDirectory(uploadsPath);

app.UseExceptionHandler();
app.UseForwardedHeaders();
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (context.Request.IsHttps)
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(uploadsPath), RequestPath = "/uploads" });
app.MapHealthChecks("/health");
app.MapLaReservaEndpoints();
if (Directory.Exists(Path.Combine(app.Environment.ContentRootPath, "wwwroot")))
{
    app.MapFallback("/api/{**path}", () => Results.NotFound());
    app.MapFallbackToFile("index.html");
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LaReservaDbContext>();
    await dbContext.Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<CsvDataSeeder>().SeedAsync();
}

app.Run();

public partial class Program;
