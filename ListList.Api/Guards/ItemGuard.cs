using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidItemComplete(Guid? userId, string token, Guid itemId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemDelete(Guid? userId, string token, Guid itemId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        await itemValidator.IsEmpty(itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemGet(Guid? userId, string token, Guid itemId)
    {
        var result = new ValidationResult();

        await headerValidator.CanView(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemPatch(Guid? userId, string token, Guid itemId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemPut(Guid? userId, string token, Guid itemId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemRelocation(Guid? userId, string token, Guid itemId, Guid? parentId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        await itemValidator.IsNotDeleted(parentId, result);

        //await itemValidator.IsValidIndex(destinationParentId, relativeIndex, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemRestoral(Guid? userId, string token, Guid itemId, Guid? overId, Guid? parentId)
    {
        var result = new ValidationResult();

        await headerValidator.CanUpdate(userId, token, result);

        await itemValidator.IsDeleted(itemId, result);

        return result;
    }
}
