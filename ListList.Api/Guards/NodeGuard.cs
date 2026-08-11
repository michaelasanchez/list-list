using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidNodeComplete(Guid? userId, string token, Guid nodeId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodeDelete(Guid? userId, string token, Guid nodeId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        await nodeValidator.IsEmpty(nodeId, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodeGet(Guid? userId, string token, Guid nodeId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanView(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodePatch(Guid? userId, string token, Guid nodeId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodePut(Guid? userId, string token, Guid nodeId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodeRelocation(Guid? userId, string token, Guid nodeId, Guid? parentId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        await nodeValidator.IsNotDeleted(parentId, result);

        //await nodeValidator.IsValidIndex(destinationParentId, relativeIndex, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodeRestoral(Guid? userId, string token, Guid nodeId, Guid? overId, Guid? parentId)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        await nodeValidator.IsDeleted(nodeId, result);

        return result;
    }
}
