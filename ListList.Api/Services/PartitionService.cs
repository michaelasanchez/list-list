using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Models.Resources;

namespace ListList.Api.Services;

public class PartitionService(
    IUnitOfWork _unitOfWork,
    ICurrentUserService _userService,
    IMapper _mapper,
    IGuard _guard) : BaseService, IPartitionService
{
    public async Task<Guid> CreatePartition(PartitionCreation creation, int? order)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidPartitionCreation(userId, order));

        var entity = _mapper.Map<PartitionEntity>(creation);

        await _unitOfWork.PartitionRepository.CreatePartition(userId.Value, entity, order);

        return entity.Id;
    }

    public async Task<Guid> CreateNode(string token, NodeCreation creation)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeCreation(userId, token));

        var resource = _mapper.Map<NodeResource>(creation);

        return await _unitOfWork.NodeRepository.CreateNode(resource, token, creation.OverId, creation.ParentId);
    }

    public async Task DeletePartition(string token)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidPartitionDelete(userId, token));

        await _unitOfWork.PartitionRepository.DeletePartition(token);
    }

    public async Task<Partition> GetPartition(string token)
    {
        var userId = await _userService.GetUserId();

        if (Guid.TryParse(token, out var partitionId))
        {
            await InvokeGuard(() => _guard.AgainstInvalidPartitionGet(userId, token));

        }

        var partition = await _unitOfWork.PartitionRepository.GetPartition(userId, token);

        return _mapper.Map<Partition>(partition);
    }

    public async Task<IEnumerable<Partition>> GetPartitions()
    {
        var userId = await _userService.GetUserId();

        var listPartitions = await _unitOfWork.PartitionRepository.GetPartitions(userId);

        return _mapper.Map<IEnumerable<Partition>>(listPartitions);
    }

    public async Task PatchPartition(string token, PartitionPatch partitionPatch)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidPartitionPatch(userId, token, partitionPatch));

        var resource = _mapper.Map<PartitionResource>(partitionPatch);

        await _unitOfWork.PartitionRepository.PatchPartition(token, resource);
    }

    public async Task PutPartition(string token, PartitionPut listPartitionPut)
    {
        var entityUpdate = _mapper.Map<PartitionEntity>(listPartitionPut);

        await _unitOfWork.PartitionRepository.PutPartition(token, entityUpdate);
    }

    public async Task RelocatePartition(string token, int index)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidPartitionRelocation(userId, token, index));

        await _unitOfWork.PartitionRepository.RelocatePartition(userId.Value, token, index);
    }

    public async Task RestorePartition(string token, int? order)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidPartitionRestoral(userId, token, order));

        await _unitOfWork.PartitionRepository.RestorePartition(userId.Value, token, order);
    }
}
