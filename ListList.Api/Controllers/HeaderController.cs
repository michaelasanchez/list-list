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

    [HttpPost("{token}")]
    public async Task<ActionResult<Guid>> CreateItem(string token, ItemCreation itemCreation)
    {
        var id = await _service.CreateItem(token, itemCreation);

        return Ok(id);
    }

    [HttpDelete("{token}")]
    public async Task<ActionResult> DeleteHeader(string token)
    {
        await _service.DeleteHeader(token);

        return Ok();
    }

    [HttpGet("{token}")]
    public async Task<ActionResult<Header>> GetListHeaderAsync(string token)
    {
        var listHeader = await _service.GetHeader(token);

        return Ok(listHeader);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Header>>> GetListHeadersAsync()
    {
        var listHeaders = await _service.GetHeaders();

        return Ok(listHeaders);
    }

    [HttpPatch("{token}")]
    public async Task<ActionResult<Header>> PatchHeader(string token, HeaderPatch headerPatch)
    {
        await _service.PatchHeader(token, headerPatch);

        return Ok();
    }

    [HttpPut("{token}")]
    public async Task<ActionResult> PutListHeader(string token, HeaderPut headerPut)
    {
        await _service.PutHeader(token, headerPut);

        return Ok();
    }

    [HttpPost("{token}/relocate")]
    public async Task<ActionResult> RelocateListHeaderAsync(string token, HeaderRelocation listHeaderRelocation)
    {
        await _service.RelocateHeader(token, listHeaderRelocation.Order);

        return Ok();
    }

    [HttpPost("{token}/restore")]
    public async Task<ActionResult> RestoreListHeaderAsync(string token, HeaderRestoral? headerRestoral)
    {
        await _service.RestoreHeader(token, headerRestoral?.Order);

        return Ok();
    }
}
