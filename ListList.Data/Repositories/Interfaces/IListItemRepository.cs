using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IListItemRepository
{
    Task<ListItemEntity> GetListItemByIdAsync(Guid listItemId);

    Task<List<ListHeaderEntity>> GetListHeadersAsync(Guid userId);

    Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation);

    Task CreateListItemAsync(ListItemEntity creation, Guid? parentId);

    Task DeleteListItemAsync(Guid listItemId);

    Task CompleteListItemAsync(Guid listItemId);

    Task PutListItemAsync(Guid listItemId, ListItemEntity entityPut);
}
