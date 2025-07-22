using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IItemValidator
{
    Task ListItemIsEmptyAsync(Guid listItemId, ValidationResult result);
    Task ListItemIsNotDeletedAsync(Guid? listItemId, ValidationResult result);
    Task ListItemIsOwnedByUserAsync(Guid userId, Guid listItemId, ValidationResult result);
    Task ListItemRelativeIndexIsValidAsync(Guid destinationParentId, int relativeIndex, ValidationResult result);
}
