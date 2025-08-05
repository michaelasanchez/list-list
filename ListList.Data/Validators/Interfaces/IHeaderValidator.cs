using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IHeaderValidator
{
    Task IsValidHeaderIndexAsync(Guid? userId, int index, ValidationResult result);
    Task UserOwnsListHeaderAsync(Guid? userId, Guid listHeaderId, ValidationResult result);
}
