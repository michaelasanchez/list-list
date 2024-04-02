using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models
{
    public class ListListContext : DbContext, IListListContext
    {
        public ListListContext(DbContextOptions<ListListContext> options) : base(options)
        {
        }

        public DbSet<ListHeaderEntity> ListHeaders { get; set; }
        public DbSet<ListItemEntity> ListItems { get; set; }
        public DbSet<UserEntity> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ListHeaderEntity>(entity =>
            {
                entity.ToTable("ListHeader");

                entity.HasIndex(p => p.Id);
                
                entity.HasMany(p => p.ListItems)
                    .WithOne(d => d.ListHeader)
                    .HasForeignKey(p => p.ListHeaderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ListItemEntity>(entity =>
            {
                entity.ToTable("ListItem");

                entity.HasIndex(p => p.Id);
            });

            modelBuilder.Entity<UserEntity>(entity =>
            {
                entity.ToTable("User");

                entity.HasIndex(p => p.Id);
            });

        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            UpdateDatedEntity();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            UpdateDatedEntity();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        protected void UpdateDatedEntity()
        {
            var utcNow = DateTime.UtcNow;

            foreach (var entry in this.ChangeTracker.Entries<IDated>())
            {
                var entity = entry.Entity;
                switch (entry.State)
                {
                    case EntityState.Added:
                        entity.Created = utcNow;
                        entity.Updated = utcNow;
                        break;
                    case EntityState.Modified:
                        entity.Updated = utcNow;
                        break;
                }
            }
            this.ChangeTracker.DetectChanges();
        }
    }
}
