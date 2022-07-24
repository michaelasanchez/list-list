using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces
{
    public interface IListItemRepository
    {
        Task<List<ListItemEntity>> GetListItemAsync(Guid userId, Guid listItemId);

        Task CreateListItemAsync(Guid userId, ListItemEntity listItem, Guid? parentId);

        Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId);

        Task DeleteListItemAsync(Guid userId, Guid listItemId);
    }
}
