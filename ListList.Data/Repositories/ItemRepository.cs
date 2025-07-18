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

    public async Task InsertItem(List<ListItemEntity> active, Guid parentId, Guid? overId = null)
    {
        if (active is not { Count: > 0 })
        {
            return;
        }

        var listHeaderId = active.First().ListHeaderId;

        //var overLeft = await _context.ListItems
        //    .AsNoTracking()
        //    .Where(z => z.Id == overId)
        //    .Select(z => z.Left)
        //    .SingleAsync();

        //var parentRight = await _context.ListItems
        //    .AsNoTracking()
        //    .Where(z => z.Id == parentId)
        //    .Select(z => z.Right)
        //    .SingleAsync();

        //var leftBoundary = Math.Min(overLeft, parentRight);

        var over = await _context.ListItems
            .AsNoTracking()
            .Where(z => z.Id == overId)
            .SingleAsync();

        var parent = await _context.ListItems
            .AsNoTracking()
            .Where(z => z.Id == parentId)
            .SingleAsync();

        var leftBoundary = Math.Min(over.Left, parent.Right);

        var items = await _context.ListItems
            .Where(z =>
                z.ListHeaderId == active[0].ListHeaderId &&
                z.Right >= leftBoundary &&
                !z.Deleted)
            .OrderBy(z => z.Left)
            .ToListAsync();

        foreach (var item in items)
        {
            if (item.Left >= leftBoundary)
            {
                item.Left += active.Count * 2;
            }

            item.Right += active.Count * 2;
        }

        foreach (var item in active)
        {
            item.Left = leftBoundary;
            item.Right = leftBoundary + 1;
        }
    }

    public async Task DeleteListItem(Guid listItemId)
    {
        var activeItem = await _context.ListItems.SingleAsync(z => z.Id == listItemId);

        await RemoveItemAsync(activeItem);

        var descendants = await GetDescendants(activeItem);

        activeItem.Left = 0;
        activeItem.Right = 0;
        activeItem.Deleted = true;
        activeItem.DeletedOn = DateTime.UtcNow;

        foreach (var item in descendants)
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

    public async Task RelocateListItem(Guid activeId, Guid overId, Guid parentId)
    {
        var active = await _context.ListItems
            .SingleAsync(z => z.Id == activeId);

        await RemoveItemAsync(active);

        var descendants = await GetDescendants(active);

        //var activeRight = active.Right;

        //active.Left -= activeRight;
        //active.Right -= activeRight;

        //foreach (var item in descendants)
        //{
        //    item.Left -= activeRight;
        //    item.Right -= activeRight;
        //}

        // TODO: hack for now
        active.Deleted = true;

        await _context.SaveChangesAsync();

        await InsertItem([active, .. descendants], parentId, overId);

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

    private async Task RemoveItemAsync(ListItemEntity active)
    {
        var removeCount = (active.Right - active.Left + 1) / 2;

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
    }
}
