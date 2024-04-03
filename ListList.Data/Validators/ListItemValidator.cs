using ListList.Data.Validators.Interfaces;
using ListList.Data.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using ListList.Data.Models;

namespace ListList.Data.Validators;

public class ListItemValidator(IListListContext _context) : IListItemValidator
{
    public async Task ListItemIsEmptyAsync(Guid userId, Guid listItemId, ValidationResult result)
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

    public async Task UserOwnsListItemAsync(Guid userId, Guid listItemId, ValidationResult result)
    {
        var userOwnsListHeader = await _context.ListItems
            .Include(z => z.ListHeader)
            .AnyAsync(z => z.Id == listItemId && z.ListHeader.UserId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError("You do not own this list.");
        }
    }
}
