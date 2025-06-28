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
            .Select(z => new { z.ListHeaderId, z.Left, z.Right })
            .SingleOrDefaultAsync();

        if (targetNode is not null)
        {
            var listItemNotEmpty = await _context.ListItems
                .AnyAsync(z =>
                    z.ListHeaderId == targetNode.ListHeaderId &&
                    z.Left > targetNode.Left &&
                    z.Right < targetNode.Right);

            if (listItemNotEmpty)
            {
                result.AddError($"List item is not empty.");
            }
        }
    }

    public async Task ListItemIsNotDeletedAsync(Guid listItemId, ValidationResult result)
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
            .AnyAsync(z => z.Id == listItemId && z.ListHeader.UserId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError("User does not own this list.");
        }
    }
}
