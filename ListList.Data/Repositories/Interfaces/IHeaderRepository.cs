using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IHeaderRepository
{
    Task CreateListHeaderAsync(Guid userId, HeaderEntity creation);
    Task<HeaderResource> GetListHeaderByIdAsync(Guid userId, Guid listHeaderId);
    Task<HeaderResource> GetListHeaderByToken(string token);
    Task<List<HeaderResource>> GetListHeadersAsync(Guid userId);
    Task PutListHeader(Guid listHeaderId, HeaderEntity update);
    Task RelocateListHeaderAsync(Guid userId, Guid listHeaderId, int index);
}
