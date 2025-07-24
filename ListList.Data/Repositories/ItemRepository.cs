using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class ItemRepository(ListListContext _context) : IItemRepository
{
    public async Task CompleteListItem(Guid listItemId)
    {
        var listItem = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        listItem.Complete = !listItem.Complete;
    }

    public async Task CreateListItem(ListItemEntity creation, Guid parentId)
    {
        await InsertItem([creation], parentId);

        await _context.ListItems.AddAsync(creation);
    }

    public async Task InsertItem(List<ListItemEntity> active, Guid? parentId, Guid? overId = null)
    {
        if (active is not { Count: > 0 })
        {
            return;
        }

        var listHeaderId = active.First().ListHeaderId;
        var spaceNeeded = active.Count * 2;

        var insertionPoint = await GetInsertionPoint(listHeaderId, parentId, overId);

        await ShiftExistingNodes(listHeaderId, insertionPoint, spaceNeeded);

        var positioningOffset = Math.Max(insertionPoint - 1, 0);

        foreach (var item in active)
        {
            item.Left += positioningOffset;
            item.Right += positioningOffset;
        }
    }

    public async Task DeleteListItem(Guid itemId)
    {
        var activeItem = await _context.ListItems.SingleAsync(z => z.Id == itemId);

        var removed = await RemoveNode(activeItem);

        foreach (var item in removed)
        {
            item.Left = 0;
            item.Right = 0;
            item.Deleted = true;
            item.DeletedOn = DateTime.UtcNow;
        }
    }

    public async Task<ListItemEntity> GetListItemById(Guid listItemId)
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

    public async Task PutListItem(Guid listItemId, ListItemEntity entityPut)
    {
        var entity = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        entity.Label = entityPut.Label;
        entity.Description = entityPut.Description;
    }

    public async Task RelocateListItem(Guid activeId, Guid overId, Guid? parentId)
    {
        var active = await _context.ListItems
            .SingleAsync(z => z.Id == activeId);

        var over = await _context.ListItems
            .SingleAsync(z => z.Id == overId);

        var useNext = active.Left < over.Left;

        var nextId = await _context.ListItems
            .Where(z =>
                z.ListHeaderId == active.ListHeaderId &&
                z.Left > (useNext ? over.Right : active.Right) &&
                !z.Deleted)
            .OrderBy(z => z.Left)
            .Select(z => (Guid?)z.Id)
            .FirstOrDefaultAsync();

        var relocating = await RemoveNode(active);

        ReindexSubtree(relocating);

        _context.RemoveRange(relocating);

        await _context.SaveChangesAsync();

        await InsertItem(relocating, parentId, activeId == overId || useNext ? nextId : over.Id);

        _context.ListItems.AddRange(relocating);

        await _context.SaveChangesAsync();
    }

    private async Task<List<ListItemEntity>> GetDescendants(ListItemEntity parent)
    {
        return await _context.ListItems
            .Where(z =>
                z.ListHeaderId == parent.ListHeaderId &&
                z.Left > parent.Left &&
                z.Right < parent.Right &&
                !z.Deleted)
            .ToListAsync();
    }

    private async Task<int> GetInsertionPoint(Guid listHeaderId, Guid? parentId, Guid? overId)
    {
        var over = overId is null ? null :
            await _context.ListItems
                .AsNoTracking()
                .Where(z => z.Id == overId)
                .SingleOrDefaultAsync();

        var parent = parentId is null ? null :
            await _context.ListItems
                .AsNoTracking()
                .Where(z => z.Id == parentId)
                .SingleOrDefaultAsync();

        var maxRight = await _context.ListItems
            .AsNoTracking()
            .Where(z => z.ListHeaderId == listHeaderId && !z.Deleted)
            .OrderByDescending(z => z.Right)
            .Select(z => (int?)z.Right)
            .FirstOrDefaultAsync();

        var partOfTheMess = maxRight is null ? 0 : maxRight.Value + 1;

        var leftBoundary =
            over is null && parent is null

            ?
        partOfTheMess
:
        Math.Min(
            over?.Left ?? parent?.Right ?? 0,
            parent?.Right ?? over?.Left ?? 0
        );

        return leftBoundary;
    }

    private async Task<List<ListItemEntity>> RemoveNode(ListItemEntity active)
    {
        var removeCount = (active.Right - active.Left + 1) / 2;

        var descendants = await GetDescendants(active);

        var subsequent = await _context.ListItems
            .Where(z =>
                z.Id != active.Id &&
                z.ListHeaderId == active.ListHeaderId &&
                z.Right > active.Right &&
                !z.Deleted)
            .ToListAsync();

        foreach (var item in subsequent)
        {
            if (item.Left > active.Left)
            {
                item.Left -= removeCount * 2;
            }

            item.Right -= removeCount * 2;
        }

        return [active, .. descendants];
    }

    private async Task ShiftExistingNodes(Guid listHeaderId, int insertionPoint, int spaceNeeded)
    {
        var items = await _context.ListItems
            .Where(z =>
                z.ListHeaderId == listHeaderId &&
                z.Right >= insertionPoint &&
                !z.Deleted)
            .OrderBy(z => z.Left)
            .ToListAsync();

        foreach (var item in items)
        {
            if (item.Left >= insertionPoint)
            {
                item.Left += spaceNeeded;
            }

            item.Right += spaceNeeded;
        }
    }

    private static void ReindexSubtree(List<ListItemEntity> items)
    {
        if (items is not { Count: > 0 })
        {
            return;
        }

        var diff = items.Min(z => z.Left) - 1;

        foreach (var item in items)
        {
            item.Left -= diff;
            item.Right -= diff;
        }
    }
}
