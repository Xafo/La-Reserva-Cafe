using System.Text.Json;

namespace LaReserva.Application;

public static class OnboardingRules
{
    private static readonly JsonElement Schema = LoadSchema();

    private static JsonElement LoadSchema()
    {
        using var stream = typeof(OnboardingRules).Assembly.GetManifestResourceStream("onboarding-v1.json")
            ?? throw new InvalidOperationException("Falta el esquema de onboarding.");
        using var document = JsonDocument.Parse(stream);
        return document.RootElement.Clone();
    }

    public static string? Validate(OnboardingDto? value)
    {
        if (value is null || value.Version != 1 || string.IsNullOrWhiteSpace(value.Profile) || value.Answers is null)
            return "El perfil requiere versión 1 y respuestas válidas.";
        if (!Schema.GetProperty("questions").TryGetProperty(value.Profile, out var questions))
            return "Este perfil todavía no está habilitado.";
        if (value.Answers.Count != questions.GetArrayLength())
            return "Completá todas las preguntas del perfil elegido, sin respuestas de otros perfiles.";
        foreach (var question in questions.EnumerateArray())
        {
            var key = question.GetProperty("key").GetString()!;
            if (!value.Answers.TryGetValue(key, out var answer) ||
                !question.GetProperty("options").EnumerateArray().Any(option => option.GetProperty("value").GetString() == answer))
                return $"La respuesta {key} no es válida.";
        }
        return null;
    }
}
