namespace TechOpsDashboard.Models
{
    public class StockQuote
    {
        public int Id { get; set; }
        public string Symbol { get; set; }         
        public string CompanyName { get; set; }     
        public double Price { get; set; }           
        public double PreviousClose { get; set; }   
        public double Change { get; set; }          
        public double ChangePercent { get; set; }   
        public long Volume { get; set; }            
        public double High { get; set; }            
        public double Low { get; set; }             
        public double Open { get; set; }            
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; 
        public DateTime QuoteTime { get; set; }     
    }

    public class PortfolioHolding
    {
        public int Id { get; set; }
        public string Symbol { get; set; }
        public string CompanyName { get; set; }
        public int Shares { get; set; }
        public double CostBasis { get; set; }      
        public double CurrentPrice { get; set; }    
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
