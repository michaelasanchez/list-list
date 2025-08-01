using ListList.Api.Contracts.Post;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services;

public class ShareService(
    IUnitOfWork _unitOfWork,
    IUserService _userService,
    IGuard _guard) : BaseService, IShareService
{
    private readonly IShareRepository _shareRepository = _unitOfWork.ShareRepository;

    public async Task<string> ShareList(Guid listHeaderId, ListHeaderShare listHeaderShare)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListShare(userId, listHeaderId, listHeaderShare));

        return await _shareRepository.ShareList(listHeaderId, listHeaderShare.Permission, listHeaderShare.Token, listHeaderShare.ExpiresOn);
    }
}
