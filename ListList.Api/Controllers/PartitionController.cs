using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/partition")]
public class PartitionController(IPartitionService _service) : Controller
{
    [HttpPost]
    public async Task<ActionResult<Guid>> CreatePartition(PartitionCreation creation)
    {
        var id = await _service.CreatePartition(creation, creation.Order);

        return Ok(id);
    }

    [HttpPost("{token}")]
    public async Task<ActionResult<Guid>> CreateNode(string token, NodeCreation creation)
    {
        var id = await _service.CreateNode(token, creation);

        return Ok(id);
    }

    [HttpDelete("{token}")]
    public async Task<ActionResult> DeletePartition(string token)
    {
        await _service.DeletePartition(token);

        return Ok();
    }

    [HttpGet("{token}")]
    public async Task<ActionResult<Partition>> GetPartition(string token)
    {
        var partition = await _service.GetPartition(token);

        return Ok(partition);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Partition>>> GetPartitions()
    {
        var partitions = await _service.GetPartitions();

        return Ok(partitions);
    }

    [HttpPatch("{token}")]
    public async Task<ActionResult<Partition>> PatchPartition(string token, PartitionPatch patch)
    {
        await _service.PatchPartition(token, patch);

        return Ok();
    }

    [HttpPut("{token}")]
    public async Task<ActionResult> PutPartition(string token, PartitionPut put)
    {
        await _service.PutPartition(token, put);

        return Ok();
    }

    [HttpPost("{token}/relocate")]
    public async Task<ActionResult> RelocatePartition(string token, PartitionRelocation relocation)
    {
        await _service.RelocatePartition(token, relocation.Order);

        return Ok();
    }

    [HttpPost("{token}/restore")]
    public async Task<ActionResult> RestorePartition(string token, PartitionRestoral? restoral)
    {
        await _service.RestorePartition(token, restoral?.Order);

        return Ok();
    }
}
