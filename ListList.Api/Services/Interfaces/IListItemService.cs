using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces
{
    public interface IListItemService
    {
        Task<Guid> CreateListHeaderAsync(ListItemCreation listHeader);
        Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid? parentId);
        Task<IEnumerable<ListHeader>> GetListItemsAsync();
        Task<ListItem> GetListItemByIdAsync(Guid listItemId);
        Task DeleteListItemAsync(Guid listItemId);
        public Task CompleteListItemAsync(Guid listItemId);
        Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut);
    }
}
