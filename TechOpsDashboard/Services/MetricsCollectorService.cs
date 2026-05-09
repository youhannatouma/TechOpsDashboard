using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Data;
using TechOpsDashboard.Hubs;
using TechOpsDashboard.Models;

namespace TechOpsDashboard.Services
{

    public class MetricsCollectorService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<MetricsHub> _hub;
        private readonly ILogger<MetricsCollectorService> _logger;

        // Tracks previous values so changes feel continuous, not random
        private TechMetric _prev = new()
        {
            CpuUsage = 35,
            MemoryUsage = 52,
            ApiResponseTime = 85,
            DiskUsage = 61,
            DiskReadBytes = 2_500_000,
            DiskWriteBytes = 800_000,
            NetworkInBytes = 1_200_000,
            NetworkOutBytes = 400_000,
            ActiveRequests = 12,
            RequestsPerSecond = 40,
            ErrorRate = 0.5,
            ProcessCount = 210,
            ThreadCount = 1_450,
        };

        private static readonly Random _rng = new();

        public MetricsCollectorService(
            IServiceScopeFactory scopeFactory,
            IHubContext<MetricsHub> hub,
            ILogger<MetricsCollectorService> logger)
        {
            _scopeFactory = scopeFactory;
            _hub = hub;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MetricsCollectorService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var metric = Generate();

                    await PersistAsync(metric, stoppingToken);
                    await _hub.Clients.All.SendAsync("ReceiveMetric", metric, stoppingToken);

                    _prev = metric;
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Error collecting/broadcasting metrics");
                }

                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            }
        }


        private TechMetric Generate() => new()
        {
            Timestamp = DateTime.UtcNow,

            CpuUsage = Walk(_prev.CpuUsage, 0, 100, delta: 6, drift: -0.3),
            MemoryUsage = Walk(_prev.MemoryUsage, 20, 95, delta: 3, drift: -0.1),
            ApiResponseTime = Walk(_prev.ApiResponseTime, 10, 800, delta: 40, drift: -2),

            DiskUsage = Walk(_prev.DiskUsage, 30, 95, delta: 0.3, drift: 0),   // grows slowly
            DiskReadBytes = Walk(_prev.DiskReadBytes, 0, 50e6, delta: 3e6, drift: -0.5e6),
            DiskWriteBytes = Walk(_prev.DiskWriteBytes, 0, 20e6, delta: 1e6, drift: -0.2e6),

            NetworkInBytes = Walk(_prev.NetworkInBytes, 0, 100e6, delta: 5e6, drift: -0.5e6),
            NetworkOutBytes = Walk(_prev.NetworkOutBytes, 0, 40e6, delta: 2e6, drift: -0.2e6),

            ActiveRequests = (int)Walk(_prev.ActiveRequests, 0, 200, delta: 8, drift: -0.5),
            RequestsPerSecond = (int)Walk(_prev.RequestsPerSecond, 0, 500, delta: 20, drift: -1),
            ErrorRate = Walk(_prev.ErrorRate, 0, 25, delta: 1.5, drift: -0.2),

            ProcessCount = (int)Walk(_prev.ProcessCount, 150, 400, delta: 3, drift: 0),
            ThreadCount = (int)Walk(_prev.ThreadCount, 800, 4000, delta: 50, drift: 0),
        };


        private static double Walk(double current, double min, double max, double delta, double drift)
        {
            var step = (_rng.NextDouble() * 2 - 1) * delta + drift;
            return Math.Clamp(current + step, min, max);
        }


        private async Task PersistAsync(TechMetric metric, CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<TechMetricsContext>();
            db.TechMetrics.Add(metric);
            await db.SaveChangesAsync(ct);
        }
    }
}