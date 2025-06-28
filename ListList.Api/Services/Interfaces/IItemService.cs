using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Contracts.Result;

namespace ListList.Api.Services.Interfaces;

public interface IItemService
{
    Task CompleteListItemAsync(Guid listItemId);
    Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid parentId);
    Task DeleteListItemAsync(Guid listItemId);
    Task<ListItem> GetListItemByIdAsync(Guid listItemId);
    Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut);
    Task<OperationResult> RelocateListItemAsync(Guid listItemId, Guid parentId, int relativeIndex);
}
