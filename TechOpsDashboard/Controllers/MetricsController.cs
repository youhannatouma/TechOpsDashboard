using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechOpsDashboard.Data;
using TechOpsDashboard.Models;

namespace TechOpsDashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly TechMetricsContext _context;

        public MetricsController(TechMetricsContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/metrics?count=50
        /// Returns the most recent N metrics, newest first.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetLatestMetrics([FromQuery] int count = 50)
        {
            count = Math.Clamp(count, 1, 500);
            var metrics = await _context.TechMetrics
                .OrderByDescending(m => m.Timestamp)
                .Take(count)
                .ToListAsync();
            return Ok(metrics);
        }

        /// <summary>
        /// GET /api/metrics/range?from=2026-03-23T00:00:00Z&to=2026-03-23T23:59:59Z
        /// Returns metrics within a UTC time range.
        /// </summary>
        [HttpGet("range")]
        public async Task<IActionResult> GetRange(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            if (from >= to)
                return BadRequest("'from' must be earlier than 'to'.");

            var metrics = await _context.TechMetrics
                .Where(m => m.Timestamp >= from && m.Timestamp <= to)
                .OrderByDescending(m => m.Timestamp)
                .ToListAsync();

            return Ok(metrics);
        }
    }
}