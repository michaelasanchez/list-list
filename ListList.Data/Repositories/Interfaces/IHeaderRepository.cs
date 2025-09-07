using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IHeaderRepository
{
    Task CreateHeader(Guid ownerId, HeaderEntity creation);
    Task DeleteHeader(Guid headerId);
    Task<HeaderResource> GetHeaderById(Guid? ownerId, Guid listHeaderId);
    Task<HeaderResource> GetHeaderByToken(string token);
    Task<List<HeaderResource>> GetHeaders(Guid? ownerId);
    Task PatchHeader(Guid headerId, HeaderResource resource);
    Task PutHeader(Guid listHeaderId, HeaderEntity update);
    Task RelocateHeader(Guid ownerId, Guid listHeaderId, int index);
}
