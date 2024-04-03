using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IListItemValidator
{
    Task ListItemIsEmptyAsync(Guid userId, Guid listItemId, ValidationResult result);
    Task UserOwnsListItemAsync(Guid userId, Guid listItemId, ValidationResult result);
}
