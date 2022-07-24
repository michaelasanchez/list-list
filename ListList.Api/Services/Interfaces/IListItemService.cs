using ListList.Api.Models;

namespace ListList.Api.Services.Interfaces
{
    public interface IListItemService
    {
        Task<IEnumerable<ListItem>> GetListItemsAsync();
    }
}
