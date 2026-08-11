using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IPartitionService
{
    Task<Guid> CreatePartition(PartitionCreation creation, int? order);
    Task<Guid> CreateNode(string token, NodeCreation creation);
    Task<IEnumerable<Partition>> GetPartitions();
    Task<Partition> GetPartition(string token);
    Task RelocatePartition(string token, int order);
    Task PatchPartition(string token, PartitionPatch patch);
    Task PutPartition(string token, PartitionPut put);
    Task DeletePartition(string token);
    Task RestorePartition(string token, int? order);
}
