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

        public DbSet<ListItemEntity> ListItems { get; set; }
        public DbSet<UserEntity> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ListItemEntity>(entity =>
            {
                entity.ToTable("ListItem");

                entity.HasIndex(e => e.Id);

                entity.HasKey(e => e.Id);

                entity.HasOne<UserEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.UserId);
            });

            modelBuilder.Entity<UserEntity>(entity =>
            {
                entity.ToTable("User");

                entity.HasIndex(e => e.Id);
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
