using ListList.Api.Contracts.Patch;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public Task<ValidationResult> AgainstInvalidListHeaderCreation(Guid? userId)
    {
        var result = new ValidationResult();

        return Task.FromResult(result);
    }

    public async Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid headerId)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, headerId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListHeaderGetAsync(Guid? userId, Guid listHeaderId)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListHeaderPatch(Guid? userId, Guid headerId, HeaderPatch patch)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, headerId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListHeaderRelocationAsync(Guid? userId, Guid listHeaderId, int index)
    {
        var result = new ValidationResult();

        await headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        await headerValidator.IsValidHeaderIndexAsync(userId, index, result);

        return result;
    }
}
