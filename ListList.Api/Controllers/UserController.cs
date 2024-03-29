﻿using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController(IUserService _userService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiToken?>> Login(AuthorizationCode authorizationCode)
    {
        ApiToken? token;

        try
        {
            token = await _userService.LoginAsync(authorizationCode.Code);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(token);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiToken?>> Refresh(RefreshToken refreshToken)
    {
        ApiToken? token;

        try
        {
            token = await _userService.RefreshAsync(refreshToken.Token);
        }
        catch (Exception ex)
        {

            return BadRequest(ex.Message);
        }

        return Ok(token);
    }
}
