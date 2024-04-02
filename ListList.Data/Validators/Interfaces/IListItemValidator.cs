using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IListItemValidator
{
    Task<ValidationResult> ListItemIsEmptyAsync(Guid userId, Guid listItemId, ValidationResult result);
    Task<ValidationResult> UserOwnsListItemAsync(Guid userId, Guid listItemId, ValidationResult result);
}
