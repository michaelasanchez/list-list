using ListList.Api.Contracts.Post;
using ListList.Data.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/tree")]
public class TreeController(IUnitOfWork unitOfWork, ICurrentUserService currentUser) : Controller
{
    [HttpPost("{token}/node/{nodeId}/relocate")]
    public async Task<ActionResult> RelocateNode(string token, Guid nodeId, TreeNodeRelocation request)
    {
        await unitOfWork.TreeRepository.RelocateNode(await GetUserId(), token, nodeId, request.DestinationPartitionId, request.ParentId, request.Order);
        return Ok();
    }

    [HttpPost("{token}/node/{nodeId}/copy")]
    public async Task<ActionResult> CopyNode(string token, Guid nodeId, TreeNodeRelocation request)
    {
        await unitOfWork.TreeRepository.CopyNode(await GetUserId(), token, nodeId, request.DestinationPartitionId, request.ParentId, request.Order);
        return Ok();
    }

    [HttpPost("{token}/node/{nodeId}/promote")]
    public async Task<ActionResult<Guid>> PromoteNode(string token, Guid nodeId, TreePartitionPosition request)
    {
        var id = await unitOfWork.TreeRepository.PromoteNode(await GetUserId(), token, nodeId, request.Order);
        return Ok(id);
    }

    [HttpPost("{token}/partition/relocate")]
    public async Task<ActionResult> RelocatePartition(string token, TreePartitionPosition request)
    {
        await unitOfWork.TreeRepository.RelocatePartition(await GetUserId(), token, request.Order);
        return Ok();
    }

    [HttpPost("{token}/partition/copy")]
    public async Task<ActionResult<Guid>> CopyPartition(string token, TreePartitionPosition request)
    {
        var id = await unitOfWork.TreeRepository.CopyPartition(await GetUserId(), token, request.Order);
        return Ok(id);
    }

    [HttpPost("{token}/partition/demote")]
    public async Task<ActionResult> DemotePartition(string token, TreePartitionDemotion request)
    {
        await unitOfWork.TreeRepository.DemotePartition(await GetUserId(), token, request.DestinationPartitionId, request.ParentId, request.Order);
        return Ok();
    }

    private async Task<Guid> GetUserId()
        => await currentUser.GetUserId() ?? throw new UnauthorizedAccessException("A signed-in user is required.");
}
