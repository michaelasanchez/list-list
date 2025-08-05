using ListList.Api.Contracts.Post;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidListShare(Guid? userId, Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        var result = new ValidationResult();

        await _headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        DateValidator.IsFutureDate(listHeaderShare.ExpiresOn, result);

        return result;
    }
}
