
using ListList.Api.Contracts.Post;

namespace ListList.Api.Services.Interfaces;

public interface IShareService
{
    Task<string> ShareList(Guid listHeaderId, ListHeaderShare listHeaderShare);
}
