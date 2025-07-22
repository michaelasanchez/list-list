using ListList.Api.Contracts;
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
    public async Task<ActionResult<Guid>> CreateListHeaderAsync(ListHeaderCreation creation)
    {
        Guid id;

        try
        {
            id = await _service.CreateListHeader(creation);
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
            listHeader = await _service.GetListHeaderById(headerId);
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
            listHeaders = await _service.GetListHeaders();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listHeaders);
    }

    [HttpPut("{listHeaderId}")]
    public async Task<ActionResult> PutListHeader(Guid listHeaderId, ListHeaderPut listHeaderPut)
    {
        try
        {
            await _service.PutListHeader(listHeaderId, listHeaderPut);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPost("{listHeaderId}/relocate")]
    public async Task<ActionResult> RelocateListHeaderAsync(Guid listHeaderId, ListHeaderRelocation listHeaderRelocation)
    {
        try
        {
            await _service.RelocateListHeader(listHeaderId, listHeaderRelocation.Order);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }
}
