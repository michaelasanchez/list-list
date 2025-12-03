using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IItemValidator
{
    Task IsDeleted(Guid itemId, ValidationResult result);
    Task IsEmpty(Guid itemId, ValidationResult result);
    Task IsNotDeleted(Guid? itemId, ValidationResult result);
    Task IsValidIndex(Guid destinationParentId, int relativeIndex, ValidationResult result);
}
