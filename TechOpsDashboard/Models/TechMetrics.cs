namespace TechOpsDashboard.Models
{
    public class TechMetric
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // ── Core ────────────────────────────────────────────
        public double CpuUsage { get; set; }           // %
        public double MemoryUsage { get; set; }        // %
        public double ApiResponseTime { get; set; }    // ms

        // ── Disk ────────────────────────────────────────────
        public double DiskUsage { get; set; }          // % of total disk used
        public double DiskReadBytes { get; set; }      // bytes/s
        public double DiskWriteBytes { get; set; }     // bytes/s

        // ── Network ─────────────────────────────────────────
        public double NetworkInBytes { get; set; }     // bytes/s
        public double NetworkOutBytes { get; set; }    // bytes/s

        // ── HTTP ────────────────────────────────────────────
        public int ActiveRequests { get; set; }        // current in-flight requests
        public int RequestsPerSecond { get; set; }     // throughput
        public double ErrorRate { get; set; }          // % of requests that errored

        // ── Processes ───────────────────────────────────────
        public int ProcessCount { get; set; }          // total running processes
        public int ThreadCount { get; set; }           // total threads across all processes
    }
}