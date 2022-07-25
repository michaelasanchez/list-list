using ListList.Api.Mappers.Interfaces;
using ListList.Api.Models;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services
{
    public class ListItemService : IListItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly IListItemMapper _listItemMapper;

        private readonly IUserService _userService;

        private readonly IListItemRepository _listItemRepository;

        public ListItemService(IUnitOfWork unitOfWork, IUserService userService, IListItemMapper listItemMapper)
        {
            _unitOfWork = unitOfWork;

            _listItemMapper = listItemMapper;

            _userService = userService;

            _listItemRepository = unitOfWork.ListItemRepository;
        }

        public async Task<Guid> CreateListItemAsync(ListItem listItem, Guid? parentId)
        {
            var userId = await _userService.GetUserIdAsync();

            var userNode = await _listItemRepository.GetOrCreateUserNodeAsync(userId);

            await _unitOfWork.SaveChangesAsync();

            var creation = _listItemMapper.ToDb(listItem);

            await _listItemRepository.CreateListItemAsync(userNode, creation, parentId);

            await _unitOfWork.SaveChangesAsync();

            return creation.Id;
        }

        public async Task<ListItem> GetListItemByIdAsync(Guid listItemId)
        {
            var userId = await _userService.GetUserIdAsync();

            var listItems = await _listItemRepository.GetListItemByIdAsync(userId, listItemId);

            return _listItemMapper.ToApi(listItems);
        }

        public async Task<IEnumerable<ListItem>> GetListItemsAsync()
        {
            var userId = await _userService.GetUserIdAsync();

            var listItems = await _listItemRepository.GetListItemsAsync(userId);

            return _listItemMapper.ToApi(listItems);
        }
    }
}
