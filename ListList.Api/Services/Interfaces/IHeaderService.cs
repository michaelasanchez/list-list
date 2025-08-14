using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IHeaderService
{
    Task<Guid> CreateListHeader(ListHeaderCreation listHeader);
    Task<IEnumerable<Header>> GetListHeaders();
    Task<Header> GetListHeader(string headerId);
    Task RelocateListHeader(Guid headerId, int order);
    Task PatchHeader(Guid headerId, HeaderPatch headerPatch);
    Task PutHeader(Guid headerId, HeaderPut headerPut);
}
