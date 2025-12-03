using ListList.Data.Models.Enums;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IShareRepository
{
    Task DeleteLink(Guid shareLinkId);
    Task PutLink(Guid shareLinkId, ShareLinkResource resource);
    Task<string> ShareList(string token, SharedPermission permission, string? newToken, DateTimeOffset? expireOn);
}
