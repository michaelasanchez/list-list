using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Result;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[ApiController]
[Route("api/share")]
public class ShareController(IShareService service) : Controller
{
    [HttpPost("{listHeaderId}")]
    public async Task<IActionResult> ShareList([FromRoute] Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        ShareResult? result;

        try
        {
            result = new ShareResult
            {
                Path = await service.ShareList(listHeaderId, listHeaderShare)
            };
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(result);
    }
}
