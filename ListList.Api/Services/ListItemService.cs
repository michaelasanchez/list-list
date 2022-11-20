using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services
{
    public class ListItemService : IListItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IUserService _userService;

        private readonly IListItemRepository _listItemRepository;

        private readonly IMapper _autoMapper;

        public ListItemService(IUnitOfWork unitOfWork, IUserService userService, IMapper autoMapper)
        {
            _unitOfWork = unitOfWork;

            _autoMapper = autoMapper;

            _userService = userService;

            _listItemRepository = unitOfWork.ListItemRepository;
        }

        public async Task<Guid> CreateListItemAsync(ListItemCreation listItem, Guid? parentId)
        {
            var userId = await _userService.GetUserIdAsync();

            var creation = _autoMapper.Map<ListItemEntity>(listItem);

            await _listItemRepository.CreateListItemAsync(userId, creation, parentId);

            await _unitOfWork.SaveChangesAsync();

            return creation.Id;
        }

        public async Task<ListItem> GetListItemByIdAsync(Guid listItemId)
        {
            var userId = await _userService.GetUserIdAsync();

            var listItem = await _listItemRepository.GetListItemByIdAsync(userId, listItemId);

            return _autoMapper.Map<ListItem>(listItem);
        }

        public async Task DeleteListItemAsync(Guid listItemId)
        {
            var userId = await _userService.GetUserIdAsync();
            
            await _listItemRepository.DeleteListItemAsync(userId, listItemId);

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<ListHeader>> GetListItemsAsync()
        {
            var userId = await _userService.GetUserIdAsync();

            var listHeaders = await _listItemRepository.GetListItemsAsync(userId);

            return _autoMapper.Map<IEnumerable<ListHeader>>(listHeaders);
        }

        public async Task CompleteListItemAsync(Guid listItemId)
        {
            //var userId = await _userService.GetUserIdAsync();

            await _listItemRepository.CompleteListItemAsync(listItemId);

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task PutListItemAsync(Guid listItemId, ListItemPut listItemPut)
        {
            var userId = await _userService.GetUserIdAsync();

            var entityPut = _autoMapper.Map<ListItemEntity>(listItemPut);

            await _listItemRepository.PutListItemAsync(listItemId, entityPut);

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
