using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
	[Route("api/[controller]")]
public class ListItemController(IListItemService _service) : Controller
{
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateListHeaderAsync(ListItemCreation creation)
    {
        Guid id;

        try
        {
            id = await _service.CreateListHeaderAsync(creation);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(id);
    }

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

    [HttpPost("complete/{listItemId}")]
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListHeader>>> GetListHeadersAsync()
    {
        IEnumerable<ListHeader> listHeaders;

        try
        {
            listHeaders = await _service.GetListHeadersAsync();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listHeaders);
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
