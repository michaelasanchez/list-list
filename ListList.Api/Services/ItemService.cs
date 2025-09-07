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

public class ItemService(IUnitOfWork _unitOfWork, IUserService _userService, IMapper _mapper, IGuard _guard) : BaseService, IItemService
{
    private readonly IItemRepository _listItemRepository = _unitOfWork.ItemRepository;

    public async Task CompleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidItemComplete(userId, listItemId));

        await _listItemRepository.CompleteListItem(listItemId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<Guid> CreateListItemAsync(ListItemCreation listItem, Guid parentId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemCreationAsync(userId, parentId));

        var creation = _mapper.Map<ItemEntity>(listItem);

        await _listItemRepository.CreateListItem(creation, parentId);

        return creation.Id;
    }

    public async Task DeleteListItemAsync(Guid listItemId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemDeleteAsync(userId, listItemId));

        await _listItemRepository.DeleteListItem(listItemId);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<Item> GetItemById(Guid listItemId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListGet(userId, listItemId));

        var listItem = await _listItemRepository.GetItemById(listItemId);

        return _mapper.Map<Item>(listItem);
    }

    public async Task PatchItemAsync(Guid listItemId, ItemPatch itemPatch, bool? recursive)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemPatchAsync(userId, listItemId));

        var resource = _mapper.Map<ItemResource>(itemPatch);

        await _listItemRepository.PatchListItem(listItemId, resource, recursive);
    }

    public async Task PutListItemAsync(Guid listItemId, ItemPut listItemPut)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemPutAsync(userId, listItemId));

        var entityPut = _mapper.Map<ItemEntity>(listItemPut);

        await _listItemRepository.PutListItem(listItemId, entityPut);
    }

    public async Task RelocateListItemAsync(Guid activeId, Guid overId, Guid? parentId)
    {
        var userId = await _userService.GetUserId();

        await InvokeGuard(() => _guard.AgainstInvalidListItemRelocation(userId, activeId, parentId));

        await _listItemRepository.RelocateListItem(activeId, overId, parentId);
    }
}
