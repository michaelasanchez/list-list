using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators.Interfaces;

namespace ListList.Api.Guards;

public partial class Guard(IListItemValidator _listItemValidator, IUserValidator _userValidator) : IGuard
{
    public ValidationResult AgainstInvalidListHeaderCreation(Guid? userId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid? userId, Guid listItemId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        await _listItemValidator.UserOwnsListItemAsync(userId!.Value, listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid parentId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        await _listItemValidator.UserOwnsListItemAsync(userId!.Value, parentId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid listItemId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        await _listItemValidator.ListItemIsEmptyAsync(userId!.Value, listItemId, result);

        await _listItemValidator.UserOwnsListItemAsync(userId!.Value, listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemGetAsync(Guid? userId, Guid listItemId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        await _listItemValidator.UserOwnsListItemAsync(userId!.Value, listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid listItemId)
    {
        var result = new ValidationResult();

        _userValidator.UserExists(userId, result);

        if (!result.IsInvalid)
        {
            return result;
        }

        await _listItemValidator.UserOwnsListItemAsync(userId!.Value, listItemId, result);

        return result;
    }
}
