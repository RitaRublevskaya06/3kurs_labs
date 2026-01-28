using Microsoft.AspNetCore.Mvc;
using ASPA0011_1.Models;
using ASPA0011_1.Services;

namespace ASPA0011_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QueueController : ControllerBase
    {
        private readonly IChannelService _channelService;
        private readonly ILogger<QueueController> _logger;

        public QueueController(IChannelService channelService, ILogger<QueueController> logger)
        {
            _channelService = channelService;
            _logger = logger;
        }

        [HttpPost]
        public IActionResult ProcessQueueOperation([FromBody] ChannelCommand command)
        {
            _logger.LogTrace("POST /api/queue requested with command: {Command}", command.Command);

            var validCommands = new[] { "dequeue", "enqueue", "peek" };
            if (string.IsNullOrEmpty(command.Command) || !validCommands.Contains(command.Command.ToLower()))
            {
                _logger.LogWarning("Invalid queue command: {Command}", command.Command);
                return BadRequest(new ErrorMessage { Error = "Invalid command. Use 'dequeue', 'enqueue', or 'peek'." });
            }

            try
            {
                var result = _channelService.ProcessQueueOperation(command);

                if (result == null)
                {
                    _logger.LogWarning("Queue operation failed for channel: {ChannelId}", command.Id);
                    return NotFound(new ErrorMessage { Id = command.Id, Error = "Operation failed or no data available" });
                }

                _logger.LogDebug("Queue operation {Command} completed successfully for channel: {ChannelId}",
                    command.Command, command.Id);

                return Ok(result);
            }
            catch (TimeoutException ex)
            {
                _logger.LogWarning("Queue operation timed out for channel: {ChannelId}", command.Id);
                return StatusCode(408, new ErrorMessage { Id = command.Id, Error = ex.Message });
            }
        }
    }
}