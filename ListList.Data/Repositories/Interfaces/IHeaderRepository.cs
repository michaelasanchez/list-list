using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IHeaderRepository
{
    Task CreateListHeaderAsync(Guid ownerId, HeaderEntity creation);
    Task<HeaderResource> GetListHeaderByIdAsync(Guid? ownerId, Guid listHeaderId);
    Task<HeaderResource> GetListHeaderByToken(string token);
    Task<List<HeaderResource>> GetListHeadersAsync(Guid? ownerId);
    Task PutListHeader(Guid listHeaderId, HeaderEntity update);
    Task RelocateListHeaderAsync(Guid ownerId, Guid listHeaderId, int index);
}
