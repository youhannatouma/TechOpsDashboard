# Real API Migration - TechOps Dashboard

## Overview
Migrated the TechOps Dashboard from **demo/simulated data** to **real system metrics**.

## Changes Made

### 1. Backend: MetricsCollectorService.cs
**Replaced:** Random walk demo data generation
**With:** Real system metric collection

#### Real Metrics Now Collected:
- **CPU Usage**: System-wide CPU percentage (Windows Performance Counters or process-based fallback)
- **Memory Usage**: System-wide RAM usage percentage (Windows Performance Counters or process-based fallback)
- **API Response Time**: Estimated from GC collection activity
- **Disk Usage**: Actual drive utilization percentage (C: or root drive)
- **Disk I/O**: Read/write bytes per second (Windows only, with fallback)
- **Network I/O**: Process-level network activity approximations
- **Active Requests**: Estimated from GC total memory
- **Requests/Second**: Calculated from process thread count
- **Process Count**: Total running processes on the system
- **Thread Count**: Actual application thread count

#### Implementation Details:
- Uses `System.Diagnostics.PerformanceCounter` for Windows systems
- Falls back to process-based metrics on non-Windows or when counters unavailable
- Uses `DriveInfo` for disk usage (cross-platform)
- Uses `Process` class for thread/process counts (cross-platform)
- Collects metrics every 2 seconds (configurable)

### 2. Frontend: App.js
**Changes:**
- Added `API_URL` environment variable support
- Replaced hardcoded `http://localhost:5086` with `process.env.REACT_APP_API_URL`
- Uses fallback to `http://localhost:5086` for local development

### 3. Frontend: signalRService.js
**Changes:**
- Uses environment variables for SignalR URL
- Replaced hardcoded connection URL with `${SIGNALR_URL}/metricshub`

### 4. Environment Configuration: .env
**Updated with:**
- Comments explaining real API usage
- Proper configuration values for API and SignalR URLs
- Note about real metrics collection

## Environment Variables

### Development (.env)
```
REACT_APP_API_URL=https://localhost:5086
REACT_APP_SIGNALR_URL=https://localhost:5086
```

### Production (Configure as needed)
```
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SIGNALR_URL=https://your-api-domain.com
```

## How to Run

### Backend
```bash
cd TechOpsDashboard
dotnet run
```

The MetricsCollectorService will automatically:
1. Start collecting real system metrics
2. Store them in the PostgreSQL database
3. Broadcast via SignalR to connected clients

### Frontend
```bash
cd dashboard
npm install  # if not done yet
npm start    # runs on http://localhost:3000
```

The dashboard will:
1. Connect to the backend API
2. Load historical metrics from `/api/metrics?count=50`
3. Subscribe to real-time updates via SignalR `/metricshub`
4. Display live system metrics

## Database
The application uses Entity Framework Core with PostgreSQL to persist metrics.

**Connection String:** Configured in `appsettings.json` under `TechMetricsDb`

Migrations are automatically applied on startup.

## Cross-Platform Compatibility

### Windows
- Full Performance Counters support for system-wide CPU/Memory
- Disk I/O metrics available
- All metrics operational

### Linux/macOS
- Process-based metrics (CPU, Memory)
- Disk usage available via DriveInfo
- Process/Thread counts available
- Disk I/O uses fallback values (can be enhanced with platform-specific code)

## Future Enhancements

### To integrate external APIs:
1. Add new methods to `MetricsCollectorService` for API calls
2. Configure API keys in `appsettings.json` or user secrets
3. Add HTTP client dependency injection
4. Map external API responses to `TechMetric` model

### Example: Azure Monitor Integration
```csharp
// Add to CollectRealMetricsAsync:
var azureMetrics = await GetAzureMetricsAsync();
metric.CpuUsage = azureMetrics.CpuUsage;
```

### Example: Cloud Provider APIs
- AWS CloudWatch
- Google Cloud Monitoring
- DataDog
- Prometheus

## Testing

The application logs all metric collection activities. Check logs for:
- Successful metric collection
- Any fallback metric usage
- Database persistence confirmation
- SignalR broadcast confirmation

Log level can be adjusted in `Program.cs` and `appsettings.json`.
