using Listlist.Data.Models;
using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces
{
    public interface IListItemRepository
    {
        Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId);

        Task<List<ListItemEntity>> GetListItemsAsync(Guid userId);

        Task CreateListItemAsync(Guid userId, ListItemEntity listItem, Guid? parentId);

        Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId);

        Task DeleteListItemAsync(Guid userId, Guid listItemId);
    }
}
