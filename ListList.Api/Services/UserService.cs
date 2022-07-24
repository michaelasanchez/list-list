using ListList.Api.Models;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Api.Services
{
    public class UserService : IUserService
	{
		private readonly IHttpContextAccessor _httpContextAccessor;

		private readonly IUnitOfWork _unitOfWork;

		private readonly IUserRepository _userRepository;

		protected User User;

		public UserService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork)
		{
			_httpContextAccessor = httpContextAccessor;

			_unitOfWork = unitOfWork;

			_userRepository = unitOfWork.UserRepository;
		}

		public async Task<Guid> GetUserIdAsync()
		{
			if (!_httpContextAccessor.HttpContext.User.Identity.IsAuthenticated)
            {
				throw new Exception("User not authenticated");
            }

			var username = string.Empty;

			var userClaims = _httpContextAccessor.HttpContext.User.Identities.Single().Claims;

			username = userClaims
				.Where(c => c.Type == "email")
				.Select(c => c.Value)
				.SingleOrDefault();

			var userEntity = await _userRepository.GetUserByUsernameAsync(username);

			// DEBUG
			if (userEntity is null)
			{
				if (username != null)
                {
					userEntity = await AddUserAsync(username);
				}
				else
				{
					throw new Exception("Authentication failed");
				}
			}


			return userEntity.Id;
		}
		private async Task<UserEntity> AddUserAsync(string username)
		{
			UserEntity newUser = new() { Username = username };

			await _userRepository.AddUserAsync(newUser);
			await _unitOfWork.SaveChangesAsync();

			return newUser;
		}
    }
}
