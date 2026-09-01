using LaReserva.Domain;
using Microsoft.EntityFrameworkCore;

namespace LaReserva.Infrastructure;

public sealed class LaReservaDbContext(DbContextOptions<LaReservaDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<QualityProfile> QualityProfiles => Set<QualityProfile>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CustomerAccount> CustomerAccounts => Set<CustomerAccount>();
    public DbSet<CustomerPreference> CustomerPreferences => Set<CustomerPreference>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<CommercialRequest> CommercialRequests => Set<CommercialRequest>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("la_reserva");

        modelBuilder.Entity<CommercialRequest>(entity =>
        {
            entity.ToTable("commercial_requests");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => new { value.AccountId, value.Profile }).IsUnique();
            entity.Property(value => value.OnboardingJson).HasColumnType("jsonb");
            entity.Property(value => value.HistoryJson).HasColumnType("jsonb").HasDefaultValue("[]");
            entity.Property(value => value.Status).HasDefaultValue("Nueva");
            entity.Property(value => value.Version).IsConcurrencyToken();
            entity.HasOne<User>().WithMany().HasForeignKey(value => value.AssignedUserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<CustomerAccount>().WithMany().HasForeignKey(value => value.AccountId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(value => value.Id);
            entity.Property(value => value.PriceLps).HasPrecision(12, 2);
            entity.HasOne(value => value.Quality).WithOne()
                .HasForeignKey<QualityProfile>(value => value.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QualityProfile>(entity =>
        {
            entity.ToTable("quality_profiles");
            entity.HasKey(value => value.ProductId);
            entity.Property(value => value.HumidityPct).HasPrecision(5, 2);
            entity.Property(value => value.CuppingScore).HasPrecision(5, 2);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.HasKey(value => value.Id);
            entity.Property(value => value.TotalLps).HasPrecision(12, 2);
            entity.HasMany(value => value.Items).WithOne()
                .HasForeignKey(value => value.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.HasKey(value => value.Id);
            entity.Property(value => value.UnitPriceLps).HasPrecision(12, 2);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("customers");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.Email).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.Email).IsUnique();
        });

        modelBuilder.Entity<CustomerAccount>(entity =>
        {
            entity.Property(value => value.OnboardingJson).HasColumnType("jsonb");
            entity.ToTable("customer_accounts");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.Email).IsUnique();
            entity.HasOne(value => value.Preferences).WithOne()
                .HasForeignKey<CustomerPreference>(value => value.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<Product>().WithMany()
                .HasForeignKey(value => value.RecommendedProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CustomerPreference>(entity =>
        {
            entity.ToTable("customer_preferences");
            entity.HasKey(value => value.AccountId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.TokenHash).IsUnique();
            entity.HasIndex(value => new { value.SubjectId, value.SubjectType });
            entity.Property(value => value.RevokedAt).IsConcurrencyToken();
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.TokenHash).IsUnique();
        });

        modelBuilder.Entity<AuditEntry>(entity =>
        {
            entity.ToTable("audit_entries");
            entity.HasKey(value => value.Id);
            entity.HasIndex(value => value.OccurredAt);
        });
    }
}
