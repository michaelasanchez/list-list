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
    private readonly IHeaderRepository _headerRepository = _unitOfWork.HeaderRepository;

    public async Task<Guid> CreateHeader(ListHeaderCreation listHeader)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderCreation(userId));

        var creation = _mapper.Map<HeaderEntity>(listHeader);

        await _headerRepository.CreateHeader(userId.Value, creation);

        return creation.Id;
    }

    public async Task<Guid> CreateItem(Guid headerId, ListItemCreation itemCreation)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemCreationAsync(userId, headerId));

        var creation = _mapper.Map<ItemEntity>(itemCreation);

        await _unitOfWork.ItemRepository.CreateListItem(creation, headerId);

        return creation.Id;
    }

    public async Task DeleteHeader(Guid headerId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderDelete(userId, headerId));

        await _headerRepository.DeleteHeader(headerId);
    }

    public async Task<Header> GetHeader(string token)
    {
        var userId = await _userService.GetUserId();

        if (Guid.TryParse(token, out var listHeaderId))
        {
            await InvokeGuard(() => _guard.AgainstInvalidHeaderGet(userId, listHeaderId));

        }

        var listHeader = listHeaderId == default
            ? await _headerRepository.GetHeaderByToken(token)
            : await _headerRepository.GetHeaderById(userId, listHeaderId);

        return _mapper.Map<Header>(listHeader);
    }

    public Task<Header> GetListHeaderByToken(string token)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<Header>> GetHeaders()
    {
        var userId = await _userService.GetUserId();

        var listHeaders = await _headerRepository.GetHeaders(userId);

        return _mapper.Map<IEnumerable<Header>>(listHeaders);
    }

    public async Task PatchHeader(Guid headerId, HeaderPatch headerPatch)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderPatch(userId, headerId, headerPatch));

        var resource = _mapper.Map<HeaderResource>(headerPatch);

        await _headerRepository.PatchHeader(headerId, resource);
    }

    public async Task PutHeader(Guid listHeaderId, HeaderPut listHeaderPut)
    {
        var entityUpdate = _mapper.Map<HeaderEntity>(listHeaderPut);

        await _headerRepository.PutHeader(listHeaderId, entityUpdate);
    }

    public async Task RelocateHeader(Guid listHeaderId, int index)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderRelocation(userId, listHeaderId, index));

        await _headerRepository.RelocateHeader(userId.Value, listHeaderId, index);
    }
}
