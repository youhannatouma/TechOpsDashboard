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