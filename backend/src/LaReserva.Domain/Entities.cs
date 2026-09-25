namespace LaReserva.Domain;

public sealed class Product
{
    public Guid Version { get; set; }
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Origin { get; set; }
    public required string Region { get; set; }
    public required string Process { get; set; }
    public required string Roast { get; set; }
    public int PresentationGrams { get; set; }
    public decimal PriceLps { get; set; }
    public int Stock { get; set; }
    public bool Active { get; set; }
    public required string Description { get; set; }
    public required string ImageUrl { get; set; }
    public required string ImageAlt { get; set; }
    public required QualityProfile Quality { get; set; }
}

public sealed class QualityProfile
{
    public required string ProductId { get; set; }
    public required string GrainType { get; set; }
    public int AltitudeMasl { get; set; }
    public decimal HumidityPct { get; set; }
    public DateOnly HarvestDate { get; set; }
    public required string Producer { get; set; }
    public required string Grade { get; set; }
    public decimal CuppingScore { get; set; }
    public string[] Notes { get; set; } = [];
}

public sealed class Order
{
    // Campos heredados: preservan pedidos existentes durante la transición al ciclo operativo.
    public Guid? RequestId { get; set; }
    public string? RequestHash { get; set; }
    public string? TermsJson { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string HistoryJson { get; set; } = "[]";
    public bool StockReserved { get; set; }
    public string? AccountId { get; set; }
    public required string Id { get; set; }
    public required string CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? Phone { get => CustomerPhone; set => CustomerPhone = value; }
    public string? DeliveryAddress { get; set; }
    public string? DeliveryCity { get; set; }
    public string? City { get => DeliveryCity; set => DeliveryCity = value; }
    public string? DeliveryNotes { get; set; }
    public bool StockCommitted { get; set; }
    public string? AssignedUserId { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public decimal TotalLps { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}

public sealed class OperationalPolicy
{
    public int Id { get; set; } = 1;
    public int PendingOrderExpiryHours { get; set; } = 48;
    public bool AutomaticExpiryEnabled { get; set; } = true;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class OrderItem
{
    public long Id { get; set; }
    public required string OrderId { get; set; }
    public required string ProductId { get; set; }
    public required string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceLps { get; set; }
    public int? PresentationGrams { get; set; }
    public string? Roast { get; set; }
    public string? Grind { get; set; }
}

public sealed class Customer
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public required string Type { get; set; }
    public required string City { get; set; }
    public int TotalOrders { get; set; }
}

public sealed class User
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public bool Active { get; set; } = true;
    public Guid SessionVersion { get; set; }
    public required string PasswordHash { get; set; }
}

public sealed class CustomerAccount
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string Phone { get; set; }
    public required string City { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? RecommendedProductId { get; set; }
    public CustomerPreference? Preferences { get; set; }
    public string? OnboardingJson { get; set; }
}

public sealed class CustomerPreference
{
    public required string AccountId { get; set; }
    public string[] Goals { get; set; } = [];
    public string[] BrewMethods { get; set; } = [];
    public string[] DrinkStyles { get; set; } = [];
    public string[] FlavorFamilies { get; set; } = [];
    public required string Intensity { get; set; }
    public required string Budget { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class RefreshToken
{
    public Guid Id { get; set; }
    public required string TokenHash { get; set; }
    public required string SubjectId { get; set; }
    public required string SubjectType { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? ReplacedByHash { get; set; }
}

public sealed class PasswordResetToken
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string TokenHash { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
}

public sealed class AuditEntry
{
    public long Id { get; set; }
    public required string ActorId { get; set; }
    public required string Action { get; set; }
    public required string Entity { get; set; }
    public required string EntityId { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
}
