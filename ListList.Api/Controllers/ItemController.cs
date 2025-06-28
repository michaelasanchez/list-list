using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Contracts.Result;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/item")]
public class ItemController(IItemService _service) : Controller
{
    [HttpPost("{parentId}")]
    public async Task<ActionResult<Guid>> CreateListItemAsync([FromRoute] Guid parentId, ListItemCreation creation)
    {
        Guid id;

        try
        {
            id = await _service.CreateListItemAsync(creation, parentId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(id);
    }

    [HttpPost("{listItemId}/complete")]
    public async Task<ActionResult> CompleteListItemAsync(Guid listItemId)
    {
        try
        {
            await _service.CompleteListItemAsync(listItemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpDelete("{listItemId}")]
    public async Task<ActionResult> DeleteListItemAsync([FromRoute] Guid listItemId)
    {
        try
        {
            await _service.DeleteListItemAsync(listItemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpGet("{listItemId}")]
    public async Task<ActionResult<ListItem>> GetListItemByIdAsync([FromRoute] Guid listItemId)
    {
        ListItem listItem;

        try
        {
            listItem = await _service.GetListItemByIdAsync(listItemId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listItem);
    }

    [HttpPost("{listItemId}/relocate")]
    public async Task<ActionResult> RelocateListItemAsync(Guid listItemId, ListItemRelocation listItemRelocation)
    {
        OperationResult result;

        try
        {
            result = await _service.RelocateListItemAsync(listItemId, listItemRelocation.ParentId, listItemRelocation.RelativeIndex);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(result);
    }

    [HttpPut("{listItemId}")]
    public async Task<ActionResult> PutListItemAsync(Guid listItemId, ListItemPut listItemPut)
    {
        try
        {
            await _service.PutListItemAsync(listItemId, listItemPut);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }
}
