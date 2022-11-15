using ListList.Data.Models.Entities;
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
                creation.GroupId = new Guid();
                creation.Left = 1;
                creation.Right = 2;
            }
            else
            {
                var parentNode = await _context.ListItems.SingleAsync(z => z.Id == parentId);

                var listItemQuery = await _context.ListItems
                        .Where(z => z.UserId == userId && z.Right >= parentNode.Left)
                        .ToListAsync();

                foreach (var item in listItemQuery)
                {
                    item.Left = item.Left > parentNode.Left ? item.Left + 2 : item.Left;
                    item.Right += 2;
                }

                creation.GroupId = parentNode.GroupId;
                creation.Left = parentNode.Left + 1;
                creation.Right = parentNode.Left + 2;
            }

            await _context.ListItems.AddAsync(creation);
        }

        public async Task DeleteListItemAsync(Guid userId, Guid listItemId)
        {
            var targetNode = await _context.ListItems.SingleAsync(z => z.Id == listItemId);
            
            var listItemQuery = await _context.ListItems
                .Where(z => z.UserId == userId && z.Right >= targetNode.Left)
                .ToListAsync();

            foreach (var item in listItemQuery)
            {
                item.Left = item.Left > targetNode.Left ? item.Left - 2 : item.Left;
                item.Right -= 2;
            }

            _context.ListItems.Remove(targetNode);
        }

        public async Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId)
        {
            var parent = await _context.ListItems.Where(z => z.Id == listItemId).SingleAsync();

            var children = await _context.ListItems.Where(z => z.Left > parent.Left && z.Right < parent.Right).ToListAsync();

            return parent;
        }

        public async Task<List<ListHeaderEntity>> GetListItemsAsync(Guid userId)
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

            return await _context.ListHeaders
                .Include(z => z.ListItems)
                .Where(z => z.UserId == userId)
                .ToListAsync();
        }

        public Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId)
        {
            throw new NotImplementedException();
        }
    }
}
