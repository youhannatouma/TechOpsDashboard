namespace TechOpsDashboard.Models
{
    public class TechMetric
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public double ApiResponseTime { get; set; }
    }
}
