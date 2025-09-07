using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IHeaderService
{
    Task<Guid> CreateHeader(ListHeaderCreation listHeader);
    Task<Guid> CreateItem(Guid headerId, ListItemCreation itemCreation);
    Task<IEnumerable<Header>> GetHeaders();
    Task<Header> GetHeader(string headerId);
    Task RelocateHeader(Guid headerId, int order);
    Task PatchHeader(Guid headerId, HeaderPatch headerPatch);
    Task PutHeader(Guid headerId, HeaderPut headerPut);
    Task DeleteHeader(Guid headerId);
}
