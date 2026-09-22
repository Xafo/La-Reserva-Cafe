namespace LaReserva.Domain;

public sealed class CommercialRequest
{
    public Guid Id { get; set; }
    public required string AccountId { get; set; }
    public required string Profile { get; set; }
    public required string OnboardingJson { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string Status { get; set; } = "Nueva";
    public string? AssignedUserId { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
    public string HistoryJson { get; set; } = "[]";
}
