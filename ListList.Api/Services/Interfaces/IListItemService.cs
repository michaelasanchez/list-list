using ListList.Api.Models;

namespace ListList.Api.Services.Interfaces
{
    public interface IListItemService
    {
        Task<Guid> CreateListItemAsync(ListItemCreation creation, Guid? parentId);

        Task<IEnumerable<ListItem>> GetListItemsAsync();
        Task<ListItem> GetListItemByIdAsync(Guid listItemId);
        Task DeleteListItemAsync(Guid listItemId);
    }
}
