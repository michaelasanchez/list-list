using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IItemService
{
    Task CompleteListItemAsync(Guid listItemId);
    Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid parentId);
    Task DeleteListItemAsync(Guid listItemId);
    Task<ListItem> GetListItemByIdAsync(Guid listItemId);
    Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut);
    Task RelocateListItemAsync(Guid activeId, Guid overId, Guid parentId);
}
