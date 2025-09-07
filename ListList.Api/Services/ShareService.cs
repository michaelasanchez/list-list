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

    public async Task PutLink(Guid shareLinkId, ShareLinkPut patch)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidShareLinkPatch(userId, shareLinkId, patch));

        var resource = _mapper.Map<ShareLinkResource>(patch);

        await _shareRepository.PutLink(shareLinkId, resource);
    }

    public async Task<string> ShareHeader(Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListShare(userId, listHeaderId, listHeaderShare));

        return await _shareRepository.ShareList(listHeaderId, listHeaderShare.Permission, listHeaderShare.Token, listHeaderShare.ExpiresOn);
    }
}
