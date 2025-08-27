using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services;

public class HeaderService(
    IUnitOfWork _unitOfWork,
    IUserService _userService,
    IMapper _mapper,
    IGuard _guard) : BaseService, IHeaderService
{
    private readonly IHeaderRepository _listHeaderRepository = _unitOfWork.HeaderRepository;

    public async Task<Guid> CreateHeader(ListHeaderCreation listHeader)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListHeaderCreation(userId));

        var creation = _mapper.Map<HeaderEntity>(listHeader);

        await _listHeaderRepository.CreateHeader(userId.Value, creation);

        return creation.Id;
    }

    public async Task<Guid> CreateItem(Guid headerId, ListItemCreation itemCreation)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListItemCreationAsync(userId, headerId));

        var creation = _mapper.Map<ItemEntity>(itemCreation);

        await _unitOfWork.ItemRepository.CreateListItem(creation, headerId);

        return creation.Id;
    }

    public async Task<Header> GetHeader(string token)
    {
        var userId = await _userService.GetUserIdAsync();

        if (Guid.TryParse(token, out var listHeaderId))
        {
            await InvokeGuard(() => _guard.AgainstInvalidListHeaderGetAsync(userId, listHeaderId));

        }

        var listHeader = listHeaderId == default
            ? await _listHeaderRepository.GetHeaderByToken(token)
            : await _listHeaderRepository.GetHeaderById(userId, listHeaderId);

        return _mapper.Map<Header>(listHeader);
    }

    public Task<Header> GetListHeaderByToken(string token)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<Header>> GetHeaders()
    {
        var userId = await _userService.GetUserIdAsync();

        var listHeaders = await _listHeaderRepository.GetHeaders(userId);

        return _mapper.Map<IEnumerable<Header>>(listHeaders);
    }

    public async Task PatchHeader(Guid headerId, HeaderPatch headerPatch)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListHeaderPatch(userId, headerId, headerPatch));

        var resource = _mapper.Map<HeaderResource>(headerPatch);

        await _listHeaderRepository.PatchHeader(headerId, resource);
    }

    public async Task PutHeader(Guid listHeaderId, HeaderPut listHeaderPut)
    {
        var entityUpdate = _mapper.Map<HeaderEntity>(listHeaderPut);

        await _listHeaderRepository.PutHeader(listHeaderId, entityUpdate);
    }

    public async Task RelocateHeader(Guid listHeaderId, int index)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListHeaderRelocationAsync(userId, listHeaderId, index));

        await _listHeaderRepository.RelocateHeader(userId.Value, listHeaderId, index);
    }
}
