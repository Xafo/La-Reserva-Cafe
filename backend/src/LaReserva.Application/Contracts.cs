using LaReserva.Domain;

namespace LaReserva.Application;

public sealed record QualityProfileDto(
    string GrainType,
    int AltitudeMasl,
    decimal HumidityPct,
    string HarvestDate,
    string Producer,
    string Grade,
    decimal CuppingScore,
    string[] Notes);

public sealed record ProductDto(
    string Id,
    string Name,
    string Origin,
    string Region,
    string Process,
    string Roast,
    int PresentationGrams,
    decimal PriceLps,
    int Stock,
    bool Active,
    string Description,
    string ImageUrl,
    string ImageAlt,
    QualityProfileDto Quality);

public sealed record OrderItemDto(string ProductId, string ProductName, int Quantity, decimal UnitPriceLps, int? PresentationGrams = null, string? Roast = null, string? Grind = null);
public sealed record OrderDto(string Id, string CustomerName, string? CustomerEmail, string? CustomerPhone, string? DeliveryAddress, string? DeliveryCity, string? DeliveryNotes, OrderItemDto[] Items, string Status, DateTimeOffset CreatedAt, decimal TotalLps, OrderTerms? Terms = null, DateTimeOffset? CompletedAt = null)
{
    public string? Phone => CustomerPhone;
    public string? City => DeliveryCity;
    public string? AccountId { get; init; }
}
public sealed record CustomerDto(string Id, string Name, string Email, string Phone, string Type, string City, int TotalOrders);
public sealed record UserDto(string Id, string Name, string Email, string Role, bool Active);

public sealed record PreferenceProfileDto(
    string[] Goals,
    string[] BrewMethods,
    string[] DrinkStyles,
    string[] FlavorFamilies,
    string Intensity,
    string Budget,
    DateTimeOffset UpdatedAt);

public sealed record CustomerAccountDto(
    string Id,
    string Name,
    string Email,
    string Phone,
    string City,
    DateTimeOffset CreatedAt,
    PreferenceProfileDto? Preferences,
    string? RecommendedProductId,
    OnboardingDto? Onboarding = null);

public sealed record OnboardingDto(int Version, string Profile, Dictionary<string, string> Answers, DateTimeOffset UpdatedAt);
public sealed record UpdateOnboardingRequest(OnboardingDto? Onboarding, string? RecommendedProductId);

public sealed record LoginRequest(string Email, string Password);
public sealed record SessionRequest(string Session);
public sealed record AuthResponse(UserDto User, string AccessToken);
public sealed record AccountAuthResponse(CustomerAccountDto Account, string AccessToken);
public sealed record RefreshResponse(string AccessToken);
public sealed record RegisterAccountRequest(string Name, string Email, string Password, string Phone, string City);
public sealed record UpdatePreferencesRequest(PreferenceProfileDto Preferences, string? RecommendedProductId);
public sealed record CreateOrderRequest
{
    public CreateOrderRequest() { }
    public CreateOrderRequest(string customerName, CreateOrderItemRequest[] items) { CustomerName = customerName; Items = items; }
    public CreateOrderRequest(string customerName, CreateOrderItemRequest[] items, string? phone, string? deliveryAddress, string? city, string? deliveryNotes)
    {
        CustomerName = customerName; Items = items; Phone = phone; CustomerPhone = phone;
        DeliveryAddress = deliveryAddress; City = city; DeliveryCity = city; DeliveryNotes = deliveryNotes;
    }
    public string CustomerName { get; init; } = "";
    public CreateOrderItemRequest[] Items { get; init; } = [];
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? DeliveryAddress { get; init; }
    public string? DeliveryCity { get; init; }
    public string? DeliveryNotes { get; init; }
    public string? Phone { get; init; }
    public string? City { get; init; }
    public string? AccountId { get; init; }
    public Guid? RequestId { get; init; }
    public bool Wholesale { get; init; }
    public string? QuoteToken { get; init; }
}
public sealed record CreateOrderItemRequest(string ProductId, int Quantity, string? Grind = null);
public sealed record UpdateOrderStatusRequest(string Status, string? ExpectedStatus = null);
public sealed record SaveCustomerRequest(string Name, string Email, string Phone, string Type, string City);
public sealed record SaveUserRequest(string Name, string Email, string Role, string? InitialPassword, bool Active = true);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Token, string Password);
public sealed record AuditEntryDto(long Id, string ActorId, string Action, string Entity, string EntityId, DateTimeOffset OccurredAt);

public sealed record ReportSummaryDto(
    decimal SalesLps,
    int PendingOrders,
    int ActiveProducts,
    ProductDto[] LowStock,
    OrderDto[] RecentOrders,
    TopProductDto[] TopProducts,
    AuditEntryDto[] RecentActivity);

public sealed record TopProductDto(string Name, int Units);

public static class DtoMapper
{
    public static ProductDto ToDto(this Product value) => new(
        value.Id, value.Name, value.Origin, value.Region, value.Process, value.Roast,
        value.PresentationGrams, value.PriceLps, value.Stock, value.Active,
        value.Description, value.ImageUrl, value.ImageAlt,
        new QualityProfileDto(
            value.Quality.GrainType, value.Quality.AltitudeMasl, value.Quality.HumidityPct,
            value.Quality.HarvestDate.ToString("yyyy-MM-dd"), value.Quality.Producer,
            value.Quality.Grade, value.Quality.CuppingScore, value.Quality.Notes));

    public static OrderDto ToDto(this Order value) => new(
        value.Id, value.CustomerName, value.CustomerEmail, value.CustomerPhone, value.DeliveryAddress, value.DeliveryCity, value.DeliveryNotes,
        value.Items.Select(item => new OrderItemDto(item.ProductId, item.ProductName, item.Quantity, item.UnitPriceLps, item.PresentationGrams, item.Roast, item.Grind)).ToArray(),
        value.Status, value.CreatedAt, value.TotalLps,
        value.TermsJson is null ? null : System.Text.Json.JsonSerializer.Deserialize<OrderTerms>(value.TermsJson), value.CompletedAt) { AccountId = value.AccountId };

    public static CustomerDto ToDto(this Customer value) =>
        new(value.Id, value.Name, value.Email, value.Phone, value.Type, value.City, value.TotalOrders);

    public static UserDto ToDto(this User value) => new(value.Id, value.Name, value.Email, value.Role, value.Active);
    public static AuditEntryDto ToDto(this AuditEntry value) => new(value.Id, value.ActorId, value.Action, value.Entity, value.EntityId, value.OccurredAt);

    public static CustomerAccountDto ToDto(this CustomerAccount value) => new(
        value.Id, value.Name, value.Email, value.Phone, value.City, value.CreatedAt,
        value.Preferences is null ? null : new PreferenceProfileDto(
            value.Preferences.Goals, value.Preferences.BrewMethods, value.Preferences.DrinkStyles,
            value.Preferences.FlavorFamilies, value.Preferences.Intensity,
            value.Preferences.Budget, value.Preferences.UpdatedAt),
        value.RecommendedProductId,
        value.OnboardingJson is null ? null : System.Text.Json.JsonSerializer.Deserialize<OnboardingDto>(value.OnboardingJson));
}
