using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using TechOpsDashboard.Data;
using TechOpsDashboard.Models;
using Microsoft.AspNetCore.SignalR;
using TechOpsDashboard.Hubs;

public class MetricsSimulationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<MetricsHub> _hubContext;

    public MetricsSimulationService(IServiceScopeFactory scopeFactory,
                                    IHubContext<MetricsHub> hubContext)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
    }


    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var random = new Random();

        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<TechMetricsContext>();

            var metric = new TechMetric
            {
                CpuUsage = random.NextDouble() * 100,
                MemoryUsage = random.NextDouble() * 100,
                ApiResponseTime = random.NextDouble() * 500,
                Timestamp = DateTime.UtcNow
            };

            context.TechMetrics.Add(metric);
            await context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveMetric", metric);

            await Task.Delay(5000, stoppingToken);
        }
    }
}