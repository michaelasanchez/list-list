using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IItemRepository
{
    Task CompleteListItemAsync(Guid listItemId);
    Task CreateListItemAsync(ListItemEntity creation, Guid parentId);
    Task DeleteListItemAsync(Guid listItemId);
    Task<ListItemEntity> GetListItemByIdAsync(Guid listItemId);
    Task PutListItemAsync(Guid listItemId, ListItemEntity entityPut);
}
