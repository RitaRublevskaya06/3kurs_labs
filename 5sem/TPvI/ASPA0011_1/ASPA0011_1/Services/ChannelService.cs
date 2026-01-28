using System.Threading.Channels;
using ASPA0011_1.Models;

namespace ASPA0011_1.Services
{
    public class ChannelService : IChannelService
    {
        private readonly Dictionary<string, (Channel<string> channel, ChannelInfo info)> _channels;
        private readonly ILogger<ChannelService> _logger;
        private readonly int _waitEnqueue = 30; // seconds

        public ChannelService(ILogger<ChannelService> logger)
        {
            _channels = new Dictionary<string, (Channel<string>, ChannelInfo)>();
            _logger = logger;
        }

        public IEnumerable<ChannelInfo> GetAllChannels()
        {
            _logger.LogDebug("Getting all channels. Total: {ChannelCount}", _channels.Count);
            return _channels.Values.Select(v => v.info).ToList();
        }

        public ChannelInfo? GetChannel(string id)
        {
            if (_channels.TryGetValue(id, out var channelData))
            {
                _logger.LogDebug("Retrieved channel with ID: {ChannelId}", id);
                return channelData.info;
            }

            _logger.LogWarning("Channel not found with ID: {ChannelId}", id);
            return null;
        }

        public ChannelInfo CreateChannel(ChannelCommand command)
        {
            var id = Guid.NewGuid().ToString();
            var channel = Channel.CreateUnbounded<string>();
            var channelInfo = new ChannelInfo
            {
                Id = id,
                Name = command.Name ?? "Unnamed Channel",
                State = command.State?.ToUpper() == "CLOSED" ? "CLOSED" : "ACTIVE",
                Description = command.Description
            };

            _channels[id] = (channel, channelInfo);

            _logger.LogInformation("Created new channel: {ChannelName} with ID: {ChannelId}, State: {ChannelState}",
                channelInfo.Name, channelInfo.Id, channelInfo.State);

            return channelInfo;
        }

        public IEnumerable<ChannelInfo> UpdateChannels(ChannelCommand command)
        {
            var updatedChannels = new List<ChannelInfo>();

            switch (command.Command?.ToLower())
            {
                case "close":
                    if (string.IsNullOrEmpty(command.Id))
                    {
                        // Close all channels
                        foreach (var channelData in _channels.Values)
                        {
                            if (channelData.info.State == "ACTIVE")
                            {
                                channelData.info.State = "CLOSED";
                                _logger.LogInformation("Closed channel: {ChannelName}, Reason: {Reason}",
                                    channelData.info.Name, command.Reason);
                            }
                            else
                            {
                                _logger.LogWarning("Attempt to close already closed channel: {ChannelName}",
                                    channelData.info.Name);
                            }
                            updatedChannels.Add(channelData.info);
                        }
                    }
                    else
                    {
                        // Close specific channel
                        if (_channels.TryGetValue(command.Id, out var channelData))
                        {
                            if (channelData.info.State == "ACTIVE")
                            {
                                channelData.info.State = "CLOSED";
                                _logger.LogInformation("Closed channel: {ChannelName}, Reason: {Reason}",
                                    channelData.info.Name, command.Reason);
                            }
                            else
                            {
                                _logger.LogWarning("Attempt to close already closed channel: {ChannelName}",
                                    channelData.info.Name);
                            }
                            updatedChannels.Add(channelData.info);
                        }
                    }
                    break;

                case "open":
                    if (string.IsNullOrEmpty(command.Id))
                    {
                        // Open all channels
                        foreach (var channelData in _channels.Values)
                        {
                            if (channelData.info.State == "CLOSED")
                            {
                                channelData.info.State = "ACTIVE";
                                _logger.LogInformation("Opened channel: {ChannelName}", channelData.info.Name);
                            }
                            else
                            {
                                _logger.LogWarning("Attempt to open already active channel: {ChannelName}",
                                    channelData.info.Name);
                            }
                            updatedChannels.Add(channelData.info);
                        }
                    }
                    else
                    {
                        // Open specific channel with state validation
                        if (_channels.TryGetValue(command.Id, out var channelData))
                        {
                            if (!string.IsNullOrEmpty(command.State))
                            {
                                var newState = command.State.ToUpper();
                                if (newState != "ACTIVE" && newState != "CLOSED")
                                {
                                    _logger.LogWarning("Invalid state for open command: {State}", command.State);
                                }
                                else if (channelData.info.State != newState)
                                {
                                    channelData.info.State = newState;
                                    _logger.LogInformation("Changed channel state: {ChannelName} -> {NewState}",
                                        channelData.info.Name, newState);
                                }
                                else
                                {
                                    _logger.LogWarning("Attempt to change channel {ChannelName} to the same state: {State}",
                                        channelData.info.Name, newState);
                                }
                            }
                            else
                            {
                                if (channelData.info.State == "CLOSED")
                                {
                                    channelData.info.State = "ACTIVE";
                                    _logger.LogInformation("Opened channel: {ChannelName}", channelData.info.Name);
                                }
                                else
                                {
                                    _logger.LogWarning("Attempt to open already active channel: {ChannelName}",
                                        channelData.info.Name);
                                }
                            }
                            updatedChannels.Add(channelData.info);
                        }
                    }
                    break;
            }

                    return updatedChannels;
        }

        public IEnumerable<ChannelInfo> DeleteChannels(ChannelCommand command)
        {
            var remainingChannels = new List<ChannelInfo>();

            switch (command.Command?.ToLower())
            {
                case "del":
                    if (command.State?.ToUpper() == "CLOSED")
                    {
                        // Delete only closed channels
                        var closedChannels = _channels.Where(kvp => kvp.Value.info.State == "CLOSED").ToList();
                        foreach (var kvp in closedChannels)
                        {
                            _channels.Remove(kvp.Key);
                            _logger.LogInformation("Deleted closed channel: {ChannelName}", kvp.Value.info.Name);
                        }
                    }
                    else
                    {
                        // Delete all channels
                        var channelNames = _channels.Values.Select(v => v.info.Name).ToList();
                        _channels.Clear();
                        foreach (var name in channelNames)
                        {
                            _logger.LogInformation("Deleted channel: {ChannelName}", name);
                        }
                    }
                    break;
            }

            return _channels.Values.Select(v => v.info).ToList();
        }

        public QueueItem? ProcessQueueOperation(ChannelCommand command)
        {
            if (string.IsNullOrEmpty(command.Id) || !_channels.TryGetValue(command.Id, out var channelData))
            {
                _logger.LogWarning("Channel not found for queue operation: {ChannelId}", command.Id);
                return null;
            }

            if (channelData.info.State == "CLOSED")
            {
                _logger.LogWarning("Attempt to perform queue operation on closed channel: {ChannelName}",
                    channelData.info.Name);
                return null;
            }

            switch (command.Command?.ToLower())
            {
                case "dequeue":
                    if (channelData.channel.Reader.TryRead(out var dequeuedData))
                    {
                        _logger.LogDebug("Dequeued data from channel: {ChannelName}", channelData.info.Name);
                        return new QueueItem { Id = command.Id, Data = dequeuedData };
                    }
                    break;

                case "peek":
                    if (channelData.channel.Reader.TryPeek(out var peekedData))
                    {
                        _logger.LogDebug("Peeked data from channel: {ChannelName}", channelData.info.Name);
                        return new QueueItem { Id = command.Id, Data = peekedData };
                    }
                    break;

                case "enqueue":
                    if (!string.IsNullOrEmpty(command.Data))
                    {
                        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_waitEnqueue));
                        try
                        {
                            if (channelData.channel.Writer.TryWrite(command.Data))
                            {
                                _logger.LogDebug("Enqueued data to channel: {ChannelName}", channelData.info.Name);
                                return new QueueItem { Id = command.Id, Data = command.Data };
                            }
                            else
                            {
                                _logger.LogWarning("Failed to enqueue data to channel: {ChannelName}",
                                    channelData.info.Name);
                            }
                        }
                        catch (OperationCanceledException)
                        {
                            _logger.LogWarning("Enqueue operation timed out for channel: {ChannelName}",
                                channelData.info.Name);
                            throw new TimeoutException($"Enqueue operation timed out after {_waitEnqueue} seconds");
                        }
                    }
                    break;
            }

            return null;
        }
    }
}