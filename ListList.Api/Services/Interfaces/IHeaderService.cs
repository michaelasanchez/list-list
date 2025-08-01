using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IHeaderService
{
    Task<Guid> CreateListHeader(ListHeaderCreation listHeader);
    Task<IEnumerable<Header>> GetListHeaders();
    Task<Header> GetListHeader(string listHeaderId);
    Task RelocateListHeader(Guid listHeaderId, int order);
    Task PutListHeader(Guid listHeaderId, ListHeaderPut listHeaderPut);
}
