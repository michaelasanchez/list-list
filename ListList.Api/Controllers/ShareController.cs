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
        await service.DeleteLink(shareLinkId);

        return Ok();
    }

    [HttpPut("{shareLinkId}")]
    public async Task<IActionResult> PutLink([FromRoute] Guid shareLinkId, [FromBody] ShareLinkPut patch)
    {
        await service.PutLink(shareLinkId, patch);

        return Ok();
    }

    [HttpPost("{listHeaderId}")]
    public async Task<IActionResult> ShareHeader([FromRoute] Guid listHeaderId, HeaderShare listHeaderShare)
    {
        var result = new ShareResult
        {
            Path = await service.ShareHeader(listHeaderId, listHeaderShare)
        };

        return Ok(result);
    }
}
