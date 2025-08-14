using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidListItemCompleteAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListHeaderCreation(Guid? userId);
    Task<ValidationResult> AgainstInvalidListHeaderGetAsync(Guid? userId, Guid listHeaderId);
    Task<ValidationResult> AgainstInvalidListHeaderPatch(Guid? userId, Guid headerId, HeaderPatch patch);
    Task<ValidationResult> AgainstInvalidListHeaderRelocationAsync(Guid? userId, Guid listHeaderId, int index);

    Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid parentId);
    Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListGet(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPatchAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemRelocation(Guid? userId, Guid listItemId, Guid? parentId);

    Task<ValidationResult> AgainstInvalidListShare(Guid? userId, Guid listHeaderId, ListHeaderShare listHeaderShare);
}
