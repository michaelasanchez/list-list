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

        public async Task<ListItemEntity> GetOrCreateUserNodeAsync(Guid userId)
        {
            var userNode = await _context.ListItems.SingleOrDefaultAsync(z => z.UserId == userId && z.Left == 1);

            if (userNode is null)
            {
                userNode = new ListItemEntity
                {
                    UserId = userId,
                    Left = 1,
                    Right = 2
                };

                await _context.ListItems.AddAsync(userNode);
            }

            return userNode;
        }

        public async Task CreateListItemAsync(ListItemEntity userNode, ListItemEntity creation, Guid? parentId)
        {
            var parentNode = parentId is not null
                ? await _context.ListItems.SingleAsync(z => z.Id == parentId)
                : userNode;

            var listItemQuery = await _context.ListItems
                .Where(z => z.UserId == userNode.UserId && z.Right >= parentNode.Left)
                .ToListAsync();

            foreach (var item in listItemQuery)
            {
                item.Left = item.Left > parentNode.Left ? item.Left + 2 : item.Left;
                item.Right += 2;
            }

            creation.UserId = parentNode.UserId;
            creation.Left = parentNode.Left + 1;
            creation.Right = parentNode.Left + 2;

            await _context.ListItems.AddAsync(creation);
        }

        public async Task DeleteListItemAsync(ListItemEntity userNode, Guid listItemId)
        {
            var targetNode = await _context.ListItems.SingleAsync(z => z.Id == listItemId);
            
            var listItemQuery = await _context.ListItems
                .Where(z => z.UserId == userNode.UserId && z.Right >= targetNode.Left)
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

            return await _context.ListItems.Where(z => z.UserId == userId)
                .OrderBy(z => z.Left)
                .ToListAsync();
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
