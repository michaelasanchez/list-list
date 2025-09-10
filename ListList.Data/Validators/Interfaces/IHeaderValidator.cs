using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IHeaderValidator
{
    Task HeaderIsDeleted(Guid? userId, Guid headerId, ValidationResult result);
    Task HeaderIsNotDeleted(Guid? userId, Guid headerId, ValidationResult result);
    Task IsValidHeaderIndexAsync(Guid? userId, int? index, ValidationResult result);
    Task UserOwnsListHeaderAsync(Guid? userId, Guid listHeaderId, ValidationResult result);
}
