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
    public async Task<ActionResult<Header>> GetListHeaderAsync(string headerId)
    {
        Header listHeader;

        try
        {
            listHeader = await _service.GetListHeader(headerId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(listHeader);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Header>>> GetListHeadersAsync()
    {
        IEnumerable<Header> listHeaders;

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

    [HttpPatch("{headerId}")]
    public async Task<ActionResult<Header>> PatchHeader(Guid headerId, HeaderPatch headerPatch)
    {
        try
        {
            await _service.PatchHeader(headerId, headerPatch);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPut("{headerId}")]
    public async Task<ActionResult> PutListHeader(Guid headerId, HeaderPut listHeaderPut)
    {
        try
        {
            await _service.PutHeader(headerId, listHeaderPut);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPost("{headerId}/relocate")]
    public async Task<ActionResult> RelocateListHeaderAsync(Guid headerId, ListHeaderRelocation listHeaderRelocation)
    {
        try
        {
            await _service.RelocateListHeader(headerId, listHeaderRelocation.Order);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }
}
