using ASPA0011_1.Models;

namespace ASPA0011_1.Services
{
    public interface IChannelService
    {
        IEnumerable<ChannelInfo> GetAllChannels();
        ChannelInfo? GetChannel(string id);
        ChannelInfo CreateChannel(ChannelCommand command);
        IEnumerable<ChannelInfo> UpdateChannels(ChannelCommand command);
        IEnumerable<ChannelInfo> DeleteChannels(ChannelCommand command);
        QueueItem? ProcessQueueOperation(ChannelCommand command);
    }
}