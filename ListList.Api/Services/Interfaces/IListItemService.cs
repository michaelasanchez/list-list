using ListList.Api.Models;

namespace ListList.Api.Services.Interfaces
{
    public interface IListItemService
    {
        Task<Guid> CreateListItemAsync(ListItem listItem, Guid? parentId);

        Task<IEnumerable<ListItem>> GetListItemsAsync();
        Task<ListItem> GetListItemByIdAsync(Guid listItemId);
    }
}
