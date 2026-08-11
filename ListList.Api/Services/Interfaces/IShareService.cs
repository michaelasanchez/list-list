using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;

namespace ListList.Api.Services.Interfaces;

public interface IShareService
{
    Task DeleteLink(Guid shareLinkId);
    Task PutLink(Guid shareLinkId, ShareLinkPut put);
    Task<string> SharePartition(string token, PartitionShare share);
}
