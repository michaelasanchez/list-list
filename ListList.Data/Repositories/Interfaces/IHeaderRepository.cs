using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IHeaderRepository
{
    Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation);
    Task<ListHeaderEntity> GetListHeaderByIdAsync(Guid userId, Guid listHeaderId);
    Task<List<ListHeaderEntity>> GetListHeadersAsync(Guid userId);
}
