using System.Net.Http;
using System.Text.Json;
using TechOpsDashboard.Models;

namespace TechOpsDashboard.Services
{
    public interface IStockDataService
    {
        Task<StockQuote> GetStockQuoteAsync(string symbol);
        Task<List<MarketIndex>> GetMarketIndicesAsync();
        Task<List<StockQuote>> SearchStocksAsync(string query);
    }

    public class AlphaVantageService : IStockDataService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AlphaVantageService> _logger;
        private readonly string _apiKey;

        private const string BaseUrl = "https://www.alphavantage.co/query";
        private static readonly Dictionary<string, string> MarketIndexSymbols = new()
        {
            { "GSPC", "S&P 500" },
            { "CCMP", "Nasdaq 100" },
            { "INDU", "Dow Jones Industrial Average" },
        };

        public AlphaVantageService(HttpClient httpClient, ILogger<AlphaVantageService> logger, IConfiguration config)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = config["AlphaVantage:ApiKey"] ?? "demo";
        }

        /// <summary>
        /// Fetch a single stock quote from Alpha Vantage
        /// </summary>
        public async Task<StockQuote> GetStockQuoteAsync(string symbol)
        {
            try
            {
                var url = $"{BaseUrl}?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_apiKey}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (!root.TryGetProperty("Global Quote", out var quoteElement))
                {
                    _logger.LogWarning("No quote data found for symbol {symbol}", symbol);
                    return null;
                }

                var quote = quoteElement;
                return new StockQuote
                {
                    Symbol = symbol,
                    CompanyName = GetStringProperty(quote, "01. symbol"),
                    Price = ParseDouble(GetStringProperty(quote, "05. price")),
                    PreviousClose = ParseDouble(GetStringProperty(quote, "08. previous close")),
                    Change = ParseDouble(GetStringProperty(quote, "09. change")),
                    ChangePercent = ParseDouble(GetStringProperty(quote, "10. change percent").Replace("%", "")),
                    Volume = long.TryParse(GetStringProperty(quote, "06. volume"), out var vol) ? vol : 0,
                    High = ParseDouble(GetStringProperty(quote, "03. high")),
                    Low = ParseDouble(GetStringProperty(quote, "04. low")),
                    Open = ParseDouble(GetStringProperty(quote, "02. open")),
                    Timestamp = DateTime.UtcNow,
                    QuoteTime = DateTime.UtcNow,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stock quote for {symbol}", symbol);
                return null;
            }
        }

        /// <summary>
        /// Fetch major market indices
        /// </summary>
        public async Task<List<MarketIndex>> GetMarketIndicesAsync()
        {
            var indices = new List<MarketIndex>();

            foreach (var (symbol, name) in MarketIndexSymbols)
            {
                try
                {
                    var url = $"{BaseUrl}?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_apiKey}";
                    var response = await _httpClient.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("Global Quote", out var quoteElement))
                    {
                        var quote = quoteElement;
                        indices.Add(new MarketIndex
                        {
                            Symbol = symbol,
                            Name = name,
                            Value = ParseDouble(GetStringProperty(quote, "05. price")),
                            Change = ParseDouble(GetStringProperty(quote, "09. change")),
                            ChangePercent = ParseDouble(GetStringProperty(quote, "10. change percent").Replace("%", "")),
                            Timestamp = DateTime.UtcNow,
                        });
                    }

                    // Rate limiting: Alpha Vantage free tier is 5 requests per minute
                    await Task.Delay(300);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error fetching index {symbol}", symbol);
                }
            }

            return indices;
        }

        /// <summary>
        /// Search for stocks matching a query
        /// Uses Symbol Search from Alpha Vantage
        /// </summary>
        public async Task<List<StockQuote>> SearchStocksAsync(string query)
        {
            var results = new List<StockQuote>();

            try
            {
                var url = $"{BaseUrl}?function=SYMBOL_SEARCH&keywords={query}&apikey={_apiKey}";
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("bestMatches", out var matches))
                {
                    var enumerator = matches.EnumerateArray().Take(5);

                    foreach (var match in enumerator)
                    {
                        var symbol = GetStringProperty(match, "1. symbol");
                        var name = GetStringProperty(match, "2. name");

                        // Fetch full quote for each match
                        var quote = await GetStockQuoteAsync(symbol);
                        if (quote != null)
                        {
                            quote.CompanyName = name;
                            results.Add(quote);
                        }

                        await Task.Delay(300); // Rate limiting
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching stocks for query {query}", query);
            }

            return results;
        }

        private static string GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) ? prop.GetString() ?? "" : "";
        }

        private static double ParseDouble(string value)
        {
            return double.TryParse(value, out var result) ? result : 0d;
        }
    }
}
