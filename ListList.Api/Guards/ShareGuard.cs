using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid listHeaderId)
    {
        var result = new ValidationResult();

        await shareValidator.UserOwnsShareLink(userId, listHeaderId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidShareLinkPatch(Guid? userId, Guid listHeaderId, ShareLinkPut shareLinkPatch)
    {
        var result = new ValidationResult();

        await shareValidator.UserOwnsShareLink(userId, listHeaderId, result);

        DateValidator.IsFutureDate(shareLinkPatch.ExpiresOn, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListShare(Guid? userId, Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        DateValidator.IsFutureDate(listHeaderShare.ExpiresOn, result);

        return result;
    }
}
