# Finance Dashboard - Stock Market Tracker

## Overview
Integrated a **stock market dashboard** for finance professionals directly into your TechOps Dashboard. Now users can toggle between infrastructure monitoring and stock portfolio tracking.

## Features

### 🎯 Market Indices
Real-time tracking of major market indices:
- **S&P 500** (GSPC) - Broad market indicator
- **Nasdaq 100** (CCMP) - Tech-heavy index
- **Dow Jones** (INDU) - Blue-chip stocks

### 💼 Portfolio Tracker
- Add/remove stock holdings to personal portfolio
- Track cost basis, current price, and gain/loss per position
- View total portfolio value and overall performance
- Real-time price updates

### 👁️ Watchlist
- Save stocks to monitor without buying
- Quick price snapshots for tracked symbols
- Easy add/remove management

### 🔍 Stock Search
- Search for stocks by symbol or company name
- Real-time quotes with price and change data
- Quick add to watchlist or portfolio

## Architecture

### Backend

#### New C# Models
```
StockQuote          - Real-time stock data from Alpha Vantage
PortfolioHolding    - User's stock positions
WatchlistItem       - Monitored stocks
MarketIndex         - Major market indices (S&P 500, Nasdaq, Dow)
```

#### New Service: AlphaVantageService
- Fetches stock data from **Alpha Vantage API** (free tier)
- Methods:
  - `GetStockQuoteAsync(symbol)` - Get single stock price
  - `GetMarketIndicesAsync()` - Fetch S&P 500, Nasdaq, Dow
  - `SearchStocksAsync(query)` - Search for stocks by name/symbol

#### New Controller: StocksController
API Endpoints:
- `GET /api/stocks/quote/{symbol}` - Get stock price
- `GET /api/stocks/search?q=apple` - Search stocks
- `GET /api/stocks/indices` - Get market indices
- `GET /api/stocks/portfolio` - List portfolio
- `POST /api/stocks/portfolio` - Add to portfolio
- `DELETE /api/stocks/portfolio/{id}` - Remove from portfolio
- `GET /api/stocks/watchlist` - Get watchlist
- `POST /api/stocks/watchlist` - Add to watchlist
- `DELETE /api/stocks/watchlist/{id}` - Remove from watchlist

### Frontend

#### React Components
- `AppRoot.js` - Navigation and tab switching
- `App.js` - TechOps Dashboard (renamed from original)
- `FinanceDashboard.js` - New finance/stock tracker

#### Components in FinanceDashboard
- `MarketIndicesSection` - Display major indices
- `PortfolioSection` - Manage stock positions
- `WatchlistSection` - Monitor stocks
- `SearchBox` - Find and add stocks
- Helper functions for currency/percent formatting

## Setup Instructions

### 1. Get Free Alpha Vantage API Key
- Visit: https://www.alphavantage.co/
- Sign up for free API key (5 requests/minute limit)
- Copy your API key

### 2. Update Backend Configuration
Edit `appsettings.json`:
```json
{
  "AlphaVantage": {
    "ApiKey": "YOUR_API_KEY_HERE"
  }
}
```

Or use user secrets (recommended for production):
```bash
cd TechOpsDashboard
dotnet user-secrets set "AlphaVantage:ApiKey" "YOUR_API_KEY_HERE"
```

### 3. Run Database Migrations
The migrations automatically apply on startup, but you can manually run:
```bash
dotnet ef database update
```

### 4. Start Backend
```bash
cd TechOpsDashboard
dotnet run
```

### 5. Start Frontend
```bash
cd dashboard
npm start
```

The app will run on `http://localhost:3000` with tabs to switch between:
- **📊 TechOps Dashboard** - Infrastructure metrics
- **💰 Finance Dashboard** - Stock portfolio & market tracking

## Database Schema

### StockQuotes
Stores recent stock quotes (automatically cached when fetched)
```
Symbol, CompanyName, Price, PreviousClose, Change%, Volume, High, Low, Open, Timestamp
```

### PortfolioHoldings
User's stock positions
```
Symbol, CompanyName, Shares, CostBasis ($/share), CurrentPrice, PurchaseDate, LastUpdated
```

### WatchlistItems
Tracked stocks
```
Symbol, CompanyName, CurrentPrice, Change, Change%, AddedDate, LastUpdated
```

### MarketIndices
Major market indices
```
Symbol (GSPC/CCMP/INDU), Name, Value, Change, Change%, Timestamp
```

## Cost & Rate Limits

### Alpha Vantage Free Tier
- **5 API calls per minute**
- Unlimited daily requests
- Real-time stock data (15-20 minute delay in free tier)
- Perfect for demo/development

### Upgrade Options
- **Premium:** Better rate limits and faster data
- **Alternative APIs:**
  - **finnhub.io** - 60 requests/minute free tier
  - **IEX Cloud** - Paid but professional grade
  - **Alpha Vantage Premium** - Faster updates

## Future Enhancements

### Immediate
1. Add price alerts when stock exceeds/falls below threshold
2. Real-time portfolio value calculations
3. Persistent user preferences

### Advanced
1. Historical price charts using Chart.js or Recharts
2. Portfolio performance metrics (ROI, beta, etc.)
3. Stock news feed integration
4. Technical indicators (RSI, MACD, Bollinger Bands)
5. Multi-user portfolio management with authentication
6. Email alerts for price changes

### API Upgrades
1. Switch to professional stock API (finnhub, IEX)
2. Add options/futures data
3. Integrate with real portfolio platforms (Alpaca, Robinhood API)

## Testing

### Test with Demo API Key
The app ships with `ApiKey: "demo"` which allows limited testing. Replace with real key for live data.

### Popular Test Stocks
- `AAPL` - Apple
- `MSFT` - Microsoft
- `GOOGL` - Google
- `AMZN` - Amazon
- `TSLA` - Tesla
- `NVDA` - Nvidia

## Troubleshooting

### "Unable to find package"
If NuGet packages fail to restore, authenticate with Azure Artifacts (if using private feeds)

### API Rate Limit Exceeded
Wait 60 seconds before making more requests (Alpha Vantage free tier: 5/minute)

### No Stock Data Appearing
1. Check your API key in `appsettings.json`
2. Verify backend is running on port 5086
3. Check browser console for network errors
4. Ensure database migrations ran successfully

### Database Connection Failed
Check PostgreSQL is running and connection string is correct:
```
Host=localhost;Port=5432;Database=TechMetricsDb;Username=postgres;Password=1234567890
```

## Files Changed/Created

### Backend
- `Services/AlphaVantageService.cs` - Stock data service
- `Controllers/StocksController.cs` - API endpoints
- `Models/StockQuote.cs` - Stock models
- `Migrations/20260519000000_AddStockModels.cs` - Database schema
- `appsettings.json` - Alpha Vantage configuration
- `Program.cs` - Service registration

### Frontend
- `src/AppRoot.js` - Navigation & tab switching
- `src/App.js` - Renamed from original, now TechOpsDashboard
- `src/FinanceDashboard.js` - New stock dashboard
- `src/index.js` - Updated to use AppRoot

## Architecture Diagram

```
User Browser (http://localhost:3000)
    ↓
React App (AppRoot.js)
    ├── TechOps Dashboard (App.js)
    │   └── Real-time metrics via SignalR
    └── Finance Dashboard (FinanceDashboard.js)
        └── Stock data via REST API
            ↓
.NET Backend (http://localhost:5086)
    ├── /api/stocks/quote/{symbol}
    ├── /api/stocks/indices
    ├── /api/stocks/portfolio
    ├── /api/stocks/watchlist
    └── /metricshub (SignalR)
        ↓
External Services
├── Alpha Vantage (Free Stock Data)
├── PostgreSQL (Database)
└── Windows Performance Counters (System Metrics)
```

## Next Steps
1. Get your Alpha Vantage API key
2. Update `appsettings.json` with your key
3. Run backend: `dotnet run`
4. Run frontend: `npm start`
5. Open http://localhost:3000
6. Click "Finance Dashboard" tab to start tracking stocks!

Enjoy tracking both your infrastructure AND your portfolio! 📊💰
