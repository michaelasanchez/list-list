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

public class HeaderService(IUnitOfWork _unitOfWork, IUserService _userService, IMapper _mapper, IGuard _guard) : IHeaderService
{
    private readonly IHeaderRepository _listHeaderRepository = _unitOfWork.ListHeaderRepository;

    public async Task<Guid> CreateListHeaderAsync(ListItemCreation listHeader)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListHeaderCreation(userId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var creation = _mapper.Map<ListHeaderEntity>(listHeader);

        await _listHeaderRepository.CreateListHeaderAsync(userId, creation);

        await _unitOfWork.SaveChangesAsync();

        return creation.Id;
    }

    public async Task<ListHeader> GetListHeaderByIdAsync(Guid listHeaderId)
    {
        var userId = await _userService.GetUserIdAsync();

        var result = await _guard.AgainstInvalidListHeaderGetAsync(userId, listHeaderId);

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }

        var listHeader = await _listHeaderRepository.GetListHeaderByIdAsync(userId, listHeaderId);

        return _mapper.Map<ListHeader>(listHeader);
    }

    public async Task<IEnumerable<ListHeader>> GetListHeadersAsync()
    {
        var userId = await _userService.GetUserIdAsync();

        var listHeaders = await _listHeaderRepository.GetListHeadersAsync(userId);

        return _mapper.Map<IEnumerable<ListHeader>>(listHeaders);
    }
}
