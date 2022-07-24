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

                creation.RootId = parent.RootId;
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

        public async Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId)
        {
            var parent = await _context.ListItems.Where(z => z.Id == listItemId).SingleAsync();

            var children = await _context.ListItems.Where(z => z.Left > parent.Left && z.Right < parent.Right).ToListAsync();

            return parent;
        }

        public async Task<List<ListItemEntity>> GetListItemsAsync(Guid userId)
        {
            //var listItems = await _context.ListItems.Where(z => z.UserId == userId).ToListAsync();

            //var groupedListItems = listItems
            //    .OrderBy(z => z.RootId)
            //    .ThenBy(z => z.Left)
            //    .GroupBy(z => z.RootId);

            //var nodes = groupedListItems.ToDictionary(z => z.Key, z =>
            //{
            //    var root = z.First();

            //    var limb = new List<int> { 0 };

            //    foreach (var node in z.Skip(1))
            //    {
            //        var current = GetCurrent(z, limb);
            //    }

            //    return root;
            //});

            return await _context.ListItems.Where(z => z.UserId == userId).ToListAsync();
        }

        //private static ListItemEntity GetCurrent(List<ListItemEntity> items, List<int> limb)
        //{
        //    foreach (var branch in limb)
        //    {

        //    }
        //}

        public Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId)
        {
            throw new NotImplementedException();
        }
    }
}
