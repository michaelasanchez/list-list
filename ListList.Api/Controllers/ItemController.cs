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
        try
        {
            await _service.CompleteListItemAsync(itemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpDelete("{itemId}")]
    public async Task<ActionResult> DeleteItem([FromRoute] Guid itemId)
    {
        try
        {
            await _service.DeleteListItemAsync(itemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpGet("{itemId}")]
    public async Task<ActionResult<Item>> GetItemById([FromRoute] Guid itemId)
    {
        Item listItem;

        try
        {
            listItem = await _service.GetItemById(itemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listItem);
    }

    [HttpPatch("{itemId}")]
    public async Task<ActionResult> PatchItem(Guid itemId, ItemPatch itemPatch, [FromQuery] bool? recursive)
    {
        try
        {
            await _service.PatchItemAsync(itemId, itemPatch, recursive);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        return Ok();
    }

    [HttpPut("{itemId}")]
    public async Task<ActionResult> PutItem(Guid itemId, ItemPut listItemPut)
    {
        try
        {
            await _service.PutListItemAsync(itemId, listItemPut);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPost("{activeId}/relocate")]
    public async Task<IActionResult> RelocateItem(Guid activeId, ItemRelocation listItemRelocation)
    {
        try
        {
            await _service.RelocateListItemAsync(activeId, listItemRelocation.OverId, listItemRelocation.ParentId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPost("{itemId}/restore")]
    public async Task<ActionResult> RestoreItem(Guid itemId, ItemRestoral? itemRestoral)
    {
        try
        {
            await _service.RestoreListItemAsync(itemId, itemRestoral?.OverId, itemRestoral?.ParentId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }
}
