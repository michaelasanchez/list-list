using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models;

namespace ListList.Api.Guards.Interfaces;

public interface IGuard
{
    Task<ValidationResult> AgainstInvalidPartitionCreation(Guid? userId, int? index);
    Task<ValidationResult> AgainstInvalidPartitionDelete(Guid? userId, string token);
    Task<ValidationResult> AgainstInvalidPartitionGet(Guid? userId, string token);
    Task<ValidationResult> AgainstInvalidPartitionPatch(Guid? userId, string token, PartitionPatch patch);
    Task<ValidationResult> AgainstInvalidPartitionRelocation(Guid? userId, string token, int index);
    Task<ValidationResult> AgainstInvalidPartitionRestoral(Guid? userId, string token, int? index);
    Task<ValidationResult> AgainstInvalidNodeCreation(Guid? userId, string token);

    Task<ValidationResult> AgainstInvalidNodeComplete(Guid? userId, string token, Guid nodeId);
    Task<ValidationResult> AgainstInvalidNodeDelete(Guid? userId, string token, Guid nodeId);
    Task<ValidationResult> AgainstInvalidNodeGet(Guid? userId, string token, Guid nodeId);
    Task<ValidationResult> AgainstInvalidNodePatch(Guid? userId, string token, Guid nodeId);
    Task<ValidationResult> AgainstInvalidNodePut(Guid? userId, string token, Guid nodeId);
    Task<ValidationResult> AgainstInvalidNodeRelocation(Guid? userId, string token, Guid nodeId, Guid? parentId);
    Task<ValidationResult> AgainstInvalidNodeRestoral(Guid? userId, string token, Guid nodeId, Guid? overId, Guid? parentId);

    Task<ValidationResult> AgainstInvalidShare(Guid? userId, string token, PartitionShare share);
    Task<ValidationResult> AgainstInvalidShareLinkDelete(Guid? userId, Guid linkId);
    Task<ValidationResult> AgainstInvalidShareLinkPut(Guid? userId, Guid linkId, ShareLinkPut put);
}
