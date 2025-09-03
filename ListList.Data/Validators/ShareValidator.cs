using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class ShareValidator(IListListContext context) : IShareValidator
{
    public async Task UserOwnsShareLink(Guid? userId, Guid shareLinkId, ValidationResult result)
    {
        var userOwnsShareLink = await context.ShareLinks
            .Include(z => z.Header)
            .AnyAsync(z =>
                z.Id == shareLinkId &&
                z.Header != null &&
                z.Header.OwnerId == userId);

        if (!userOwnsShareLink)
        {
            result.AddError($"The {nameof(shareLinkId)} '{shareLinkId}' is invalid.");
        }
    }
}
