using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class ItemValidator(IListListContext _context) : IItemValidator
{
    public async Task ListItemIsEmptyAsync(Guid itemId, ValidationResult result)
    {
        var targetNode = await _context.Items
            .Where(z => z.Id == itemId)
            .Select(z => new { z.HeaderId, z.Left, z.Right })
            .SingleOrDefaultAsync();

        if (targetNode is not null)
        {
            var listItemNotEmpty = await _context.Items
                .AnyAsync(z =>
                    z.HeaderId == targetNode.HeaderId &&
                    z.Left > targetNode.Left &&
                    z.Right < targetNode.Right);

            if (listItemNotEmpty)
            {
                result.AddError($"List item is not empty.");
            }
        }
    }

    public async Task ListItemIsNotDeletedAsync(Guid? itemId, ValidationResult result)
    {
        var listItemIsDeleted = await _context.Items
            .AnyAsync(z => z.Id == itemId && z.Deleted);

        if (listItemIsDeleted)
        {
            result.AddError($"List item [{itemId}] is deleted.");
        }
    }

    public async Task ListItemIsOwnedByUserAsync(Guid? userId, Guid itemId, ValidationResult result)
    {
        var test = await _context.Items
            .Include(z => z.Header)
            .Where(z => z.Id == itemId)
            .SingleOrDefaultAsync();

        var userOwnsListHeader = await _context.Items
            .Include(z => z.Header)
            .AnyAsync(z => z.Id == itemId && z.Header.OwnerId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError("User does not own this list.");
        }
    }

    public async Task ListItemRelativeIndexIsValidAsync(Guid destinationParentId, int relativeIndex, ValidationResult result)
    {
        var parentQuery = from listItem in _context.Items
                          where listItem.Id == destinationParentId
                          select listItem;

        var parent = await parentQuery.SingleAsync();

        var directChildren =
            from child in _context.Items
            where child.Left > parent.Left && child.Right < parent.Right
            let ancestorCount =
                (from a in _context.Items
                 where a.Left < child.Left && a.Right > child.Right
                 select a).Count()
            let parentAncestorCount =
                (from a in _context.Items
                 where a.Left < parent.Left && a.Right > parent.Right
                 select a).Count()
            where ancestorCount == parentAncestorCount + 1
            select child;

        int directChildrenCount = directChildren.Count();

        if (relativeIndex >= 0 && relativeIndex < directChildrenCount)
        {
            result.AddError($"The {nameof(relativeIndex)} '{relativeIndex}' is invalid.");
        }
    }
}
