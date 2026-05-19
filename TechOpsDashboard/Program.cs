using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Data;
using TechOpsDashboard.Hubs;
using TechOpsDashboard.Models;
using TechOpsDashboard.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddDbContext<TechMetricsContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TechMetricsDb")));

// Register the background metrics simulator
builder.Services.AddHostedService<MetricsCollectorService>();

// Register stock data service
builder.Services.AddHttpClient<IStockDataService, AlphaVantageService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ── Middleware ───────────────────────────────────────────────────────────────
app.UseCors("Frontend");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapHub<MetricsHub>("/metricshub");

// Auto-apply migrations and seed demo finance data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TechMetricsContext>();
    db.Database.Migrate();
    SeedDemoFinanceData(db);
}

app.Run();

static void SeedDemoFinanceData(TechMetricsContext db)
{
    if (!db.PortfolioHoldings.Any())
    {
        db.PortfolioHoldings.AddRange(
            new PortfolioHolding
            {
                Symbol = "AAPL",
                CompanyName = "Apple Inc.",
                Shares = 12,
                CostBasis = 168.50,
                CurrentPrice = 179.30,
                PurchaseDate = DateTime.UtcNow.AddDays(-42),
                LastUpdated = DateTime.UtcNow,
            },
            new PortfolioHolding
            {
                Symbol = "MSFT",
                CompanyName = "Microsoft Corporation",
                Shares = 8,
                CostBasis = 295.00,
                CurrentPrice = 324.10,
                PurchaseDate = DateTime.UtcNow.AddDays(-18),
                LastUpdated = DateTime.UtcNow,
            }
        );
    }

    if (!db.WatchlistItems.Any())
    {
        db.WatchlistItems.AddRange(
            new WatchlistItem
            {
                Symbol = "GOOGL",
                CompanyName = "Alphabet Inc.",
                CurrentPrice = 144.80,
                Change = 1.95,
                ChangePercent = 1.36,
                AddedDate = DateTime.UtcNow.AddDays(-2),
                LastUpdated = DateTime.UtcNow,
            },
            new WatchlistItem
            {
                Symbol = "TSLA",
                CompanyName = "Tesla, Inc.",
                CurrentPrice = 252.10,
                Change = -4.52,
                ChangePercent = -1.76,
                AddedDate = DateTime.UtcNow.AddDays(-4),
                LastUpdated = DateTime.UtcNow,
            },
            new WatchlistItem
            {
                Symbol = "NVDA",
                CompanyName = "NVIDIA Corporation",
                CurrentPrice = 640.25,
                Change = 12.18,
                ChangePercent = 1.94,
                AddedDate = DateTime.UtcNow.AddDays(-1),
                LastUpdated = DateTime.UtcNow,
            }
        );
    }

    if (!db.MarketIndices.Any())
    {
        db.MarketIndices.AddRange(
            new MarketIndex
            {
                Symbol = "GSPC",
                Name = "S&P 500",
                Value = 5390.12,
                Change = 14.38,
                ChangePercent = 0.27,
                Timestamp = DateTime.UtcNow,
            },
            new MarketIndex
            {
                Symbol = "CCMP",
                Name = "Nasdaq 100",
                Value = 20345.76,
                Change = 118.65,
                ChangePercent = 0.59,
                Timestamp = DateTime.UtcNow,
            },
            new MarketIndex
            {
                Symbol = "INDU",
                Name = "Dow Jones Industrial Average",
                Value = 39730.08,
                Change = 89.17,
                ChangePercent = 0.23,
                Timestamp = DateTime.UtcNow,
            }
        );
    }

    if (db.ChangeTracker.HasChanges())
    {
        db.SaveChanges();
    }
}
