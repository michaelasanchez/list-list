using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class HeaderValidator(IListListContext _context) : IHeaderValidator
{
    public async Task IsValidHeaderIndexAsync(Guid? userId, int index, ValidationResult result)
    {
        var isValidIndex = index >= 0 &&
            index < await _context.ListHeaders
                .CountAsync(z => z.OwnerId == userId && !z.Deleted);

        if (!isValidIndex)
        {
            result.AddError($"The {nameof(index)} '{index}' is invalid.");
        }
    }

    public async Task UserOwnsListHeaderAsync(Guid? userId, Guid listHeaderId, ValidationResult result)
    {
        var userOwnsListHeader = await _context.ListHeaders
            .AnyAsync(z => z.Id == listHeaderId && z.OwnerId == userId && !z.Deleted);

        if (!userOwnsListHeader)
        {
            result.AddError($"The {nameof(listHeaderId)} '{listHeaderId}' is invalid.");
        }
    }
}
