using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class ItemValidator(IListListContext _context) : IItemValidator
{
    public async Task ListItemIsEmptyAsync(Guid listItemId, ValidationResult result)
    {
        var targetNode = await _context.ListItems
            .Where(z => z.Id == listItemId)
            .Select(z => new { z.HeaderId, z.Left, z.Right })
            .SingleOrDefaultAsync();

        if (targetNode is not null)
        {
            var listItemNotEmpty = await _context.ListItems
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

    public async Task ListItemIsNotDeletedAsync(Guid? listItemId, ValidationResult result)
    {
        var listItemIsDeleted = await _context.ListItems
            .AnyAsync(z => z.Id == listItemId && z.Deleted);

        if (listItemIsDeleted)
        {
            result.AddError($"List item [{listItemId}] is deleted.");
        }
    }

    public async Task ListItemIsOwnedByUserAsync(Guid userId, Guid listItemId, ValidationResult result)
    {
        var userOwnsListHeader = await _context.ListItems
            .Include(z => z.ListHeader)
            .AnyAsync(z => z.Id == listItemId && z.ListHeader.OwnerId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError("User does not own this list.");
        }
    }

    public async Task ListItemRelativeIndexIsValidAsync(Guid destinationParentId, int relativeIndex, ValidationResult result)
    {
        var parentQuery = from listItem in _context.ListItems
                          where listItem.Id == destinationParentId
                          select listItem;

        var parent = await parentQuery.SingleAsync();

        var directChildren =
            from child in _context.ListItems
            where child.Left > parent.Left && child.Right < parent.Right
            let ancestorCount =
                (from a in _context.ListItems
                 where a.Left < child.Left && a.Right > child.Right
                 select a).Count()
            let parentAncestorCount =
                (from a in _context.ListItems
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
