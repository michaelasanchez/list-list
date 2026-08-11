using ListList.Data.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models.Interfaces;

public interface IListListContext
{
    DbSet<PartitionEntity> Partitions { get; set; }
    DbSet<NodeEntity> Nodes { get; set; }
    DbSet<ShareLinkEntity> ShareLinks { get; set; }
    DbSet<UserEntity> Users { get; set; }
}
