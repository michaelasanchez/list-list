using ListList.Data.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models.Interfaces;

public interface IListListContext
{
    DbSet<HeaderEntity> Headers { get; set; }
    DbSet<ItemEntity> Items { get; set; }
    DbSet<ShareLinkEntity> ShareLinks { get; set; }
    DbSet<UserEntity> Users { get; set; }
}
