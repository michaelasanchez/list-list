using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/header")]
public class HeaderController(IHeaderService _service) : Controller
{
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateHeader(HeaderCreation headerCreation)
    {
        var id = await _service.CreateHeader(headerCreation, headerCreation.Order);

        return Ok(id);
    }

    [HttpPost("{headerId}")]
    public async Task<ActionResult<Guid>> CreateItem(Guid headerId, ItemCreation itemCreation)
    {
        var id = await _service.CreateItem(headerId, itemCreation);

        return Ok(id);
    }

    [HttpDelete("{headerId}")]
    public async Task<ActionResult> DeleteHeader(Guid headerId)
    {
        await _service.DeleteHeader(headerId);

        return Ok();
    }

    [HttpGet("{headerId}")]
    public async Task<ActionResult<Header>> GetListHeaderAsync(string headerId)
    {
        var listHeader = await _service.GetHeader(headerId);

        return Ok(listHeader);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Header>>> GetListHeadersAsync()
    {
        var listHeaders = await _service.GetHeaders();

        return Ok(listHeaders);
    }

    [HttpPatch("{headerId}")]
    public async Task<ActionResult<Header>> PatchHeader(Guid headerId, HeaderPatch headerPatch)
    {
        await _service.PatchHeader(headerId, headerPatch);

        return Ok();
    }

    [HttpPut("{headerId}")]
    public async Task<ActionResult> PutListHeader(Guid headerId, HeaderPut headerPut)
    {
        await _service.PutHeader(headerId, headerPut);

        return Ok();
    }

    [HttpPost("{headerId}/relocate")]
    public async Task<ActionResult> RelocateListHeaderAsync(Guid headerId, HeaderRelocation listHeaderRelocation)
    {
        await _service.RelocateHeader(headerId, listHeaderRelocation.Order);

        return Ok();
    }

    [HttpPost("{headerId}/restore")]
    public async Task<ActionResult> RestoreListHeaderAsync(Guid headerId, HeaderRestoral? headerRestoral)
    {
        await _service.RestoreHeader(headerId, headerRestoral?.Order);

        return Ok();
    }
}
