using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IListItemRepository
{
    Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId);

    Task<List<ListHeaderEntity>> GetListItemsAsync(Guid userId);

    Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation);

    Task CreateListItemAsync(Guid userId, ListItemEntity creation, Guid? parentId);

    Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId);

    Task DeleteListItemAsync(Guid userId, Guid listItemId);

    Task CompleteListItemAsync(Guid listItemId);

    Task PutListItemAsync(Guid listItemId, ListItemEntity entityPut);
}
