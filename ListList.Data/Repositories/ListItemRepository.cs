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

        public async Task CompleteListItemAsync(Guid listItemId)
        {
            var listItem = await _context.ListItems.SingleOrDefaultAsync(z => z.Id == listItemId);

            if (listItem is null)
            {
                return;
            }

            listItem.Complete = !listItem.Complete;
        }

        public async Task CreateListItemAtTopAsync(Guid userId, ListItemEntity creation, Guid? parentId)
        {
            if (parentId is null)
            {
                creation.ListHeaderId = new Guid();
                creation.Left = 1;
                creation.Right = 2;
            }
            else
            {
                var parentNode = await _context.ListItems.SingleAsync(z => z.Id == parentId);

                var listItems = await _context.ListItems
                        .Where(z =>
                            z.ListHeaderId == parentNode.ListHeaderId &&
                            z.Right > parentNode.Left)
                        .OrderBy(z => z.Left)
                        .ToListAsync();

                foreach (var item in listItems)
                {
                    item.Left = item.Left > parentNode.Left ? item.Left + 2 : item.Left;
                    item.Right += 2;
                }

                creation.ListHeaderId = parentNode.ListHeaderId;
                creation.Left = parentNode.Left + 1;
                creation.Right = parentNode.Left + 2;
            }

            await _context.ListItems.AddAsync(creation);
        }

        public async Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation)
        {
            creation.UserId = userId;

            var nextOrder = await _context.ListHeaders.CountAsync() + 1;
            creation.Order = nextOrder;

            await _context.ListHeaders.AddAsync(creation);
        }

        public async Task CreateListItemAsync(Guid userId, ListItemEntity creation, Guid? parentId)
        {
            if (parentId is null)
            {
                creation.ListHeaderId = new Guid();
                creation.Left = 1;
                creation.Right = 2;
            }
            else
            {
                var parentNode = await _context.ListItems.SingleAsync(z => z.Id == parentId);

                var listItems = await _context.ListItems
                        .Where(z =>
                            z.ListHeaderId == parentNode.ListHeaderId &&
                            z.Right >= parentNode.Right &&
                            !z.Deleted)
                        .OrderBy(z => z.Left)
                        .ToListAsync();

                foreach (var item in listItems)
                {
                    item.Left = item.Left > parentNode.Left ? item.Left + 2 : item.Left;
                    item.Right += 2;
                }

                creation.ListHeaderId = parentNode.ListHeaderId;
                creation.Left = parentNode.Right - 2;
                creation.Right = parentNode.Right - 1;
            }

            await _context.ListItems.AddAsync(creation);
        }

        public async Task DeleteListItemAsync(Guid userId, Guid listItemId)
        {
            var targetNode = await _context.ListItems
                .Include(z => z.ListHeader)
                .SingleAsync(z => z.Id == listItemId);
            
            var subsequentListItems = await _context.ListItems
                .Where(z =>
                    z.Id != listItemId &&
                    z.ListHeaderId == targetNode.ListHeaderId &&
                    z.Right >= targetNode.Left &&
                    !z.Deleted)
                .ToListAsync();

            if (subsequentListItems.Any())
            {
                foreach (var item in subsequentListItems)
                {
                    item.Left = item.Left > targetNode.Left ? item.Left - 2 : item.Left;
                    item.Right -= 2;
                }
            }
            else
            {
                targetNode.ListHeader.Deleted = true;
                targetNode.ListHeader.DeletedOn = DateTime.UtcNow;
            }

            targetNode.Left = 0;
            targetNode.Right = 0;

            targetNode.Deleted = true;
            targetNode.DeletedOn = DateTime.UtcNow;
        }

        public async Task<ListItemEntity> GetListItemByIdAsync(Guid userId, Guid listItemId)
        {
            var parent = await _context.ListItems.Where(z => z.Id == listItemId).SingleAsync();

            var children = await _context.ListItems
                .Where(z =>
                    z.Left > parent.Left &&
                    z.Right < parent.Right &&
                    !z.Deleted)
                .ToListAsync();

            return parent;
        }

        public async Task<List<ListHeaderEntity>> GetListItemsAsync(Guid userId)
        {
            return await _context.ListHeaders
                .Include(z => z.ListItems.Where(y => !y.Deleted))
                .Where(z => z.UserId == userId && !z.Deleted)
                .OrderBy(z => z.Order)
                .ToListAsync();
        }

        public Task MoveListItemAsync(Guid userId, Guid listItemId, Guid parentId)
        {
            throw new NotImplementedException();
        }

        public async Task PutListItemAsync(Guid listItemId, ListItemEntity entityPut)
        {
            var entity = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

            entity.Label = entityPut.Label;
            entity.Description = entityPut.Description;
        }
    }
}
