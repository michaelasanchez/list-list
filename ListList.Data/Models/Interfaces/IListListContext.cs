using ListList.Data.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models.Interfaces
{
    public interface IListListContext
    {
        DbSet<HeaderEntity> ListHeaders { get; set; }
        DbSet<ListItemEntity> ListItems { get; set; }
        DbSet<UserEntity> Users { get; set; }
    }
}
