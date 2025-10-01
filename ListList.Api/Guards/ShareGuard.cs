using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidShare(Guid? userId, Guid headerId, HeaderShare headerShare)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, headerId, result);

        await shareValidator.TokenIsAvailable(null, headerShare.Token, result);

        DateValidator.IsFutureDate(headerShare.ExpiresOn, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid listHeaderId)
    {
        var result = new ValidationResult();

        await shareValidator.UserOwnsShareLink(userId, listHeaderId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidShareLinkPut(Guid? userId, Guid linkId, ShareLinkPut put)
    {
        var result = new ValidationResult();

        await shareValidator.UserOwnsShareLink(userId, linkId, result);

        await shareValidator.TokenIsAvailable(linkId, put.Token, result);

        DateValidator.IsFutureDate(put.ExpiresOn, result);

        return result;
    }
}
