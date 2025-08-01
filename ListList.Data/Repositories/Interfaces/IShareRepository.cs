using ListList.Data.Models.Enums;

namespace ListList.Data.Repositories.Interfaces;

public interface IShareRepository
{
    public Task<string> ShareList(Guid headerId, SharedPermission permission, string? token, DateTimeOffset? expireOn);
}
