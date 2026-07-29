using Auth.Services.Interfaces;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ListList.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController(
    ITokenService _tokenService,
    ICurrentUserService _currentUserService,
    IUserService _userService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] string code)
    {
        var user = await _userService.Login(code);

        // 1. Create the identity
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Subject),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

        // 2. Issue the cookie
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            new AuthenticationProperties { IsPersistent = true }
        );

        return Ok(new { user.Name, user.PictureUrl, user.Email });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        // This clears the 'Tendril.Auth' cookie from the browser
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Ok(new { Message = "Logged out successfully" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        // 1. Get the 'sub' (Google ID) from the current logged-in user claims
        var subject = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(subject)) return Unauthorized();

        // 2. Fetch the user from your DB
        var user = await _userService.GetUserBySubject(subject);

        if (user == null) return NotFound();

        // 3. Return the profile info React needs to display the UI
        return Ok(new { user.Name, user.PictureUrl, user.Email });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var googleSub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(googleSub)) return Unauthorized();

        var user = await _userService.GetUserBySubject(googleSub);

        // 4. Use the RefreshToken stored in your DB
        if (string.IsNullOrEmpty(user?.RefreshToken)) return BadRequest("No refresh token available.");

        try
        {
            var tokenResponse = await _tokenService.RefreshTokenAsync(user.RefreshToken);

            // 5. Google might send a NEW refresh token; if so, update the DB
            if (user?.Id is not null && !string.IsNullOrEmpty(tokenResponse.RefreshToken))
            {
                await _userService.UpdateRefreshToken(user.Id.Value, tokenResponse.RefreshToken);
            }

            return Ok(new { Message = "Token refreshed successfully" });
        }
        catch (Exception)
        {
            return Unauthorized("Session expired, please login again.");
        }
    }
}
