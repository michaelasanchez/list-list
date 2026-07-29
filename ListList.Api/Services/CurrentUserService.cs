using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using System.Security.Claims;

public interface ICurrentUserService
{
    string? UserId { get; }
    Task<Guid?> GetUserId(CancellationToken cancellationToken = default);
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRepository _userRepository;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _userRepository = unitOfWork.UserRepository;
    }

    // Quick access to the ID directly from claims
    public string? UserId =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    // Lazily fetch the full user entity from the DB when needed
    public async Task<Guid?> GetUserId(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(UserId))
            return null;

        var user = await _userRepository.GetUserByGoogleSubAsync(UserId);

        return user?.Id;
    }
}