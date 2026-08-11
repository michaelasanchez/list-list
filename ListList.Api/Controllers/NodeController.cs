using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api")]
public class NodeController(INodeService _service) : Controller
{
    [HttpPost("{token}/node/{nodeId}/complete")]
    public async Task<ActionResult> CompleteNode(string token, Guid nodeId)
    {
        await _service.CompleteNode(token, nodeId);

        return Ok();
    }

    [HttpDelete("{token}/node/{nodeId}")]
    public async Task<ActionResult> DeleteNode(string token, Guid nodeId)
    {
        await _service.DeleteNode(token, nodeId);

        return Ok();
    }

    [HttpGet("{token}/node/{nodeId}")]
    public async Task<ActionResult<Node>> GetNodeById(string token, Guid nodeId)
    {
        var listNode = await _service.GetNodeById(token, nodeId);

        return Ok(listNode);
    }

    [HttpPatch("{token}/node/{nodeId}")]
    public async Task<ActionResult> PatchNode(string token, Guid nodeId, NodePatch nodePatch, [FromQuery] bool? recursive)
    {
        await _service.PatchNode(token, nodeId, nodePatch, recursive);

        return Ok();
    }

    [HttpPut("{token}/node/{nodeId}")]
    public async Task<ActionResult> PutNode(string token, Guid nodeId, NodePut listNodePut)
    {
        await _service.PutNode(token, nodeId, listNodePut);

        return Ok();
    }

    [HttpPost("{token}/node/{activeId}/relocate")]
    public async Task<IActionResult> RelocateNode(string token, Guid activeId, NodeRelocation listNodeRelocation)
    {
        await _service.RelocateNode(token, activeId, listNodeRelocation.OverId, listNodeRelocation.ParentId);

        return Ok();
    }

    [HttpPost("{token}/node/{nodeId}/restore")]
    public async Task<ActionResult> RestoreNode(string token, Guid nodeId, NodeRestoral? nodeRestoral)
    {
        await _service.RestoreNode(token, nodeId, nodeRestoral?.OverId, nodeRestoral?.ParentId);

        return Ok();
    }
}
