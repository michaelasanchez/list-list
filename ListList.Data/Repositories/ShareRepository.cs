using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Enums;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Data.Repositories;
public class ShareRepository(ListListContext context) : BaseRepository(context, null), IShareRepository
{
    public Task DeleteLink(Guid shareLinkId)
    {
        var entity = new ShareLinkEntity { Id = shareLinkId };

        _context.ShareLinks.Attach(entity);
        _context.ShareLinks.Remove(entity);

        return context.SaveChangesAsync();
    }

    public async Task PutLink(Guid shareLinkId, ShareLinkResource resource)
    {
        var entity = await _context.ShareLinks.FindAsync(shareLinkId);

        if (entity is not null)
        {
            entity.Token = resource.Token ?? string.Empty;
            entity.Permission = resource.Permission;
            entity.ExpiresOn = resource.ExpiresOn?.ToUniversalTime();

            _context.ShareLinks.Update(entity);

            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> ShareList(string token, SharedPermission permission, string? newToken, DateTimeOffset? expireOn)
    {
        var share = new ShareLinkEntity
        {
            HeaderId = await GetHeaderId(token),
            Permission = permission,
            Token = newToken ?? GenerateToken(),
            ExpiresOn = expireOn?.ToUniversalTime()
        };

        await _context.ShareLinks.AddAsync(share);
        await _context.SaveChangesAsync();

        return share.Token;
    }

    private static string GenerateToken() => Guid.NewGuid().ToString("N");
}
