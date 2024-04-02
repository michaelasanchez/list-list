using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid userId, Guid listItemId);
}
