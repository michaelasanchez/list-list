using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class HeaderValidator(IListListContext _context) : IHeaderValidator
{
    public async Task HeaderIsDeleted(Guid? userId, Guid headerId, ValidationResult result)
    {
        var isDeleted = await _context.Headers
            .AnyAsync(z => z.Id == headerId && z.OwnerId == userId && z.Deleted);

        if (!isDeleted)
        {
            result.AddError($"The {nameof(headerId)} '{headerId}' is not deleted.");
        }
    }

    public async Task HeaderIsNotDeleted(Guid? userId, Guid headerId, ValidationResult result)
    {
        var isDeleted = await _context.Headers
            .AnyAsync(z => z.Id == headerId && z.OwnerId == userId && z.Deleted);

        if (isDeleted)
        {
            result.AddError($"The {nameof(headerId)} '{headerId}' is deleted.");
        }
    }

    public async Task IsValidHeaderIndexAsync(Guid? userId, int? index, ValidationResult result)
    {
        var isValidIndex = index >= 0 &&
            index <= await _context.Headers
                .CountAsync(z => z.OwnerId == userId && !z.Deleted);

        if (!isValidIndex)
        {
            result.AddError($"The {nameof(index)} '{index}' is invalid.");
        }
    }

    public async Task UserOwnsListHeaderAsync(Guid? userId, Guid listHeaderId, ValidationResult result)
    {
        var userOwnsListHeader = await _context.Headers
            .AnyAsync(z => z.Id == listHeaderId && z.OwnerId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError($"The {nameof(listHeaderId)} '{listHeaderId}' is invalid.");
        }
    }
}
