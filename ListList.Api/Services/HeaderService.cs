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

namespace ListList.Api.Services;

public class HeaderService(
    IUnitOfWork _unitOfWork,
    IUserService _userService,
    IMapper _mapper,
    IGuard _guard) : BaseService, IHeaderService
{
    public async Task<Guid> CreateHeader(HeaderCreation listHeader, int? order)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderCreation(userId, order));

        var creation = _mapper.Map<HeaderEntity>(listHeader);

        await _unitOfWork.HeaderRepository.CreateHeader(userId.Value, creation, order);

        return creation.Id;
    }

    public async Task<Guid> CreateItem(string token, ItemCreation creation)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidItemCreation(userId, token));

        var resource = _mapper.Map<ItemResource>(creation);

        return await _unitOfWork.ItemRepository.CreateListItem(resource, token, creation.OverId, creation.ParentId);
    }

    public async Task DeleteHeader(string token)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderDelete(userId, token));

        await _unitOfWork.HeaderRepository.DeleteHeader(token);
    }

    public async Task<Header> GetHeader(string token)
    {
        var userId = await _userService.GetUserId();

        if (Guid.TryParse(token, out var headerId))
        {
            await InvokeGuard(() => _guard.AgainstInvalidHeaderGet(userId, token));

        }

        var header = await _unitOfWork.HeaderRepository.GetHeader(userId, token);

        return _mapper.Map<Header>(header);
    }

    public async Task<IEnumerable<Header>> GetHeaders()
    {
        var userId = await _userService.GetUserId();

        var listHeaders = await _unitOfWork.HeaderRepository.GetHeaders(userId);

        return _mapper.Map<IEnumerable<Header>>(listHeaders);
    }

    public async Task PatchHeader(string token, HeaderPatch headerPatch)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderPatch(userId, token, headerPatch));

        var resource = _mapper.Map<HeaderResource>(headerPatch);

        await _unitOfWork.HeaderRepository.PatchHeader(token, resource);
    }

    public async Task PutHeader(string token, HeaderPut listHeaderPut)
    {
        var entityUpdate = _mapper.Map<HeaderEntity>(listHeaderPut);

        await _unitOfWork.HeaderRepository.PutHeader(token, entityUpdate);
    }

    public async Task RelocateHeader(string token, int index)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderRelocation(userId, token, index));

        await _unitOfWork.HeaderRepository.RelocateHeader(userId.Value, token, index);
    }

    public async Task RestoreHeader(string token, int? order)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidHeaderRestoral(userId, token, order));

        await _unitOfWork.HeaderRepository.RestoreHeader(userId.Value, token, order);
    }
}
