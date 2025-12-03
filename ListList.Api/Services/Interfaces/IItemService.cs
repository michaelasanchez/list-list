using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IItemService
{
    Task CompleteListItemAsync(string token, Guid listItemId);
    Task DeleteListItemAsync(string token, Guid listItemId);
    Task<Item> GetItemById(string token, Guid listItemId);
    Task PatchItemAsync(string token, Guid listItemId, ItemPatch itemPatch, bool? recursive);
    Task PutListItemAsync(string token, Guid listItemId, ItemPut listItemPut);
    Task RelocateListItemAsync(string token, Guid activeId, Guid overId, Guid? parentId);
    Task RestoreListItemAsync(string token, Guid itemId, Guid? overId, Guid? parentId);
}
