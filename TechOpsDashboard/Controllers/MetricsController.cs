using Microsoft.AspNetCore.Mvc;
using TechOpsDashboard.Data;
using TechOpsDashboard.Models;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> GetLatestMetrics()
        {
            var metrics = await _context.TechMetrics.OrderByDescending(m => m.Timestamp).Take(50).ToListAsync();
            return Ok(metrics);
        }
    }
}