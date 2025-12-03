using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IHeaderService
{
    Task<Guid> CreateHeader(HeaderCreation listHeader, int? order);
    Task<Guid> CreateItem(string token, ItemCreation itemCreation);
    Task<IEnumerable<Header>> GetHeaders();
    Task<Header> GetHeader(string token);
    Task RelocateHeader(string token, int order);
    Task PatchHeader(string token, HeaderPatch headerPatch);
    Task PutHeader(string token, HeaderPut headerPut);
    Task DeleteHeader(string token);
    Task RestoreHeader(string token, int? order);
}
