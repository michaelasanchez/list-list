using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid userId, Guid listItemId)
    {
        var result = new ValidationResult();

        await _itemValidator.UserOwnsListItemAsync(userId, listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid userId, Guid parentId)
    {
        var result = new ValidationResult();

        await _itemValidator.UserOwnsListItemAsync(userId, parentId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid userId, Guid listItemId)
    {
        var result = new ValidationResult();

        await _itemValidator.UserOwnsListItemAsync(userId, listItemId, result);

        await _itemValidator.ListItemIsEmptyAsync(listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemGetAsync(Guid userId, Guid listItemId)
    {
        var result = new ValidationResult();

        await _itemValidator.UserOwnsListItemAsync(userId, listItemId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid userId, Guid listItemId)
    {
        var result = new ValidationResult();

        await _itemValidator.UserOwnsListItemAsync(userId, listItemId, result);

        return result;
    }
}
