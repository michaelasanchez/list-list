using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IPartitionRepository
{
    Task CreatePartition(Guid ownerId, PartitionEntity creation, int? order);
    Task DeletePartition(string token);
    Task<PartitionResource> GetPartition(Guid? userId, string token);
    Task<List<PartitionResource>> GetPartitions(Guid? ownerId);
    Task PatchPartition(string token, PartitionResource patch);
    Task PutPartition(string token, PartitionEntity update);
    Task RelocatePartition(Guid ownerId, string token, int index);
    Task RestorePartition(Guid value, string token, int? order);
}
