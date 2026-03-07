using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Models;

namespace TechOpsDashboard.Data
{
    public class TechMetricsContext : DbContext
    {
        public TechMetricsContext(DbContextOptions<TechMetricsContext> options) : base(options) { }

        public DbSet<TechMetric> TechMetrics { get; set; }
    }
}