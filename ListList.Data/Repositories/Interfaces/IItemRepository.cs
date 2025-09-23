using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IItemRepository
{
    Task CompleteListItem(Guid listItemId);
    Task<Guid> CreateListItem(ItemResource creation, Guid headerId, Guid? overId, Guid? parentId);
    Task DeleteListItem(Guid listItemId);
    Task<ItemResource> GetItemById(Guid listItemId);
    Task PatchListItem(Guid listItemId, ItemResource resource, bool? recursive);
    Task PutListItem(Guid listItemId, ItemEntity entityPut);
    Task RelocateListItem(Guid activeId, Guid overId, Guid? parentId);
    Task RestoreListItem(Guid itemId, Guid? overId, Guid? parentId);
}
