using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces
{
    public interface IListItemService
    {
        Task CompleteListItemAsync(Guid listItemId);
        Task<Guid> CreateListHeaderAsync(ListItemCreation listHeader);
        Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid parentId);
        Task DeleteListItemAsync(Guid listItemId);
        Task<ListItem> GetListItemByIdAsync(Guid listItemId);
        Task<IEnumerable<ListHeader>> GetListItemsAsync();
        Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut);
    }
}
