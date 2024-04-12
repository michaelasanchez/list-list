using ListList.Data.Validators.Interfaces;
using ListList.Data.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using ListList.Data.Models;

namespace ListList.Data.Validators;

public class HeaderValidator(IListListContext _context) : IHeaderValidator
{
    public async Task UserOwnsListHeaderAsync(Guid userId, Guid listHeaderId, ValidationResult result)
    {
        var userOwnsListHeader = await _context.ListHeaders
            .AnyAsync(z => z.Id == listHeaderId && z.UserId == userId);

        if (!userOwnsListHeader)
        {
            result.AddError("You do not own this list");
        }
    }
}
