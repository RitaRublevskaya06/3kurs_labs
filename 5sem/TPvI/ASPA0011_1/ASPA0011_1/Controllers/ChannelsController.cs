using Microsoft.AspNetCore.Mvc;
using ASPA0011_1.Models;
using ASPA0011_1.Services;

namespace ASPA0011_1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChannelsController : ControllerBase
    {
        private readonly IChannelService _channelService;
        private readonly ILogger<ChannelsController> _logger;

        public ChannelsController(IChannelService channelService, ILogger<ChannelsController> logger)
        {
            _channelService = channelService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetAllChannels()
        {
            _logger.LogTrace("GET /api/channels requested");

            var channels = _channelService.GetAllChannels().ToList();

            if (!channels.Any())
            {
                _logger.LogDebug("No channels found, returning 204");
                return NoContent();
            }

            _logger.LogDebug("Returning {ChannelCount} channels", channels.Count);
            return Ok(channels);
        }

        [HttpGet("{id}")]
        public IActionResult GetChannel(string id)
        {
            _logger.LogTrace("GET /api/channels/{ChannelId} requested", id);

            var channel = _channelService.GetChannel(id);

            if (channel == null)
            {
                _logger.LogWarning("Channel {ChannelId} not found", id);
                return NotFound(new ErrorMessage { Id = id, Error = "Channel not found" });
            }

            _logger.LogDebug("Returning channel: {ChannelName}", channel.Name);
            return Ok(channel);
        }

        [HttpPost]
        public IActionResult CreateChannel([FromBody] ChannelCommand command)
        {
            _logger.LogTrace("POST /api/channels requested with command: {Command}", command.Command);

            if (command.Command?.ToLower() != "new")
            {
                _logger.LogWarning("Invalid command for POST: {Command}", command.Command);
                return BadRequest(new ErrorMessage { Error = "Invalid command. Use 'new' to create channel." });
            }

            var channel = _channelService.CreateChannel(command);

            if (channel.State == "ACTIVE")
            {
                _logger.LogInformation("Created ACTIVE channel: {ChannelName}", channel.Name);
                return CreatedAtAction(nameof(GetChannel), new { id = channel.Id }, channel);
            }
            else
            {
                _logger.LogInformation("Created CLOSED channel: {ChannelName}", channel.Name);
                return NoContent();
            }
        }

        [HttpPut]
        public IActionResult UpdateChannels([FromBody] ChannelCommand command)
        {
            _logger.LogTrace("PUT /api/channels requested with command: {Command}", command.Command);

            var validCommands = new[] { "close", "open" };
            if (string.IsNullOrEmpty(command.Command) || !validCommands.Contains(command.Command.ToLower()))
            {
                _logger.LogWarning("Invalid command for PUT: {Command}", command.Command);
                return BadRequest(new ErrorMessage { Error = "Invalid command. Use 'close' or 'open'." });
            }

            var updatedChannels = _channelService.UpdateChannels(command);

            if (!updatedChannels.Any())
            {
                _logger.LogWarning("No channels were updated with command: {Command}", command.Command);
                return NotFound(new ErrorMessage { Error = "No channels found to update" });
            }

            _logger.LogInformation("Updated {ChannelCount} channels with command: {Command}",
                updatedChannels.Count(), command.Command);

            return Ok(updatedChannels);
        }

        [HttpDelete]
        public IActionResult DeleteChannels([FromBody] ChannelCommand command)
        {
            _logger.LogTrace("DELETE /api/channels requested with command: {Command}", command.Command);

            if (command.Command?.ToLower() != "del")
            {
                _logger.LogWarning("Invalid command for DELETE: {Command}", command.Command);
                return BadRequest(new ErrorMessage { Error = "Invalid command. Use 'del' to delete channels." });
            }

            var remainingChannels = _channelService.DeleteChannels(command);

            _logger.LogInformation("Delete operation completed. Remaining channels: {ChannelCount}",
                remainingChannels.Count());

            return Ok(remainingChannels);
        }
    }
}