using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Contracts.Result;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/share")]
public class ShareController(IShareService service) : Controller
{
    [HttpDelete("{shareLinkId}")]
    public async Task<IActionResult> DeleteLink([FromRoute] Guid shareLinkId)
    {
        try
        {
            await service.DeleteLink(shareLinkId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPut("{shareLinkId}")]
    public async Task<IActionResult> PutLink([FromRoute] Guid shareLinkId, [FromBody] ShareLinkPut patch)
    {
        try
        {
            await service.PutLink(shareLinkId, patch);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok();
    }

    [HttpPost("{listHeaderId}")]
    public async Task<IActionResult> ShareHeader([FromRoute] Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        ShareResult? result;

        try
        {
            result = new ShareResult
            {
                Path = await service.ShareHeader(listHeaderId, listHeaderShare)
            };
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(result);
    }
}
