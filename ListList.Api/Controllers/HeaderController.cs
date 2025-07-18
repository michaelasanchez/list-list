using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/header")]
public class HeaderController(IHeaderService _service) : Controller
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

    [HttpGet("{headerId}")]
    public async Task<ActionResult<ListHeader>> GetListHeaderByIdAsync(Guid headerId)
    {
        ListHeader listHeader;

        try
        {
            listHeader = await _service.GetListHeaderByIdAsync(headerId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listHeader);
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

    [HttpPost("{listHeaderId}/relocate")]
    public async Task<ActionResult> RelocateListHeaderAsync(Guid listHeaderId, ListHeaderRelocation listHeaderRelocation)
    {
        try
        {
            await _service.RelocateListHeaderAsync(listHeaderId, listHeaderRelocation.Index);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }
}
