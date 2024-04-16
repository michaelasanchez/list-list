using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class ItemRepository(IListListContext _context) : IItemRepository
{
    public async Task CompleteListItemAsync(Guid listItemId)
    {
        var listItem = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        listItem.Complete = !listItem.Complete;
    }

    public async Task CreateListItemAsync(ListItemEntity creation, Guid parentId)
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

        await _context.ListItems.AddAsync(creation);
    }

    public async Task DeleteListItemAsync(Guid listItemId)
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

    public async Task<ListItemEntity> GetListItemByIdAsync(Guid listItemId)
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

    public async Task PutListItemAsync(Guid listItemId, ListItemEntity entityPut)
    {
        var entity = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        entity.Label = entityPut.Label;
        entity.Description = entityPut.Description;
    }
}
