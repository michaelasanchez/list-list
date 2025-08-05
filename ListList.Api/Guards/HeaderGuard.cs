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

    public async Task<ValidationResult> AgainstInvalidListHeaderGetAsync(Guid? userId, Guid listHeaderId)
    {
        var result = new ValidationResult();

        await _headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListHeaderRelocationAsync(Guid? userId, Guid listHeaderId, int index)
    {
        var result = new ValidationResult();

        await _headerValidator.UserOwnsListHeaderAsync(userId, listHeaderId, result);

        await _headerValidator.IsValidHeaderIndexAsync(userId, index, result);

        return result;
    }
}
