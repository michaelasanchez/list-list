using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidHeaderCreation(Guid? userId, int? index);
    Task<ValidationResult> AgainstInvalidHeaderDelete(Guid? userId, string token);
    Task<ValidationResult> AgainstInvalidHeaderGet(Guid? userId, string token);
    Task<ValidationResult> AgainstInvalidHeaderPatch(Guid? userId, string token, HeaderPatch patch);
    Task<ValidationResult> AgainstInvalidHeaderRelocation(Guid? userId, string token, int index);
    Task<ValidationResult> AgainstInvalidHeaderRestoral(Guid? userId, string token, int? index);
    Task<ValidationResult> AgainstInvalidItemCreation(Guid? userId, string token);

    Task<ValidationResult> AgainstInvalidItemComplete(Guid? userId, string token, Guid itemId);
    Task<ValidationResult> AgainstInvalidItemDelete(Guid? userId, string token, Guid itemId);
    Task<ValidationResult> AgainstInvalidItemGet(Guid? userId, string token, Guid itemId);
    Task<ValidationResult> AgainstInvalidItemPatch(Guid? userId, string token, Guid itemId);
    Task<ValidationResult> AgainstInvalidItemPut(Guid? userId, string token, Guid itemId);
    Task<ValidationResult> AgainstInvalidItemRelocation(Guid? userId, string token, Guid itemId, Guid? parentId);
    Task<ValidationResult> AgainstInvalidItemRestoral(Guid? userId, string token, Guid itemId, Guid? overId, Guid? parentId);

    Task<ValidationResult> AgainstInvalidShare(Guid? userId, string token, HeaderShare listHeaderShare);
    Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid linkId);
    Task<ValidationResult> AgainstInvalidShareLinkPut(Guid? userId, Guid linkId, ShareLinkPut shareLinkPatch);
}
