using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Models;

namespace TechOpsDashboard.Data
{
    public class TechMetricsContext : DbContext
    {
        public TechMetricsContext(DbContextOptions<TechMetricsContext> options) : base(options) { }

        public DbSet<TechMetric> TechMetrics { get; set; }
        public DbSet<StockQuote> StockQuotes { get; set; }
        public DbSet<PortfolioHolding> PortfolioHoldings { get; set; }
        public DbSet<WatchlistItem> WatchlistItems { get; set; }
        public DbSet<MarketIndex> MarketIndices { get; set; }
    }
}