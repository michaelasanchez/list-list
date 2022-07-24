using Listlist.Data.Models;
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

        public async Task CreateListItemAsync(Guid userId, ListItemEntity creation, Guid? parentId)
        {
            creation.UserId = userId;

            if (parentId is null)
            {
                creation.Left = 1;
                creation.Right = 2;
            }
            else
            {
                var parent = await _context.ListItems.SingleAsync(z => z.Id == parentId);

                creation.RootId = parent.Id;
                creation.Left = parent.Left + 1;
                creation.Right = parent.Left + 2;

                var subsequentItems = await _context.ListItems.Where(z => z.RootId == parent.RootId && z.Right >= parent.Left).ToListAsync();

                foreach (var item in subsequentItems)
                {
                    item.Left = item.Left > parent.Left ? item.Left + 2 : item.Left;
                    item.Right += 2;
                }
            }

            await _context.ListItems.AddAsync(creation);
        }

        public Task DeleteListItemAsync(Guid userId, Guid listItemId)
        {
            throw new NotImplementedException();
        }

        Task<ListItemEntity> IListItemRepository.GetListItemById(Guid userId, Guid listItemId)
        {
            throw new NotImplementedException();
        }

        public Task<List<ListItemEntity>> GetListItemsAsync(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId)
        {
            throw new NotImplementedException();
        }
}
