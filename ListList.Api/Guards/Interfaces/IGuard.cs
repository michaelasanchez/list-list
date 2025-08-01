using ListList.Api.Contracts.Post;
using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListHeaderCreation(Guid userId);
    Task<ValidationResult> AgainstInvalidListHeaderGetAsync(Guid userId, Guid listHeaderId);
    Task<ValidationResult> AgainstInvalidListHeaderRelocationAsync(Guid userId, Guid listHeaderId, int index);
    Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid userId, Guid parentId);
    Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemGetAsync(Guid userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemRelocation(Guid userId, Guid listItemId, Guid? parentId);
    Task<ValidationResult> AgainstInvalidListShare(Guid userId, Guid listHeaderId, ListHeaderShare listHeaderShare);
}
