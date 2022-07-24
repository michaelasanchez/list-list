using ListList.Data.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models.Interfaces
{
    public interface IListListContext
    {
        DbSet<ListItemEntity> ListItems { get; set; }
        DbSet<UserEntity> Users { get; set; }
    }
}
