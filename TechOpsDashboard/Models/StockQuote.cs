namespace TechOpsDashboard.Models
{
    public class StockQuote
    {
        public int Id { get; set; }
        public string Symbol { get; set; }          // e.g., "AAPL", "MSFT"
        public string CompanyName { get; set; }     // e.g., "Apple Inc."
        public double Price { get; set; }           // Current price
        public double PreviousClose { get; set; }   // Previous close price
        public double Change { get; set; }          // Price change ($)
        public double ChangePercent { get; set; }   // Percent change (%)
        public long Volume { get; set; }            // Trading volume
        public double High { get; set; }            // Day high
        public double Low { get; set; }             // Day low
        public double Open { get; set; }            // Day open
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;  // When this quote was fetched
        public DateTime QuoteTime { get; set; }     // When the exchange provided this quote
    }

    public class PortfolioHolding
    {
        public int Id { get; set; }
        public string Symbol { get; set; }
        public string CompanyName { get; set; }
        public int Shares { get; set; }
        public double CostBasis { get; set; }       // Price paid per share
        public double CurrentPrice { get; set; }    // Current market price
        public DateTime PurchaseDate { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class WatchlistItem
    {
        public int Id { get; set; }
        public string Symbol { get; set; }
        public string CompanyName { get; set; }
        public double CurrentPrice { get; set; }
        public double Change { get; set; }
        public double ChangePercent { get; set; }
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class MarketIndex
    {
        public int Id { get; set; }
        public string Symbol { get; set; }          // "GSPC" (S&P 500), "CCMP" (Nasdaq), "INDU" (Dow)
        public string Name { get; set; }            // "S&P 500", "Nasdaq 100", "Dow Jones"
        public double Value { get; set; }
        public double Change { get; set; }
        public double ChangePercent { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class StockHistoryPoint
    {
        public DateTime Date { get; set; }
        public double Close { get; set; }
    }
}
