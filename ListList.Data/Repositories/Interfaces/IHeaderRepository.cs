using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IHeaderRepository
{
    Task CreateHeader(Guid ownerId, HeaderEntity creation, int? order);
    Task DeleteHeader(string token);
    Task<HeaderResource> GetHeader(string token);
    Task<List<HeaderResource>> GetHeaders(Guid? ownerId);
    Task PatchHeader(string token, HeaderResource resource);
    Task PutHeader(string token, HeaderEntity update);
    Task RelocateHeader(Guid ownerId, string token, int index);
    Task RestoreHeader(Guid value, string token, int? order);
}
