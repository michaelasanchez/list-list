using ListList.Data.Models;
using ListList.Data.Models.Enums;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class HeaderValidator(IListListContext _context) : IHeaderValidator
{
    //public Task CanCreate(Guid? userId, Guid token, ValidationResult result)
    //{
    //    if (userId is null)
    //    {
    //        result.AddError("User must be logged in.");
    //    }


    //}

    public async Task CanUpdate(Guid? userId, string token, ValidationResult result)
    {
        if (!await HasPermission(userId, token, SharedPermission.Edit))
        {
            result.AddError($"The {nameof(token)} '{token}' is invalid.");
        }
    }

    public async Task CanView(Guid? userId, string token, ValidationResult result)
    {
        if (!await HasPermission(userId, token, SharedPermission.View))
        {
            result.AddError($"The {nameof(token)} '{token}' is invalid.");
        }
    }

    public async Task IsDeleted(string token, ValidationResult result)
    {
        var isDeleted = Guid.TryParse(token, out var headerId)
                ? await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        (
                            z.Id == headerId ||
                            z.ShareLinks.Any(y => y.Token == token)
                        ) &&
                        z.Deleted)
                : await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        z.ShareLinks.Any(y => y.Token == token) &&
                        z.Deleted);

        if (!isDeleted)
        {
            result.AddError($"The {nameof(token)} '{token}' is not deleted.");
        }
    }

    public async Task IsNotDeleted(string token, ValidationResult result)
    {
        var isDeleted = Guid.TryParse(token, out var headerId)
                ? await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        (
                            z.Id == headerId ||
                            z.ShareLinks.Any(y => y.Token == token)
                        ) &&
                        z.Deleted)
                : await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        z.ShareLinks.Any(y => y.Token == token) &&
                        z.Deleted);

        if (isDeleted)
        {
            result.AddError($"The {nameof(token)} '{token}' is deleted.");
        }
    }

    public async Task IsValidIndex(Guid? userId, int? index, ValidationResult result)
    {
        var isValidIndex = index >= 0 &&
            index <= await _context.Headers
                .CountAsync(z => z.OwnerId == userId && !z.Deleted);

        if (!isValidIndex)
        {
            result.AddError($"The {nameof(index)} '{index}' is invalid.");
        }
    }

    public async Task IsValidToken(string token, ValidationResult result)
    {
        var tokenExists = Guid.TryParse(token, out var headerId)
            ? await _context.Headers
                .Include(z => z.ShareLinks)
                .AnyAsync(z =>
                    z.Id == headerId ||
                    z.ShareLinks.Any(y => y.Token == token))
            : await _context.ShareLinks
                .AnyAsync(z => z.Token == token);

        if (tokenExists)
        {
            result.AddError($"The {nameof(token)} '{token}' is invalid.");
        }
    }

    public async Task IsOwnedByUser(Guid? userId, string token, ValidationResult result)
    {
        var userHasAccess = !userId.HasValue
            ? false
            : Guid.TryParse(token, out var headerId)
                ? await _context.Headers
                    .AnyAsync(z =>
                        z.Id == headerId &&
                        z.OwnerId == userId)
                : await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        z.ShareLinks.Any(y => y.Token == token) &&
                        z.OwnerId == userId);

        if (!userHasAccess)
        {
            result.AddError($"The {nameof(token)} '{token}' is invalid.");
        }
    }

    private async Task<bool> HasPermission(Guid? userId, string token, SharedPermission permission)
    {
        if (userId.HasValue)
        {
            if (Guid.TryParse(token, out var headerId))
            {
                return await _context.Headers
                    .Include(z => z.ShareLinks)
                    .AnyAsync(z =>
                        // User owns the header
                        (
                            z.Id == headerId &&
                            z.OwnerId == userId
                        ) ||
                        // User has valid share link
                        (
                            z.ShareLinks
                                .Any(y =>
                                    y.Token == token &&
                                    y.Permission == permission &&
                                    (
                                        y.ExpiresOn == null ||
                                        y.ExpiresOn > DateTimeOffset.Now
                                    ))
                        ));
            }
        }

        if (!string.IsNullOrWhiteSpace(token))
        {
            return await _context.ShareLinks
                .AnyAsync(z =>
                    z.Token == token &&
                    z.Permission == permission &&
                    (
                        z.ExpiresOn == null ||
                        z.ExpiresOn > DateTimeOffset.Now
                    ));
        }

        return false;
    }
}
