using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services;

public class NodeService(
    IUnitOfWork _unitOfWork,
    ICurrentUserService _userService,
    IMapper _mapper,
    IGuard _guard) : BaseService, INodeService
{
    private readonly INodeRepository _nodeRepository = _unitOfWork.NodeRepository;

    public async Task CompleteNode(string token, Guid nodeId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeComplete(userId, token, nodeId));

        await _nodeRepository.CompleteNode(nodeId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteNode(string token, Guid nodeId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeDelete(userId, token, nodeId));

        await _nodeRepository.DeleteNode(nodeId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<Node> GetNodeById(string token, Guid nodeId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeGet(userId, token, nodeId));

        var node = await _nodeRepository.GetNodeById(nodeId);

        return _mapper.Map<Node>(node);
    }

    public async Task PatchNode(string token, Guid nodeId, NodePatch nodePatch, bool? recursive)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodePatch(userId, token, nodeId));

        var resource = _mapper.Map<NodeResource>(nodePatch);

        await _nodeRepository.PatchNode(nodeId, resource, recursive);
    }

    public async Task PutNode(string token, Guid nodeId, NodePut nodePut)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodePut(userId, token, nodeId));

        var entityPut = _mapper.Map<NodeEntity>(nodePut);

        await _nodeRepository.PutNode(nodeId, entityPut);
    }

    public async Task RelocateNode(string token, Guid activeId, Guid overId, Guid? parentId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeRelocation(userId, token, activeId, parentId));

        await _nodeRepository.RelocateNode(activeId, overId, parentId);
    }

    public async Task RestoreNode(string token, Guid nodeId, Guid? overId, Guid? parentId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidNodeRestoral(userId, token, nodeId, overId, parentId));

        await _nodeRepository.RestoreNode(nodeId, overId, parentId);
    }
}
