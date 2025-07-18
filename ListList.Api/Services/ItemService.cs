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

public class ItemService(IUnitOfWork _unitOfWork, IUserService _userService, IMapper _mapper, IGuard _guard) : BaseService, IItemService
{
    private readonly IItemRepository _listItemRepository = _unitOfWork.ListItemRepository;

    public async Task CompleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListItemCompleteAsync(userId, listItemId));

        await _listItemRepository.CompleteListItem(listItemId);

        await _unitOfWork.SaveChangesAsync();
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

        await _listItemRepository.CreateListItem(creation, parentId);

        await _unitOfWork.SaveChangesAsync();

        return creation.Id;
    }

    public async Task DeleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemDeleteAsync(userId, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        await _listItemRepository.DeleteListItem(listItemId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<ListItem> GetListItemByIdAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemGetAsync(userId, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var listItem = await _listItemRepository.GetListItemById(listItemId);

        return _mapper.Map<ListItem>(listItem);
    }

    public async Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListItemPutAsync(userId, listItemId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var entityPut = _mapper.Map<ListItemEntity>(listItemPut);

        await _listItemRepository.PutListItem(listItemId, entityPut);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RelocateListItemAsync(Guid activeId, Guid overId, Guid parentId)
    {
        var userId = await _userService.GetUserIdAsync();

        await InvokeGuard(() => _guard.AgainstInvalidListItemRelocation(userId, activeId, parentId));

        await _listItemRepository.RelocateListItem(activeId, overId, parentId);
    }
}
