using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidItemComplete(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        await itemValidator.ListItemIsEmptyAsync(itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListGet(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPatchAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemRelocation(Guid? userId, Guid itemId, Guid? parentId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        await itemValidator.ListItemIsNotDeletedAsync(parentId, result);

        //await itemValidator.ListItemRelativeIndexIsValidAsync(destinationParentId, relativeIndex, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidItemRestoral(Guid? userId, Guid itemId, Guid? overId, Guid? parentId)
    {
        var result = new ValidationResult();

        await itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        await itemValidator.ListItemIsDeletedAsync(itemId, result);

        return result;
    }
}
