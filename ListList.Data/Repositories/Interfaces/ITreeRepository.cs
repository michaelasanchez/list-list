using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface ITreeRepository
{
	Task RelocateNode(Guid ownerId, string sourceToken, Guid nodeId, Guid destinationPartitionId, Guid? parentId, int order);
	Task CopyNode(Guid ownerId, string sourceToken, Guid nodeId, Guid destinationPartitionId, Guid? parentId, int order);
	Task<Guid> PromoteNode(Guid ownerId, string sourceToken, Guid nodeId, int order);
	Task RelocatePartition(Guid ownerId, string sourceToken, int order);
	Task<Guid> CopyPartition(Guid ownerId, string sourceToken, int order);
	Task DemotePartition(Guid ownerId, string sourceToken, Guid destinationPartitionId, Guid? parentId, int order);
}
