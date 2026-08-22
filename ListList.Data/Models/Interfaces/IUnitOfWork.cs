using ListList.Data.Repositories.Interfaces;
using ListList.Data.Validators.Interfaces;

namespace ListList.Data.Models.Interfaces;

public interface IUnitOfWork
{
    IPartitionRepository PartitionRepository { get; }
    INodeRepository NodeRepository { get; }
    ITreeRepository TreeRepository { get; }
    IShareRepository ShareRepository { get; }
    IUserRepository UserRepository { get; }

    INodeValidator NodeValidator { get; }

    Task SaveChangesAsync();
}
