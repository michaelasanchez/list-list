using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidItemComplete(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidHeaderCreation(Guid? userId);
    Task<ValidationResult> AgainstInvalidHeaderDelete(Guid? userId, Guid listHeaderId);
    Task<ValidationResult> AgainstInvalidHeaderGet(Guid? userId, Guid listHeaderId);
    Task<ValidationResult> AgainstInvalidHeaderPatch(Guid? userId, Guid headerId, HeaderPatch patch);
    Task<ValidationResult> AgainstInvalidHeaderRelocation(Guid? userId, Guid listHeaderId, int index);

    Task<ValidationResult> AgainstInvalidListItemCreationAsync(Guid? userId, Guid parentId);
    Task<ValidationResult> AgainstInvalidListItemDeleteAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListGet(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPatchAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemPutAsync(Guid? userId, Guid listItemId);
    Task<ValidationResult> AgainstInvalidListItemRelocation(Guid? userId, Guid listItemId, Guid? parentId);

    Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid listHeaderId);
    Task<ValidationResult> AgainstInvalidShareLinkPatch(Guid? userId, Guid listHeaderId, ShareLinkPut shareLinkPatch);
    Task<ValidationResult> AgainstInvalidListShare(Guid? userId, Guid listHeaderId, ListHeaderShare listHeaderShare);
}
