using ListList.Api.Contracts.Patch;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidHeaderCreation(Guid? userId, int? order)
    {
        var result = new ValidationResult();

        await headerValidator.IsValidIndex(userId, order, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidHeaderDelete(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await headerValidator.IsOwnedByUser(userId, token, result);

        await headerValidator.IsNotDeleted(token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidHeaderGet(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await headerValidator.CanView(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidHeaderPatch(Guid? userId, string token, HeaderPatch patch)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidHeaderRelocation(Guid? userId, string token, int index)
    {
        var result = new ValidationResult();

        await headerValidator.IsOwnedByUser(userId, token, result);

        await headerValidator.IsValidIndex(userId, index, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidHeaderRestoral(Guid? userId, string token, int? order)
    {
        var result = new ValidationResult();

        await headerValidator.IsOwnedByUser(userId, token, result);

        await headerValidator.IsDeleted(token, result);

        await headerValidator.IsValidIndex(userId, order, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemCreation(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        return result;
    }
}
