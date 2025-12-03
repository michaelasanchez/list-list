using AutoMapper;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services;

public class ShareService(
    IUnitOfWork _unitOfWork,
    IUserService _userService,
    IMapper _mapper,
    IGuard _guard) : BaseService, IShareService
{
    private readonly IShareRepository _shareRepository = _unitOfWork.ShareRepository;

    public async Task DeleteLink(Guid shareLinkId)
    {
        var userId = _userService.GetUserId().Result;

        await InvokeGuard(() => _guard.AgainstInvalidShareLinkDelete(userId, shareLinkId));

        await _shareRepository.DeleteLink(shareLinkId);
    }

    public async Task PutLink(Guid linkId, ShareLinkPut put)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidShareLinkPut(userId, linkId, put));

        var resource = _mapper.Map<ShareLinkResource>(put);

        await _shareRepository.PutLink(linkId, resource);
    }

    public async Task<string> ShareHeader(string token, HeaderShare listHeaderShare)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidShare(userId, token, listHeaderShare));

        return await _shareRepository.ShareList(token, listHeaderShare.Permission, listHeaderShare.Token, listHeaderShare.ExpiresOn);
    }
}
