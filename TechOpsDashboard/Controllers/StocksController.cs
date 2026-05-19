using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Data;
using TechOpsDashboard.Models;
using TechOpsDashboard.Services;

namespace TechOpsDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StocksController : ControllerBase
    {
        private readonly TechMetricsContext _context;
        private readonly IStockDataService _stockService;
        private readonly ILogger<StocksController> _logger;

        public StocksController(TechMetricsContext context, IStockDataService stockService, ILogger<StocksController> logger)
        {
            _context = context;
            _stockService = stockService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/stocks/quote/{symbol}
        /// Get real-time stock quote
        /// </summary>
        [HttpGet("quote/{symbol}")]
        public async Task<IActionResult> GetQuote(string symbol)
        {
            var quote = await _stockService.GetStockQuoteAsync(symbol.ToUpper());
            if (quote == null)
                return NotFound();

            // Cache the quote in database
            var existing = await _context.StockQuotes.FirstOrDefaultAsync(q => q.Symbol == symbol.ToUpper());
            if (existing != null)
            {
                _context.StockQuotes.Remove(existing);
            }
            _context.StockQuotes.Add(quote);
            await _context.SaveChangesAsync();

            return Ok(quote);
        }

        /// <summary>
        /// GET /api/stocks/search?q=apple
        /// Search for stocks
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("Query cannot be empty");

            var results = await _stockService.SearchStocksAsync(q);
            return Ok(results);
        }

        /// <summary>
        /// GET /api/stocks/indices
        /// Get major market indices (S&P 500, Nasdaq, Dow)
        /// </summary>
        [HttpGet("indices")]
        public async Task<IActionResult> GetIndices()
        {
            var indices = await _stockService.GetMarketIndicesAsync();
            
            // Cache indices
            foreach (var index in indices)
            {
                var existing = await _context.MarketIndices.FirstOrDefaultAsync(i => i.Symbol == index.Symbol);
                if (existing != null)
                {
                    _context.MarketIndices.Remove(existing);
                }
                _context.MarketIndices.Add(index);
            }
            await _context.SaveChangesAsync();

            return Ok(indices);
        }

        /// <summary>
        /// GET /api/stocks/portfolio
        /// Get all portfolio holdings
        /// </summary>
        [HttpGet("portfolio")]
        public async Task<IActionResult> GetPortfolio()
        {
            var holdings = await _context.PortfolioHoldings.ToListAsync();
            return Ok(holdings);
        }

        /// <summary>
        /// POST /api/stocks/portfolio
        /// Add a stock to portfolio
        /// </summary>
        [HttpPost("portfolio")]
        public async Task<IActionResult> AddToPortfolio([FromBody] PortfolioHolding holding)
        {
            if (string.IsNullOrWhiteSpace(holding.Symbol))
                return BadRequest("Symbol is required");

            // Check if already in portfolio
            var existing = await _context.PortfolioHoldings.FirstOrDefaultAsync(h => h.Symbol == holding.Symbol.ToUpper());
            if (existing != null)
            {
                // Update instead of adding
                existing.Shares = holding.Shares;
                existing.CostBasis = holding.CostBasis;
                existing.LastUpdated = DateTime.UtcNow;
                _context.PortfolioHoldings.Update(existing);
            }
            else
            {
                holding.Symbol = holding.Symbol.ToUpper();
                _context.PortfolioHoldings.Add(holding);
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPortfolio), holding);
        }

        /// <summary>
        /// DELETE /api/stocks/portfolio/{id}
        /// Remove a stock from portfolio
        /// </summary>
        [HttpDelete("portfolio/{id}")]
        public async Task<IActionResult> RemoveFromPortfolio(int id)
        {
            var holding = await _context.PortfolioHoldings.FindAsync(id);
            if (holding == null)
                return NotFound();

            _context.PortfolioHoldings.Remove(holding);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// GET /api/stocks/watchlist
        /// Get watchlist items
        /// </summary>
        [HttpGet("watchlist")]
        public async Task<IActionResult> GetWatchlist()
        {
            var items = await _context.WatchlistItems.ToListAsync();
            return Ok(items);
        }

        /// <summary>
        /// POST /api/stocks/watchlist
        /// Add to watchlist
        /// </summary>
        [HttpPost("watchlist")]
        public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistItem item)
        {
            if (string.IsNullOrWhiteSpace(item.Symbol))
                return BadRequest("Symbol is required");

            var existing = await _context.WatchlistItems.FirstOrDefaultAsync(w => w.Symbol == item.Symbol.ToUpper());
            if (existing != null)
                return BadRequest("Already in watchlist");

            item.Symbol = item.Symbol.ToUpper();
            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWatchlist), item);
        }

        /// <summary>
        /// DELETE /api/stocks/watchlist/{id}
        /// Remove from watchlist
        /// </summary>
        [HttpDelete("watchlist/{id}")]
        public async Task<IActionResult> RemoveFromWatchlist(int id)
        {
            var item = await _context.WatchlistItems.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
