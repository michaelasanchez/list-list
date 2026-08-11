using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface INodeRepository
{
    Task CompleteNode(Guid nodeId);
    Task<Guid> CreateNode(NodeResource creation, string token, Guid? overId, Guid? parentId);
    Task DeleteNode(Guid nodeId);
    Task<NodeResource> GetNodeById(Guid nodeId);
    Task PatchNode(Guid nodeId, NodeResource resource, bool? recursive);
    Task PutNode(Guid nodeId, NodeEntity put);
    Task RelocateNode(Guid activeId, Guid overId, Guid? parentId);
    Task RestoreNode(Guid nodeId, Guid? overId, Guid? parentId);
}
