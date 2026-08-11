using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface INodeValidator
{
    Task IsDeleted(Guid nodeId, ValidationResult result);
    Task IsEmpty(Guid nodeId, ValidationResult result);
    Task IsNotDeleted(Guid? nodeId, ValidationResult result);
    Task IsValidIndex(Guid destinationParentId, int relativeIndex, ValidationResult result);
}
