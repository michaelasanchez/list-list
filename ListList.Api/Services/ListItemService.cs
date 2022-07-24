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

        public async Task<IEnumerable<ListItem>> GetListItemsAsync()
        {
            var userId = await _userService.GetUserIdAsync();

            var listItems = await _listItemRepository.GetListItemAsync(userId);

            return _listItemMapper.Map(listItems);
        }
    }
}
