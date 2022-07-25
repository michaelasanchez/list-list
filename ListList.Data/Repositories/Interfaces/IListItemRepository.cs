using Listlist.Data.Models;
using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces
{
    public interface IListItemRepository
    {
        Task<ListItemEntity> GetOrCreateUserNodeAsync(Guid userId);

        Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId);

        Task<List<ListItemEntity>> GetListItemsAsync(Guid userId);

        Task CreateListItemAsync(ListItemEntity userNode, ListItemEntity creation, Guid? parentId);

        Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId);

        Task DeleteListItemAsync(ListItemEntity userNode, Guid listItemId);
    }
}
