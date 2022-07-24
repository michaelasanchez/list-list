namespace ListList.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<Guid> GetUserIdAsync();
    }
}
