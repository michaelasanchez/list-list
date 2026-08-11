using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidShare(Guid? userId, string token, PartitionShare share)
    {
        var result = new ValidationResult();

        await partitionValidator.IsOwnedByUser(userId, token, result);

        await shareValidator.TokenIsAvailable(null, share.Token, result);

        DateValidator.IsFutureDate(share.ExpiresOn, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid partitionId)
    {
        var result = new ValidationResult();

        await shareValidator.UserOwnsShareLink(userId, partitionId, result);

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
