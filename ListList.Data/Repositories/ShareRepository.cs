using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Enums;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Data.Repositories;
public class ShareRepository(ListListContext context) : IShareRepository
{
    public Task DeleteLink(Guid shareLinkId)
    {
        var entity = new ShareLinkEntity { Id = shareLinkId };

        context.ShareLinks.Attach(entity);
        context.ShareLinks.Remove(entity);

        return context.SaveChangesAsync();
    }

    public async Task PutLink(Guid shareLinkId, ShareLinkResource resource)
    {
        var entity = await context.ShareLinks.FindAsync(shareLinkId);

        if (entity is not null)
        {
            entity.Permission = resource.Permission;
            entity.ExpiresOn = resource.ExpiresOn?.ToUniversalTime();

            context.ShareLinks.Update(entity);

            await context.SaveChangesAsync();
        }
    }

    public async Task<string> ShareList(Guid headerId, SharedPermission permission, string? token, DateTimeOffset? expireOn)
    {
        var share = new ShareLinkEntity
        {
            HeaderId = headerId,
            Permission = permission,
            Token = token ?? GenerateToken(),
            ExpiresOn = expireOn?.ToUniversalTime()
        };

        await context.ShareLinks.AddAsync(share);
        await context.SaveChangesAsync();

        return share.Token;
    }

    private static string GenerateToken() => Guid.NewGuid().ToString("N");
}
