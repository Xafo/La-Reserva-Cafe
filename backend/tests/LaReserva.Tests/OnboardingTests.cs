using System.Text.Json;
using LaReserva.Application;
using LaReserva.Domain;
using LaReserva.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LaReserva.Tests;

public sealed class OnboardingTests
{
    private static OnboardingDto Complete() => new(1, "new", new()
    {
        ["n1"] = "Solo negro", ["n2"] = "Florales y delicados", ["n3"] = "Suave y ligero",
        ["n4"] = "Método manual", ["n5"] = "Un regalo especial",
    }, DateTimeOffset.UtcNow);

    [Fact]
    public void Validation_RejectsMissingUnknownAndCrossProfileAnswers()
    {
        Assert.Null(OnboardingRules.Validate(Complete()));
        Assert.NotNull(OnboardingRules.Validate(null));
        Assert.NotNull(OnboardingRules.Validate(Complete() with { Version = 2 }));
        Assert.NotNull(OnboardingRules.Validate(Complete() with { Profile = "business" }));
        var missing = Complete(); missing.Answers.Remove("n1");
        Assert.NotNull(OnboardingRules.Validate(missing));
        var unknown = Complete(); unknown.Answers["n1"] = "Desconocido";
        Assert.NotNull(OnboardingRules.Validate(unknown));
        var mixed = Complete(); mixed.Answers["a1"] = "Tueste claro";
        Assert.NotNull(OnboardingRules.Validate(mixed));
    }

    [Fact]
    public async Task SavingOnboarding_PreservesLegacyPreferencesAndRoundTrips()
    {
        var options = new DbContextOptionsBuilder<LaReservaDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        await using var db = new LaReservaDbContext(options);
        var account = new CustomerAccount
        {
            Id = "legacy-account", Name = "Prueba", Email = "prueba@example.com", Phone = "", City = "",
            PasswordHash = "not-a-real-password", CreatedAt = DateTimeOffset.UtcNow,
            Preferences = new CustomerPreference { AccountId = "legacy-account", Intensity = "Suave", Budget = "Hasta L400", Goals = ["Regalar cafe"] },
        };
        db.CustomerAccounts.Add(account); await db.SaveChangesAsync();
        Assert.Null(account.ToDto().Onboarding);
        account.OnboardingJson = JsonSerializer.Serialize(Complete());
        await db.SaveChangesAsync(); db.ChangeTracker.Clear();
        var saved = await db.CustomerAccounts.Include(a => a.Preferences).SingleAsync();
        Assert.Equal("Suave", saved.Preferences!.Intensity);
        Assert.Equal("Regalar cafe", saved.Preferences.Goals.Single());
        Assert.Equal("new", saved.ToDto().Onboarding!.Profile);
        Assert.Equal("Un regalo especial", saved.ToDto().Onboarding!.Answers["n5"]);
    }
}
