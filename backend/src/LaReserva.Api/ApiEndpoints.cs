using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LaReserva.Api;

public static partial class ApiEndpoints
{
    private static readonly string[] OrderStatuses = ["Pendiente", "Aprobada", "Cancelada", "Finalizada"];

    public static IEndpointRouteBuilder MapLaReservaEndpoints(this IEndpointRouteBuilder routes)
    {
        MapAuth(routes.MapGroup("/api/auth"));
        MapProducts(routes.MapGroup("/api/products"));
        MapOrders(routes.MapGroup("/api/orders"));
        MapCustomers(routes.MapGroup("/api/customers"));
        MapUsers(routes.MapGroup("/api/users"));
        routes.MapGet("/api/audit-log", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var entries = await db.AuditEntries.AsNoTracking().OrderByDescending(value => value.OccurredAt).Take(100).ToListAsync(cancellationToken);
            return Results.Ok(entries.Select(value => value.ToDto()));
        }).RequireAuthorization("Administrator");
        MapAccounts(routes.MapGroup("/api/accounts"));
        MapReports(routes.MapGroup("/api/reports"));
        MapCommercialRequests(routes);
        return routes;
    }

    private static void MapAuth(RouteGroupBuilder group)
    {
        group.MapPost("/login", async (
            LoginRequest request,
            HttpRequest httpRequest,
            HttpResponse httpResponse,
            LaReservaDbContext db,
            IPasswordHasher<User> passwordHasher,
            ITokenService tokenService,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
                return Results.Unauthorized();
            var email = NormalizeEmail(request.Email);
            var user = await db.Users.SingleOrDefaultAsync(value => value.Email == email, cancellationToken);
            if (user is null || !user.Active) return Results.Unauthorized();

            var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verification == PasswordVerificationResult.Failed) return Results.Unauthorized();
            if (verification == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
                await db.SaveChangesAsync(cancellationToken);
            }

            var tokens = await tokenService.CreateSessionAsync(user.Id, user.Email, user.Role, "team", cancellationToken);
            httpResponse.Headers.CacheControl = "no-store";
            SetRefreshCookie(httpResponse, httpRequest, "team", tokens.RefreshToken);
            return Results.Ok(new AuthResponse(user.ToDto(), tokens.AccessToken));
        }).RequireRateLimiting("auth");

        group.MapPost("/refresh", async (
            SessionRequest request,
            HttpRequest httpRequest,
            HttpResponse httpResponse,
            ITokenService tokenService,
            CancellationToken cancellationToken) =>
        {
            var cookieName = RefreshCookieName(request.Session);
            if (cookieName is null || !httpRequest.Cookies.TryGetValue(cookieName, out var refreshToken))
                return Results.Unauthorized();
            var tokens = await tokenService.RefreshAsync(refreshToken, cancellationToken);
            if (tokens is null) return Results.Unauthorized();
            httpResponse.Headers.CacheControl = "no-store";
            SetRefreshCookie(httpResponse, httpRequest, request.Session, tokens.RefreshToken);
            return Results.Ok(new RefreshResponse(tokens.AccessToken));
        }).RequireRateLimiting("auth");

        group.MapPost("/logout", async (
            SessionRequest request,
            HttpRequest httpRequest,
            HttpResponse httpResponse,
            ITokenService tokenService,
            CancellationToken cancellationToken) =>
        {
            var cookieName = RefreshCookieName(request.Session);
            if (cookieName is null) return Results.BadRequest();
            if (httpRequest.Cookies.TryGetValue(cookieName, out var refreshToken))
                await tokenService.RevokeAsync(refreshToken, cancellationToken);
            httpResponse.Cookies.Delete(cookieName, new CookieOptions { Path = "/api/auth" });
            return Results.NoContent();
        });

        group.MapPost("/forgot-password", async (ForgotPasswordRequest request, LaReservaDbContext db, IServiceProvider services, ILogger<Program> logger, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || !EmailPattern().IsMatch(request.Email.Trim()))
                return Results.BadRequest(new { error = "Escribe un correo válido." });
            var emailSender = services.GetService<IPasswordResetEmail>();
            if (emailSender is null || !emailSender.Enabled)
                return Results.Json(new { error = "La recuperación por correo aún no está disponible. Contacta al administrador." }, statusCode: 503);
            var user = await db.Users.SingleOrDefaultAsync(value => value.Email == NormalizeEmail(request.Email), cancellationToken);
            if (user is { Active: true })
            {
                var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
                var reset = new PasswordResetToken { Id = Guid.NewGuid(), UserId = user.Id, TokenHash = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken))), ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(30) };
                db.PasswordResetTokens.Add(reset);
                await db.SaveChangesAsync(cancellationToken);
                try
                {
                    await emailSender.SendAsync(user.Email, rawToken, cancellationToken);
                }
                catch (Exception exception) when (exception is HttpRequestException or System.Net.Mail.SmtpException or OperationCanceledException)
                {
                    // No registrar el mensaje del proveedor: puede contener destinatarios o tokens.
                    logger.LogError("No se pudo entregar el correo de recuperación. Tipo: {FailureType}", exception.GetType().Name);
                    db.PasswordResetTokens.Remove(reset);
                    await db.SaveChangesAsync(CancellationToken.None);
                }
            }
            return Results.NoContent();
        }).RequireRateLimiting("auth");

        group.MapPost("/reset-password", async (ResetPasswordRequest request, LaReservaDbContext db, IPasswordHasher<User> passwordHasher, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrEmpty(request.Password) || request.Password.Length < 12) return Results.BadRequest(new { error = "Usa una contraseña de al menos 12 caracteres y un enlace válido." });
            await using var transaction = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
            var hash = Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(request.Token)));
            var reset = await db.PasswordResetTokens.SingleOrDefaultAsync(value => value.TokenHash == hash && value.UsedAt == null && value.ExpiresAt > DateTimeOffset.UtcNow, cancellationToken);
            if (reset is null) return Results.BadRequest(new { error = "Solicitud inválida o expirada." });
            var user = await db.Users.FindAsync([reset.UserId], cancellationToken);
            if (user is not { Active: true }) return Results.BadRequest(new { error = "Solicitud inválida." });
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            reset.UsedAt = DateTimeOffset.UtcNow;
            var otherTokens = await db.PasswordResetTokens.Where(value => value.UserId == user.Id && value.UsedAt == null).ToListAsync(cancellationToken);
            foreach (var token in otherTokens) token.UsedAt = reset.UsedAt;
            db.RefreshTokens.RemoveRange(db.RefreshTokens.Where(value => value.SubjectId == user.Id && value.SubjectType == "team"));
            db.AuditEntries.Add(new AuditEntry { ActorId = user.Id, Action = "Restablecer contraseña", Entity = "Usuario", EntityId = user.Id, OccurredAt = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Results.NoContent();
        }).RequireRateLimiting("auth");
    }

    private static void MapProducts(RouteGroupBuilder group)
    {
        group.MapGet("/", async (bool? activeOnly, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var query = db.Products.AsNoTracking().Include(value => value.Quality).AsQueryable();
            if (activeOnly is true) query = query.Where(value => value.Active);
            var products = await query.OrderBy(value => value.Name).ToListAsync(cancellationToken);
            return Results.Ok(products.Select(value => value.ToDto()));
        });

        group.MapGet("/{id}", async (string id, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var product = await db.Products.AsNoTracking().Include(value => value.Quality)
                .SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            return product is null ? Results.NotFound() : Results.Ok(product.ToDto());
        });

        group.MapPost("/", async (ProductDto request, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (!ValidProduct(request) || !DateOnly.TryParseExact(request.Quality.HarvestDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var harvestDate))
                return Results.BadRequest(new { error = "Los datos del producto son inválidos." });
            var id = $"p-{Guid.NewGuid():N}";
            var product = new Product
            {
                Id = id, Name = request.Name.Trim(), Origin = request.Origin.Trim(), Region = request.Region.Trim(),
                Process = request.Process, Roast = request.Roast, PresentationGrams = request.PresentationGrams,
                PriceLps = request.PriceLps, Stock = request.Stock, Active = request.Active,
                Description = request.Description.Trim(), ImageUrl = request.ImageUrl.Trim(), ImageAlt = request.ImageAlt.Trim(),
                Quality = new QualityProfile
                {
                    ProductId = id, GrainType = request.Quality.GrainType.Trim(), AltitudeMasl = request.Quality.AltitudeMasl,
                    HumidityPct = request.Quality.HumidityPct, HarvestDate = harvestDate, Producer = request.Quality.Producer.Trim(),
                    Grade = request.Quality.Grade, CuppingScore = request.Quality.CuppingScore, Notes = request.Quality.Notes,
                },
            };
            db.Products.Add(product);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/products/{id}", product.ToDto());
        }).RequireAuthorization("ProductsWrite").DisableAntiforgery();

        group.MapPost("/{id}/image", async (string id, IFormFile file, IServiceProvider services, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (file.Length is <= 0 or > 5_000_000 || !new[] { "image/jpeg", "image/png", "image/webp" }.Contains(file.ContentType))
                return Results.BadRequest(new { error = "La imagen debe ser JPG, PNG o WebP y pesar menos de 5 MB." });
            var product = await db.Products.Include(value => value.Quality)
                .SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            if (product is null) return Results.NotFound();
            var extension = file.ContentType switch { "image/jpeg" => ".jpg", "image/png" => ".png", _ => ".webp" };
            var filename = $"{Guid.NewGuid():N}{extension}";
            var storage = services.GetRequiredService<ProductImageStorage>();
            product.ImageUrl = await storage.SaveAsync(file, filename, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(product.ToDto());
        }).RequireAuthorization("ProductsWrite").DisableAntiforgery();

        group.MapPut("/{id}", async (string id, ProductDto request, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (!string.Equals(id, request.Id, StringComparison.Ordinal))
                return Results.BadRequest(new { error = "El id de la ruta no coincide." });
            var product = await db.Products.Include(value => value.Quality)
                .SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            if (product is null) return Results.NotFound();
            if (!DateOnly.TryParseExact(request.Quality.HarvestDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var harvestDate))
                return Results.BadRequest(new { error = "harvestDate debe usar yyyy-MM-dd." });
            if (!ValidProduct(request)) return Results.BadRequest(new { error = "Los datos del producto son inválidos." });

            product.Name = request.Name;
            product.Origin = request.Origin;
            product.Region = request.Region;
            product.Process = request.Process;
            product.Roast = request.Roast;
            product.PresentationGrams = request.PresentationGrams;
            product.PriceLps = request.PriceLps;
            product.Stock = request.Stock;
            product.Active = request.Active;
            product.Description = request.Description;
            product.ImageUrl = request.ImageUrl;
            product.ImageAlt = request.ImageAlt;
            product.Quality.GrainType = request.Quality.GrainType;
            product.Quality.AltitudeMasl = request.Quality.AltitudeMasl;
            product.Quality.HumidityPct = request.Quality.HumidityPct;
            product.Quality.HarvestDate = harvestDate;
            product.Quality.Producer = request.Quality.Producer;
            product.Quality.Grade = request.Quality.Grade;
            product.Quality.CuppingScore = request.Quality.CuppingScore;
            product.Quality.Notes = request.Quality.Notes;
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(product.ToDto());
        }).RequireAuthorization("ProductsWrite");
    }

    private static void MapOrders(RouteGroupBuilder group)
    {
        group.MapGet("/", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var orders = await db.Orders.AsNoTracking().Include(value => value.Items)
                .OrderByDescending(value => value.CreatedAt).ToListAsync(cancellationToken);
            return Results.Ok(orders.Select(value => value.ToDto()));
        }).RequireAuthorization("Team");

        group.MapPost("/", async (CreateOrderRequest request, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.CustomerName) || request.Items.Length == 0 || request.Items.Any(value => value.Quantity <= 0))
                return Results.BadRequest(new { error = "La orden requiere cliente e items con cantidad válida." });

            var requestedIds = request.Items.Select(value => value.ProductId).Distinct().ToArray();
            var products = await db.Products.Where(value => requestedIds.Contains(value.Id) && value.Active)
                .ToDictionaryAsync(value => value.Id, cancellationToken);
            if (products.Count != requestedIds.Length)
                return Results.BadRequest(new { error = "Uno o más productos no existen o están inactivos." });

            var orderId = $"OC-{DateTimeOffset.UtcNow.Year}-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
            var order = new Order
            {
                Id = orderId,
                CustomerName = request.CustomerName.Trim(),
                Status = "Pendiente",
                CreatedAt = DateTimeOffset.UtcNow,
                TotalLps = request.Items.Sum(value => products[value.ProductId].PriceLps * value.Quantity),
                Items = request.Items.Select(value => new OrderItem
                {
                    OrderId = orderId,
                    ProductId = value.ProductId,
                    ProductName = products[value.ProductId].Name,
                    Quantity = value.Quantity,
                    UnitPriceLps = products[value.ProductId].PriceLps,
                }).ToList(),
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/orders/{order.Id}", order.ToDto());
        });

        group.MapPatch("/{id}/status", async (string id, UpdateOrderStatusRequest request, ClaimsPrincipal principal, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (!OrderStatuses.Contains(request.Status)) return Results.BadRequest(new { error = "Estado inválido." });
            var order = await db.Orders.FindAsync([id], cancellationToken);
            if (order is null) return Results.NotFound();
            order.Status = request.Status;
            AddAudit(db, principal, "Cambiar estado de orden", "Orden", order.Id);
            await db.SaveChangesAsync(cancellationToken);
            return Results.NoContent();
        }).RequireAuthorization("Team");

        group.MapGet("/{id}/pdf", async (string id, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var order = await db.Orders.AsNoTracking().Include(value => value.Items).SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            return order is null ? Results.NotFound() : Results.File(ReportDocuments.OrderPdf(order), "application/pdf", $"{order.Id}.pdf");
        }).RequireAuthorization("Team");
    }

    private static void MapCustomers(RouteGroupBuilder group)
    {
        group.MapGet("/", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var customers = await db.Customers.AsNoTracking().OrderBy(value => value.Name).ToListAsync(cancellationToken);
            return Results.Ok(customers.Select(value => value.ToDto()));
        }).RequireAuthorization("CustomersView");

        group.MapPost("/", async (SaveCustomerRequest request, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var error = ValidateCustomer(request);
            if (error is not null) return Results.BadRequest(new { error });
            var email = NormalizeEmail(request.Email);
            if (await db.Customers.AnyAsync(value => value.Email == email, cancellationToken))
                return Results.Conflict(new { error = "Ya existe un registro con ese correo." });
            var customer = new Customer { Id = $"c-{Guid.NewGuid():N}", Name = request.Name.Trim(), Email = email, Phone = request.Phone.Trim(), Type = request.Type, City = request.City.Trim(), TotalOrders = 0 };
            db.Customers.Add(customer);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/customers/{customer.Id}", customer.ToDto());
        }).RequireAuthorization("CustomersWrite");

        group.MapPut("/{id}", async (string id, SaveCustomerRequest request, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var error = ValidateCustomer(request);
            if (error is not null) return Results.BadRequest(new { error });
            var customer = await db.Customers.FindAsync([id], cancellationToken);
            if (customer is null) return Results.NotFound();
            var email = NormalizeEmail(request.Email);
            if (await db.Customers.AnyAsync(value => value.Id != id && value.Email == email, cancellationToken))
                return Results.Conflict(new { error = "Ya existe un registro con ese correo." });
            customer.Name = request.Name.Trim(); customer.Email = email; customer.Phone = request.Phone.Trim(); customer.Type = request.Type; customer.City = request.City.Trim();
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(customer.ToDto());
        }).RequireAuthorization("CustomersWrite");
    }

    private static void MapUsers(RouteGroupBuilder group)
    {
        group.MapGet("/", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var users = await db.Users.AsNoTracking().OrderBy(value => value.Name).ToListAsync(cancellationToken);
            return Results.Ok(users.Select(value => value.ToDto()));
        }).RequireAuthorization("Administrator");


        group.MapPost("/", async (SaveUserRequest request, ClaimsPrincipal principal, LaReservaDbContext db, IPasswordHasher<User> passwordHasher, CancellationToken cancellationToken) =>
        {
            var error = ValidateUser(request, requirePassword: true);
            if (error is not null) return Results.BadRequest(new { error });
            var email = NormalizeEmail(request.Email);
            if (await db.Users.AnyAsync(value => value.Email == email, cancellationToken)) return Results.Conflict(new { error = "Ya existe un usuario con ese correo." });
            var user = new User { Id = $"u-{Guid.NewGuid():N}", Name = request.Name.Trim(), Email = email, Role = request.Role, Active = request.Active, PasswordHash = string.Empty };
            user.PasswordHash = passwordHasher.HashPassword(user, request.InitialPassword!);
            db.Users.Add(user); AddAudit(db, principal, "Crear usuario", "Usuario", user.Id); await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/users/{user.Id}", user.ToDto());
        }).RequireAuthorization("Administrator");

        group.MapPut("/{id}", async (string id, SaveUserRequest request, ClaimsPrincipal principal, LaReservaDbContext db, IPasswordHasher<User> passwordHasher, CancellationToken cancellationToken) =>
        {
            var error = ValidateUser(request, requirePassword: false);
            if (error is not null) return Results.BadRequest(new { error });
            var user = await db.Users.FindAsync([id], cancellationToken);
            if (user is null) return Results.NotFound();
            var email = NormalizeEmail(request.Email);
            if (await db.Users.AnyAsync(value => value.Id != id && value.Email == email, cancellationToken)) return Results.Conflict(new { error = "Ya existe un usuario con ese correo." });
            user.Name = request.Name.Trim(); user.Email = email; user.Role = request.Role; user.Active = request.Active;
            if (!string.IsNullOrEmpty(request.InitialPassword)) user.PasswordHash = passwordHasher.HashPassword(user, request.InitialPassword);
            AddAudit(db, principal, "Actualizar usuario", "Usuario", user.Id);
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(user.ToDto());
        }).RequireAuthorization("Administrator");
    }

    private static void MapAccounts(RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            RegisterAccountRequest request,
            LaReservaDbContext db,
            IPasswordHasher<CustomerAccount> passwordHasher,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
                return Results.BadRequest(new { error = "Correo y contraseña son obligatorios." });
            var email = NormalizeEmail(request.Email);
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Phone) ||
                string.IsNullOrWhiteSpace(request.City) || !EmailPattern().IsMatch(email) || request.Password.Length < 12)
                return Results.BadRequest(new { error = "Correo inválido o contraseña menor a 12 caracteres." });
            if (await db.CustomerAccounts.AnyAsync(value => value.Email == email, cancellationToken))
                return Results.Conflict(new { error = "Ya existe una cuenta con ese correo." });

            var account = new CustomerAccount
            {
                Id = $"a-{Guid.NewGuid():N}",
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = string.Empty,
                Phone = request.Phone.Trim(),
                City = request.City.Trim(),
                CreatedAt = DateTimeOffset.UtcNow,
            };
            account.PasswordHash = passwordHasher.HashPassword(account, request.Password);
            db.CustomerAccounts.Add(account);
            if (!await db.Customers.AnyAsync(value => value.Email == email, cancellationToken))
            {
                db.Customers.Add(new Customer
                {
                    Id = $"c-{Guid.NewGuid():N}",
                    Name = account.Name,
                    Email = email,
                    Phone = account.Phone,
                    Type = "Cliente",
                    City = account.City,
                    TotalOrders = 0,
                });
            }
            await db.SaveChangesAsync(cancellationToken);
            return Results.Created($"/api/accounts/{account.Id}", account.ToDto());
        }).RequireRateLimiting("auth");

        group.MapPost("/login", async (
            LoginRequest request,
            HttpRequest httpRequest,
            HttpResponse httpResponse,
            LaReservaDbContext db,
            IPasswordHasher<CustomerAccount> passwordHasher,
            ITokenService tokenService,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
                return Results.Unauthorized();
            var email = NormalizeEmail(request.Email);
            var account = await db.CustomerAccounts.Include(value => value.Preferences)
                .SingleOrDefaultAsync(value => value.Email == email, cancellationToken);
            if (account is null || passwordHasher.VerifyHashedPassword(account, account.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
                return Results.Unauthorized();
            var tokens = await tokenService.CreateSessionAsync(account.Id, account.Email, "ClienteTienda", "customer", cancellationToken);
            httpResponse.Headers.CacheControl = "no-store";
            SetRefreshCookie(httpResponse, httpRequest, "customer", tokens.RefreshToken);
            return Results.Ok(new AccountAuthResponse(account.ToDto(), tokens.AccessToken));
        }).RequireRateLimiting("auth");

        group.MapPut("/{id}/preferences", async (
            string id,
            UpdatePreferencesRequest request,
            ClaimsPrincipal principal,
            LaReservaDbContext db,
            CancellationToken cancellationToken) =>
        {
            if (principal.FindFirstValue("subject_type") != "customer" || principal.FindFirstValue("sub") != id)
                return Results.Forbid();
            var account = await db.CustomerAccounts.Include(value => value.Preferences)
                .SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            if (account is null) return Results.NotFound();
            if (request.RecommendedProductId is not null &&
                !await db.Products.AnyAsync(value => value.Id == request.RecommendedProductId, cancellationToken))
                return Results.BadRequest(new { error = "Producto recomendado inválido." });

            account.RecommendedProductId = request.RecommendedProductId;
            account.Preferences ??= new CustomerPreference
            {
                AccountId = id,
                Intensity = request.Preferences.Intensity,
                Budget = request.Preferences.Budget,
            };
            account.Preferences.Goals = request.Preferences.Goals;
            account.Preferences.BrewMethods = request.Preferences.BrewMethods;
            account.Preferences.DrinkStyles = request.Preferences.DrinkStyles;
            account.Preferences.FlavorFamilies = request.Preferences.FlavorFamilies;
            account.Preferences.Intensity = request.Preferences.Intensity;
            account.Preferences.Budget = request.Preferences.Budget;
            account.Preferences.UpdatedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(account.ToDto());
        }).RequireAuthorization();

        group.MapPut("/{id}/onboarding", async (
            string id, UpdateOnboardingRequest request, ClaimsPrincipal principal,
            LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (principal.FindFirstValue("subject_type") != "customer" || principal.FindFirstValue("sub") != id)
                return Results.Forbid();
            var error = OnboardingRules.Validate(request.Onboarding);
            if (error is not null) return Results.BadRequest(new { error });
            if (IsCommercial(request.Onboarding!.Profile) && request.RecommendedProductId is not null)
                return Results.BadRequest(new { error = "Los perfiles comerciales no reciben recomendación de sabor." });
            var account = await db.CustomerAccounts.Include(value => value.Preferences)
                .SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
            if (account is null) return Results.NotFound();
            if (request.RecommendedProductId is not null && !await db.Products.AnyAsync(
                value => value.Id == request.RecommendedProductId && value.Active && value.Stock > 0, cancellationToken))
                return Results.BadRequest(new { error = "El café recomendado ya no está disponible. Volvé a calcularlo." });
            var onboarding = request.Onboarding! with { UpdatedAt = DateTimeOffset.UtcNow };
            account.OnboardingJson = System.Text.Json.JsonSerializer.Serialize(onboarding);
            account.RecommendedProductId = request.RecommendedProductId;
            // Las preferencias previas se conservan; no se infiere un perfil a partir de ellas.
            await db.SaveChangesAsync(cancellationToken);
            return Results.Ok(account.ToDto());
        }).RequireAuthorization();

        group.MapGet("/", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var accounts = await db.CustomerAccounts.AsNoTracking().Include(value => value.Preferences)
                .OrderBy(value => value.Name).ToListAsync(cancellationToken);
            return Results.Ok(accounts.Select(value => value.ToDto()));
        }).RequireAuthorization("CustomersView");
    }

    private static void MapReports(RouteGroupBuilder group)
    {
        group.MapGet("/summary", async (LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            var products = await db.Products.AsNoTracking().Include(value => value.Quality).ToListAsync(cancellationToken);
            var orders = await db.Orders.AsNoTracking().Include(value => value.Items)
                .OrderByDescending(value => value.CreatedAt).ToListAsync(cancellationToken);
            var topProducts = orders.SelectMany(value => value.Items)
                .GroupBy(value => value.ProductName)
                .Select(grouping => new TopProductDto(grouping.Key, grouping.Sum(value => value.Quantity)))
                .OrderByDescending(value => value.Units).Take(5).ToArray();
            var activity = await db.AuditEntries.AsNoTracking().OrderByDescending(value => value.OccurredAt).Take(5).ToListAsync(cancellationToken);
            return Results.Ok(new ReportSummaryDto(
                orders.Where(value => value.Status == "Finalizada").Sum(value => value.TotalLps),
                orders.Count(value => value.Status == "Pendiente"),
                products.Count(value => value.Active),
                products.Where(value => value.Stock < 25).Select(value => value.ToDto()).ToArray(),
                orders.Take(5).Select(value => value.ToDto()).ToArray(),
                topProducts,
                activity.Select(value => value.ToDto()).ToArray()));
        }).RequireAuthorization("ReportsView");

        group.MapGet("/export", async (string type, string format, LaReservaDbContext db, CancellationToken cancellationToken) =>
        {
            if (!new[] { "productos", "ordenes", "ventas", "inventario", "mas-vendidos", "movimientos" }.Contains(type) || !new[] { "pdf", "xlsx" }.Contains(format))
                return Results.BadRequest(new { error = "Tipo o formato inválido." });
            var products = await db.Products.AsNoTracking().ToListAsync(cancellationToken);
            var orders = await db.Orders.AsNoTracking().Include(value => value.Items).ToListAsync(cancellationToken);
            if (format == "xlsx") return Results.File(ReportDocuments.Excel(type, products, orders), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{type}.xlsx");
            var document = ReportDocuments.OrderPdf(new Order { Id = $"Reporte {type}", CustomerName = "Directo Cafe", Status = "", CreatedAt = DateTimeOffset.UtcNow, TotalLps = orders.Sum(value => value.TotalLps), Items = orders.SelectMany(value => value.Items).ToList() });
            return Results.File(document, "application/pdf", $"{type}.pdf");
        }).RequireAuthorization("ReportsView");
    }

    private static string NormalizeEmail(string value) => value.Trim().ToLowerInvariant();

    private static bool ValidProduct(ProductDto product) =>
        product.PresentationGrams > 0 && product.PriceLps >= 0 && product.Stock >= 0 &&
        new[] { "Lavado", "Honey", "Natural" }.Contains(product.Process) &&
        new[] { "Claro", "Medio", "Oscuro" }.Contains(product.Roast) &&
        new[] { "Premium", "Exportacion", "Estandar" }.Contains(product.Quality.Grade);

    private static string? ValidateCustomer(SaveCustomerRequest request) =>
        string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Phone) || string.IsNullOrWhiteSpace(request.City) ||
        !EmailPattern().IsMatch(NormalizeEmail(request.Email)) || !new[] { "Cliente", "Proveedor" }.Contains(request.Type)
            ? "Los datos del cliente o proveedor son inválidos." : null;

    private static string? ValidateUser(SaveUserRequest request, bool requirePassword) =>
        string.IsNullOrWhiteSpace(request.Name) || !EmailPattern().IsMatch(NormalizeEmail(request.Email)) ||
        !new[] { "Administrador", "Compras", "Ventas", "Supervisor" }.Contains(request.Role) ||
        (requirePassword && (request.InitialPassword?.Length ?? 0) < 12) ||
        (!string.IsNullOrEmpty(request.InitialPassword) && request.InitialPassword.Length < 12)
            ? "Los datos del usuario son inválidos; la contraseña inicial debe tener al menos 12 caracteres." : null;

    private static void AddAudit(LaReservaDbContext db, ClaimsPrincipal principal, string action, string entity, string entityId) =>
        db.AuditEntries.Add(new AuditEntry
        {
            ActorId = principal.FindFirstValue("sub") ?? "system",
            Action = action,
            Entity = entity,
            EntityId = entityId,
            OccurredAt = DateTimeOffset.UtcNow,
        });

    private static string? RefreshCookieName(string session) => session switch
    {
        "team" => "la_reserva_team_refresh",
        "customer" => "la_reserva_customer_refresh",
        _ => null,
    };

    private static void SetRefreshCookie(HttpResponse response, HttpRequest request, string session, string token)
    {
        var cookieName = RefreshCookieName(session)
            ?? throw new InvalidOperationException("Tipo de sesión inválido.");
        response.Cookies.Append(cookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            MaxAge = TimeSpan.FromDays(7),
        });
    }

    [GeneratedRegex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", RegexOptions.CultureInvariant)]
    private static partial Regex EmailPattern();
}
