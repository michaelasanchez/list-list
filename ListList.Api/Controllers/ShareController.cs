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

    [HttpPost("{token}")]
    public async Task<IActionResult> ShareHeader([FromRoute] string token, HeaderShare listHeaderShare)
    {
        var result = new ShareResult
        {
            Path = await service.ShareHeader(token, listHeaderShare)
        };

        return Ok(result);
    }
}
