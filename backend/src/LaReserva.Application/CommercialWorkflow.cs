using System.Text.Json;
using LaReserva.Domain;

namespace LaReserva.Application;

public sealed record UpdateCommercialWorkflowRequest(string Status, string? AssignedUserId, Guid Version, string? Note);
public sealed record CommercialHistoryEntry(DateTimeOffset At, string ActorId, string ActorType,
    string PreviousStatus, string Status, string? PreviousAssignee, string? Assignee, string Note, OnboardingDto? PreviousOnboarding);

public static class CommercialWorkflow
{
    public static bool SameAnswers(OnboardingDto left, OnboardingDto right) =>
        left.Version == right.Version && left.Profile == right.Profile && left.Answers.Count == right.Answers.Count &&
        left.Answers.All(pair => right.Answers.TryGetValue(pair.Key, out var answer) && answer == pair.Value);
    public static bool CanAssign(string role) => role is "Administrador" or "Compras" or "Ventas";
    public static bool CanTransition(string from, string to) => (from, to) switch
    {
        ("Nueva", "Nueva" or "En contacto" or "Cerrada") => true,
        ("En contacto", "En contacto" or "Propuesta enviada" or "Cerrada") => true,
        ("Propuesta enviada", "Propuesta enviada" or "En contacto" or "Cerrada") => true,
        ("Cerrada", "Cerrada" or "Nueva") => true,
        _ => false,
    };

    public static void Record(CommercialRequest request, string actorId, string actorType, string status,
        string? assignee, string note, OnboardingDto? previousOnboarding = null)
    {
        var now = DateTimeOffset.UtcNow;
        var history = JsonSerializer.Deserialize<List<CommercialHistoryEntry>>(request.HistoryJson) ?? [];
        history.Add(new(now, actorId, actorType, request.Status, status, request.AssignedUserId, assignee, note, previousOnboarding));
        request.HistoryJson = JsonSerializer.Serialize(history);
        request.Status = status;
        request.AssignedUserId = assignee;
        request.UpdatedAt = now;
        request.Version = Guid.NewGuid();
    }
}
