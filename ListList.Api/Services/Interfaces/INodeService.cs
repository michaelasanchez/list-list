using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface INodeService
{
    Task CompleteNode(string token, Guid nodeId);
    Task DeleteNode(string token, Guid nodeId);
    Task<Node> GetNodeById(string token, Guid nodeId);
    Task PatchNode(string token, Guid nodeId, NodePatch patch, bool? recursive);
    Task PutNode(string token, Guid nodeId, NodePut put);
    Task RelocateNode(string token, Guid activeId, Guid overId, Guid? parentId);
    Task RestoreNode(string token, Guid nodeId, Guid? overId, Guid? parentId);
}
