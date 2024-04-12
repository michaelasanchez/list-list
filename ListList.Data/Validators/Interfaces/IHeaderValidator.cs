using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IHeaderValidator
{
    Task UserOwnsListHeaderAsync(Guid userId, Guid listHeaderId, ValidationResult result);
}
