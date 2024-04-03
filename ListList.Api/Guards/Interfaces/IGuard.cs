using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid? userId, Guid listItemId);
    ValidationResult AgainstInvalidListHeaderCreation(Guid? userId);
    Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid parentId);
    Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemGetAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid listItemId);
}
