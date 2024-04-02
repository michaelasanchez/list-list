using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;
using ListList.Data.Validators.Interfaces;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    private readonly IListItemValidator _listItemValidator;
    public Guard(IListItemValidator listItemValidator)
    {
        _listItemValidator = listItemValidator;
    }

    public async Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid userId, Guid listItemId)
    {
        var result = new ValidationResult();

        await _listItemValidator.ListItemIsEmptyAsync(userId, listItemId, result);

        await _listItemValidator.UserOwnsListItemAsync(userId, listItemId, result);

        return result;
    }
}
