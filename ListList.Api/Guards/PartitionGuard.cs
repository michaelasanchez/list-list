using ListList.Api.Contracts.Patch;
using ListList.Api.Guards.Interfaces;
using ListList.Data.Models;

namespace ListList.Api.Guards;

public partial class Guard : IGuard
{
    public async Task<ValidationResult> AgainstInvalidPartitionCreation(Guid? userId, int? order)
    {
        var result = new ValidationResult();

        await partitionValidator.IsValidIndex(userId, order, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidPartitionDelete(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await partitionValidator.IsOwnedByUser(userId, token, result);

        await partitionValidator.IsNotDeleted(token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidPartitionGet(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await partitionValidator.CanView(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidPartitionPatch(Guid? userId, string token, PartitionPatch patch)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidPartitionRelocation(Guid? userId, string token, int index)
    {
        var result = new ValidationResult();

        await partitionValidator.IsOwnedByUser(userId, token, result);

        await partitionValidator.IsValidIndex(userId, index, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidPartitionRestoral(Guid? userId, string token, int? order)
    {
        var result = new ValidationResult();

        await partitionValidator.IsOwnedByUser(userId, token, result);

        await partitionValidator.IsDeleted(token, result);

        await partitionValidator.IsValidIndex(userId, order, result);

        return result;
    }

    public async Task<ValidationResult> AgainstInvalidNodeCreation(Guid? userId, string token)
    {
        var result = new ValidationResult();

        await partitionValidator.CanUpdate(userId, token, result);

        return result;
    }
}
