using ListList.Data.Extensions;
using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
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

    public async Task CreateListItem(NodeEntity creation, Guid parentId)
    {
        await InsertItem([creation], parentId);

        await _context.ListItems.AddAsync(creation);
    }

    public async Task InsertItem(List<NodeEntity> active, Guid? parentId, Guid? overId = null)
    {
        if (active is not { Count: > 0 })
        {
            return;
        }

        var listHeaderId = active.First().HeaderId;
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

    public async Task<NodeEntity> GetListItemById(Guid listItemId)
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

    public async Task PatchListItem(Guid listItemId, ItemResource resource, bool? recursive)
    {
        var active = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        var entities = new List<NodeEntity> { active };

        if (recursive is true && active.HasDescendants())
        {
            var query = _context.ListItems
                .Where(z => z.Left > resource.Left && z.Right <= resource.Right && !z.Deleted);

            var descendants = await query.ToListAsync();

            entities.AddRange(descendants);
        }

        foreach (var entity in entities)
        {
            if (resource.Label is not null)
            {
                entity.Label = resource.Label;
            }

            if (resource.Description is not null)
            {
                entity.Description = resource.Description;
            }

            if (resource.Completable is not null)
            {
                entity.Completable = resource.Completable.Value;
            }

            if (resource.Complete is not null)
            {
                if (resource.Complete is true && !entity.Complete)
                {
                    entity.CompletedOn = DateTime.UtcNow;
                }

                entity.Complete = resource.Complete.Value;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task PutListItem(Guid listItemId, NodeEntity entityPut)
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
                z.HeaderId == active.HeaderId &&
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

    private async Task<List<NodeEntity>> GetDescendants(NodeEntity parent)
    {
        return await _context.ListItems
            .Where(z =>
                z.HeaderId == parent.HeaderId &&
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
            .Where(z => z.HeaderId == listHeaderId && !z.Deleted)
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

    private async Task<List<NodeEntity>> RemoveNode(NodeEntity active)
    {
        var removeCount = (active.Right - active.Left + 1) / 2;

        var descendants = await GetDescendants(active);

        var subsequent = await _context.ListItems
            .Where(z =>
                z.Id != active.Id &&
                z.HeaderId == active.HeaderId &&
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
                z.HeaderId == listHeaderId &&
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

    private static void ReindexSubtree(List<NodeEntity> items)
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
