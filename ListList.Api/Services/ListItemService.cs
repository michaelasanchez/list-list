using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Guards.Interfaces;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services;

public class ListItemService(
    IUnitOfWork _unitOfWork,
    IUserService _userService,
    IMapper _mapper,
    IGuard _guard) : IListItemService
{
    private readonly IListItemRepository _listItemRepository = _unitOfWork.ListItemRepository;

    public async Task CompleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemCompleteAsync(userId, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        await _listItemRepository.CompleteListItemAsync(listItemId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<Guid> CreateListHeaderAsync(ListItemCreation listHeader)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = _guard.AgainstInvalidListHeaderCreation(userId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var creation = _mapper.Map<ListHeaderEntity>(listHeader);

        await _listItemRepository.CreateListHeaderAsync(userId.Value, creation);

        await _unitOfWork.SaveChangesAsync();

        return creation.Id;
    }

    public async Task<Guid> CreateListItemAsync(ListItemCreation listItem, Guid parentId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemCreationAsync(userId, parentId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var creation = _mapper.Map<ListItemEntity>(listItem);

        await _listItemRepository.CreateListItemAsync(creation, parentId);

        await _unitOfWork.SaveChangesAsync();

        return creation.Id;
    }

    public async Task DeleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemDeleteAsync(userId.Value, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        await _listItemRepository.DeleteListItemAsync(listItemId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<ListHeader>> GetListHeadersAsync()
    {
        var userId = await _userService.GetUserIdAsync();

        var listHeaders = await _listItemRepository.GetListHeadersAsync(userId.Value);

        return _mapper.Map<IEnumerable<ListHeader>>(listHeaders);
    }

    public async Task<ListItem> GetListItemByIdAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemGetAsync(userId.Value, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var listItem = await _listItemRepository.GetListItemByIdAsync(listItemId);

        return _mapper.Map<ListItem>(listItem);
    }

    public async Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemPutAsync(userId.Value, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var entityPut = _mapper.Map<ListItemEntity>(listItemPut);

        await _listItemRepository.PutListItemAsync(listItemId, entityPut);

        await _unitOfWork.SaveChangesAsync();
    }
}
