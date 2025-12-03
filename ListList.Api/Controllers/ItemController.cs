using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api")]
public class ItemController(IItemService _service) : Controller
{
    [HttpPost("{token}/item/{itemId}/complete")]
    public async Task<ActionResult> CompleteItem(string token, Guid itemId)
    {
        await _service.CompleteListItemAsync(token, itemId);

        return Ok();
    }

    [HttpDelete("{token}/item/{itemId}")]
    public async Task<ActionResult> DeleteItem(string token, Guid itemId)
    {
        await _service.DeleteListItemAsync(token, itemId);

        return Ok();
    }

    [HttpGet("{token}/item/{itemId}")]
    public async Task<ActionResult<Item>> GetItemById(string token, Guid itemId)
    {
        var listItem = await _service.GetItemById(token, itemId);

        return Ok(listItem);
    }

    [HttpPatch("{token}/item/{itemId}")]
    public async Task<ActionResult> PatchItem(string token, Guid itemId, ItemPatch itemPatch, [FromQuery] bool? recursive)
    {
        await _service.PatchItemAsync(token, itemId, itemPatch, recursive);

        return Ok();
    }

    [HttpPut("{token}/item/{itemId}")]
    public async Task<ActionResult> PutItem(string token, Guid itemId, ItemPut listItemPut)
    {
        await _service.PutListItemAsync(token, itemId, listItemPut);

        return Ok();
    }

    [HttpPost("{token}/item/{activeId}/relocate")]
    public async Task<IActionResult> RelocateItem(string token, Guid activeId, ItemRelocation listItemRelocation)
    {
        await _service.RelocateListItemAsync(token, activeId, listItemRelocation.OverId, listItemRelocation.ParentId);

        return Ok();
    }

    [HttpPost("{token}/item/{itemId}/restore")]
    public async Task<ActionResult> RestoreItem(string token, Guid itemId, ItemRestoral? itemRestoral)
    {
        await _service.RestoreListItemAsync(token, itemId, itemRestoral?.OverId, itemRestoral?.ParentId);

        return Ok();
    }
}
