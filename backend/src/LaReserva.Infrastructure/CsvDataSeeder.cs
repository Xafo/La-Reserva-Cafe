using System.Globalization;
using System.Text;
using LaReserva.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace LaReserva.Infrastructure;

public sealed class CsvDataSeeder(
    LaReservaDbContext dbContext,
    IConfiguration configuration,
    IPasswordHasher<User> userPasswordHasher,
    IPasswordHasher<CustomerAccount> accountPasswordHasher)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await dbContext.Products.AnyAsync(cancellationToken)) return;

        var seedPath = configuration["Seed:DataPath"]
            ?? throw new InvalidOperationException("Falta Seed:DataPath.");
        var adminPassword = RequireSecret("Seed:AdminPassword");
        var customerPassword = RequireSecret("Seed:CustomerPassword");

        var products = Read("products.csv", seedPath).Select(row => new Product
        {
            Id = row["id"],
            Name = row["name"],
            Origin = row["origin"],
            Region = row["region"],
            Process = row["process"],
            Roast = row["roast"],
            PresentationGrams = Int(row, "presentationGrams"),
            PriceLps = Decimal(row, "priceLps"),
            Stock = Int(row, "stock"),
            Active = bool.Parse(row["active"]),
            Description = row["description"],
            ImageUrl = row["imageUrl"],
            ImageAlt = row["imageAlt"],
            Quality = new QualityProfile
            {
                ProductId = row["id"],
                GrainType = row["quality_grainType"],
                AltitudeMasl = Int(row, "quality_altitudeMasl"),
                HumidityPct = Decimal(row, "quality_humidityPct"),
                HarvestDate = DateOnly.ParseExact(row["quality_harvestDate"], "yyyy-MM-dd", CultureInfo.InvariantCulture),
                Producer = row["quality_producer"],
                Grade = row["quality_grade"],
                CuppingScore = Decimal(row, "quality_cuppingScore"),
                Notes = Split(row["quality_notes"]),
            },
        }).ToArray();
        dbContext.Products.AddRange(products);

        var orders = Read("orders.csv", seedPath).Select(row => new Order
        {
            Id = row["id"],
            CustomerName = row["customerName"],
            Status = row["status"],
            CreatedAt = Timestamp(row["createdAt"]),
            TotalLps = Decimal(row, "totalLps"),
            Items = Split(row["items"]).Select(item =>
            {
                var values = item.Split('~');
                return new OrderItem
                {
                    OrderId = row["id"],
                    ProductId = values[0],
                    ProductName = values[1],
                    Quantity = int.Parse(values[2], CultureInfo.InvariantCulture),
                    UnitPriceLps = decimal.Parse(values[3], CultureInfo.InvariantCulture),
                };
            }).ToList(),
        }).ToArray();
        dbContext.Orders.AddRange(orders);

        dbContext.Customers.AddRange(Read("customers.csv", seedPath).Select(row => new Customer
        {
            Id = row["id"],
            Name = row["name"],
            Email = NormalizeEmail(row["email"]),
            Phone = row["phone"],
            Type = row["type"],
            City = row["city"],
            TotalOrders = Int(row, "totalOrders"),
        }));

        foreach (var row in Read("users.csv", seedPath))
        {
            var user = new User
            {
                Id = row["id"],
                Name = row["name"],
                Email = NormalizeEmail(row["email"]),
                Role = row["role"],
                PasswordHash = string.Empty,
            };
            user.PasswordHash = userPasswordHasher.HashPassword(user, adminPassword);
            dbContext.Users.Add(user);
        }

        foreach (var row in Read("accounts.csv", seedPath))
        {
            var account = new CustomerAccount
            {
                Id = row["id"],
                Name = row["name"],
                Email = NormalizeEmail(row["email"]),
                PasswordHash = string.Empty,
                Phone = row["phone"],
                City = row["city"],
                CreatedAt = Timestamp(row["createdAt"]),
                RecommendedProductId = EmptyToNull(row["recommendedProductId"]),
            };
            account.PasswordHash = accountPasswordHasher.HashPassword(account, customerPassword);
            if (!string.IsNullOrEmpty(row["pref_intensity"]))
            {
                account.Preferences = new CustomerPreference
                {
                    AccountId = account.Id,
                    Goals = Split(row["pref_goals"]),
                    BrewMethods = Split(row["pref_brewMethods"]),
                    DrinkStyles = Split(row["pref_drinkStyles"]),
                    FlavorFamilies = Split(row["pref_flavorFamilies"]),
                    Intensity = row["pref_intensity"],
                    Budget = row["pref_budget"],
                    UpdatedAt = Timestamp(row["pref_updatedAt"]),
                };
            }
            dbContext.CustomerAccounts.Add(account);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private string RequireSecret(string key)
    {
        var value = configuration[key];
        if (string.IsNullOrWhiteSpace(value) || value.Length < 8)
            throw new InvalidOperationException($"{key} debe tener al menos 8 caracteres.");
        return value;
    }

    private static IEnumerable<Dictionary<string, string>> Read(string fileName, string seedPath)
    {
        var rows = ParseCsv(File.ReadAllText(Path.Combine(seedPath, fileName), Encoding.UTF8));
        var headers = rows[0];
        return rows.Skip(1).Select(row => headers
            .Select((header, index) => new { header, value = index < row.Length ? row[index] : string.Empty })
            .ToDictionary(item => item.header, item => item.value));
    }

    private static List<string[]> ParseCsv(string text)
    {
        var rows = new List<string[]>();
        var row = new List<string>();
        var field = new StringBuilder();
        var quoted = false;

        for (var index = 0; index < text.Length; index++)
        {
            var character = text[index];
            if (quoted)
            {
                if (character == '"' && index + 1 < text.Length && text[index + 1] == '"')
                {
                    field.Append('"');
                    index++;
                }
                else if (character == '"') quoted = false;
                else field.Append(character);
                continue;
            }

            if (character == '"') quoted = true;
            else if (character == ',')
            {
                row.Add(field.ToString());
                field.Clear();
            }
            else if (character is '\r' or '\n')
            {
                if (character == '\r' && index + 1 < text.Length && text[index + 1] == '\n') index++;
                row.Add(field.ToString());
                field.Clear();
                if (row.Count > 1 || row[0].Length > 0) rows.Add(row.ToArray());
                row.Clear();
            }
            else field.Append(character);
        }

        row.Add(field.ToString());
        if (row.Count > 1 || row[0].Length > 0) rows.Add(row.ToArray());
        return rows;
    }

    private static int Int(IReadOnlyDictionary<string, string> row, string key) =>
        int.Parse(row[key], CultureInfo.InvariantCulture);

    private static decimal Decimal(IReadOnlyDictionary<string, string> row, string key) =>
        decimal.Parse(row[key], CultureInfo.InvariantCulture);

    private static DateTimeOffset Timestamp(string value) =>
        DateTimeOffset.Parse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);

    private static string[] Split(string value) => value.Length == 0 ? [] : value.Split('|');
    private static string NormalizeEmail(string value) => value.Trim().ToLowerInvariant();
    private static string? EmptyToNull(string value) => value.Length == 0 ? null : value;
}
