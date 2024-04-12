using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IItemValidator
{
    Task ListItemIsEmptyAsync(Guid listItemId, ValidationResult result);
    Task UserOwnsListItemAsync(Guid userId, Guid listItemId, ValidationResult result);
}
