using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories
{
    public class ListItemRepository : IListItemRepository
    {
        private readonly IListListContext _context;

        public ListItemRepository(IListListContext context)
        {
            _context = context;
        }

        public Task CreateListItemAsync(Guid userId, ListItemEntity listItem, Guid? parentId)
        {
            throw new NotImplementedException();
        }

        public Task DeleteListItemAsync(Guid userId, Guid listItemId)
        {
            throw new NotImplementedException();
        }

        public Task<List<ListItemEntity>> GetListItemAsync(Guid userId, Guid listItemId)
        {
            throw new NotImplementedException();
        }

        public Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId)
        {
            throw new NotImplementedException();
        }
    }
}
