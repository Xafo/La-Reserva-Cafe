namespace LaReserva.Domain;

public sealed class Product
{
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
    public required string Id { get; set; }
    public required string CustomerName { get; set; }
    public required string Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public decimal TotalLps { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}

public sealed class OrderItem
{
    public long Id { get; set; }
    public required string OrderId { get; set; }
    public required string ProductId { get; set; }
    public required string ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceLps { get; set; }
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
