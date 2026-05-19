using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Data;
using TechOpsDashboard.Hubs;
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

// Auto-apply migrations on startup so you don't have to run dotnet ef manually
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TechMetricsContext>();
    db.Database.Migrate();
}

app.Run();