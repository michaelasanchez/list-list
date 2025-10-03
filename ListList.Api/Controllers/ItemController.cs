using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/item")]
public class ItemController(IItemService _service) : Controller
{
    [HttpPost("{itemId}/complete")]
    public async Task<ActionResult> CompleteItem(Guid itemId)
    {
        await _service.CompleteListItemAsync(itemId);

        return Ok();
    }

    [HttpDelete("{itemId}")]
    public async Task<ActionResult> DeleteItem([FromRoute] Guid itemId)
    {
        await _service.DeleteListItemAsync(itemId);

        return Ok();
    }

    [HttpGet("{itemId}")]
    public async Task<ActionResult<Item>> GetItemById([FromRoute] Guid itemId)
    {
        var listItem = await _service.GetItemById(itemId);

        return Ok(listItem);
    }

    [HttpPatch("{itemId}")]
    public async Task<ActionResult> PatchItem(Guid itemId, ItemPatch itemPatch, [FromQuery] bool? recursive)
    {
        await _service.PatchItemAsync(itemId, itemPatch, recursive);

        return Ok();
    }

    [HttpPut("{itemId}")]
    public async Task<ActionResult> PutItem(Guid itemId, ItemPut listItemPut)
    {
        await _service.PutListItemAsync(itemId, listItemPut);

        return Ok();
    }

    [HttpPost("{activeId}/relocate")]
    public async Task<IActionResult> RelocateItem(Guid activeId, ItemRelocation listItemRelocation)
    {
        await _service.RelocateListItemAsync(activeId, listItemRelocation.OverId, listItemRelocation.ParentId);

        return Ok();
    }

    [HttpPost("{itemId}/restore")]
    public async Task<ActionResult> RestoreItem(Guid itemId, ItemRestoral? itemRestoral)
    {
        await _service.RestoreListItemAsync(itemId, itemRestoral?.OverId, itemRestoral?.ParentId);

        return Ok();
    }
}
