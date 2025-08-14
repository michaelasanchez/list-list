using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid parentId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, parentId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        await _itemValidator.ListItemIsEmptyAsync(itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListGet(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPatchAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid itemId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemRelocation(Guid? userId, Guid itemId, Guid? parentId)
    {
        var result = new ValidationResult();

        await _itemValidator.ListItemIsOwnedByUserAsync(userId, itemId, result);

        await _itemValidator.ListItemIsNotDeletedAsync(parentId, result);

        //await _itemValidator.ListItemRelativeIndexIsValidAsync(destinationParentId, relativeIndex, result);

        return result;
    }
}
