using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class ShareValidator(IListListContext context) : IShareValidator
{
    public async Task TokenIsAvailable(Guid? linkId, string token, ValidationResult result)
    {
        var shareLinkNameExists = context.ShareLinks
            .AsNoTracking()
            .Where(z => z.Token == token);

        if (linkId.HasValue)
        {
            shareLinkNameExists = shareLinkNameExists
                .Where(z => z.Id != linkId.Value);
        }

        if (await shareLinkNameExists.AnyAsync())
        {
            result.AddError($"The {nameof(token)} '{token}' is already in use.");
        }
    }

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
