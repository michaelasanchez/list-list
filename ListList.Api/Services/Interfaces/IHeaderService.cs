using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;

namespace ListList.Api.Services.Interfaces
{
    public interface IHeaderService
    {
        Task<Guid> CreateListHeaderAsync(ListItemCreation listHeader);
        Task<IEnumerable<ListHeader>> GetListHeadersAsync();
        Task<ListHeader> GetListHeaderByIdAsync(Guid listHeaderId);
        Task RelocateListHeaderAsync(Guid listHeaderId, int index);
    }
}
