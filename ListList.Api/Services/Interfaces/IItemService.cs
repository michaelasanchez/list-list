using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IItemService
{
    Task CompleteListItemAsync(Guid listItemId);
    Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid parentId);
    Task DeleteListItemAsync(Guid listItemId);
    Task<Item> GetListItemByIdAsync(Guid listItemId);
    Task PatchItemAsync(Guid listItemId, ItemPatch itemPatch, bool? recursive);
    Task PutListItemAsync(Guid listItemId, ItemPut listItemPut);
    Task RelocateListItemAsync(Guid activeId, Guid overId, Guid? parentId);
}
