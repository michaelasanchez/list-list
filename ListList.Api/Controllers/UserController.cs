using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController(IUserService _userService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<Token?>> Login(AuthorizationCode authorizationCode)
    {
        var token = await _userService.LoginAsync(authorizationCode.Code);

        return Ok(token);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<Token?>> Refresh(RefreshToken refreshToken)
    {
        var token = await _userService.RefreshAsync(refreshToken.Token);

        return Ok(token);
    }
}
