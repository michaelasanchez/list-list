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

    public async Task<List<ListItemEntity>> RelocateListItemAsync(Guid targetId, Guid parentId, int index)
    {
        var listItem = await _context.ListItems.SingleAsync(z => z.Id == targetId);

        var items = await _context.ListItems
            .Where(z =>
                z.ListHeaderId == listItem.ListHeaderId &&
                !z.Deleted)
            .ToListAsync();

        var removed = RemoveItems(items, targetId);

        InsertItems(items, removed, parentId, index);

        return [.. items, .. removed];
    }

    public static void InsertItems(List<ListItemEntity> items, List<ListItemEntity> toInsert, Guid parentId, int index)
    {
        var parent = items.Single(z => z.Id == parentId);

        var directChildren = items
            .Where(z =>
                z.Left > parent.Left &&
                z.Right < parent.Right &&
                !items.Any(other =>
                    other.Left > parent.Left &&
                    other.Right < parent.Right &&
                    other.Left < z.Left &&
                    other.Right > z.Right))
            .OrderBy(z => z.Left)
            .ToList();

        int insertAt = index == 0
            ? parent.Left
            : directChildren[index - 1].Right;

        int minLeft = toInsert.Min(i => i.Left);
        int maxRight = toInsert.Max(i => i.Right);
        int width = maxRight - minLeft + 1;

        foreach (var item in items)
        {
            if (item.Left > insertAt)
                item.Left += width;

            if (item.Right > insertAt)
                item.Right += width;
        }

        int offset = insertAt + 1 - minLeft;
        foreach (var item in toInsert)
        {
            item.Left += offset;
            item.Right += offset;
        }
    }

    private static List<ListItemEntity> RemoveItems(List<ListItemEntity> items, Guid id)
    {
        var target = items.FirstOrDefault(z => z.Id == id);

        if (target == null)
            return [];

        var left = target.Left;
        var right = target.Right;
        var width = right - left + 1;

        var toRemove = items
            .Where(z => z.Left >= left && z.Right <= right)
            .ToList();

        items.RemoveAll(toRemove.Contains);

        var diff = toRemove.Min(z => z.Left) - 1;

        foreach (var item in toRemove)
        {
            item.Left -= diff;
            item.Right -= diff;
        }

        foreach (var item in items)
        {
            if (item.Left > right)
                item.Left -= width;

            if (item.Right > right)
                item.Right -= width;
        }

        return toRemove;
    }
}
