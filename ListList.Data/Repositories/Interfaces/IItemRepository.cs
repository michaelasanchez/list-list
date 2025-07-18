using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IItemRepository
{
    Task CompleteListItem(Guid listItemId);
    Task CreateListItem(ListItemEntity creation, Guid parentId);
    Task DeleteListItem(Guid listItemId);
    Task<ListItemEntity> GetListItemById(Guid listItemId);
    Task PutListItem(Guid listItemId, ListItemEntity entityPut);
    Task RelocateListItem(Guid activeId, Guid overId, Guid parentId);
}
