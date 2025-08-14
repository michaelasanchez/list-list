using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Models;

public class ListListContext(DbContextOptions<ListListContext> options) : DbContext(options), IListListContext
{
    public DbSet<HeaderEntity> ListHeaders { get; set; }
    public DbSet<ItemEntity> ListItems { get; set; }
    public DbSet<SharedAccessEntity> SharedAccess { get; set; }
    public DbSet<ShareLinkEntity> ShareLinks { get; set; }
    public DbSet<UserEntity> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<HeaderEntity>(entity =>
        {
            entity.ToTable("ListHeader");

            entity.HasKey(p => p.Id);

            entity.HasOne<UserEntity>()
                .WithMany()
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(p => p.Nodes)
                .WithOne(d => d.Header)
                .HasForeignKey(p => p.HeaderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(p => p.ShareLinks)
                .WithOne()
                .HasForeignKey(d => d.HeaderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ItemEntity>(entity =>
        {
            entity.ToTable("ListItem");

            entity.HasKey(p => p.Id);
        });

        builder.Entity<SharedAccessEntity>(entity =>
        {
            entity.ToTable("SharedAccess");

            entity.HasKey(p => p.Id);

            entity.HasIndex(p => new { p.HeaderId, p.UserId })
                .IsUnique();

            entity.HasOne<HeaderEntity>()
                .WithMany()
                .HasForeignKey(d => d.HeaderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<UserEntity>()
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<ShareLinkEntity>()
                .WithMany()
                .HasForeignKey(d => d.GrantedByLinkId);
        });

        builder.Entity<ShareLinkEntity>(entity =>
        {
            entity.ToTable("ShareLink");

            entity.HasKey(p => p.Id);

            entity.HasIndex(p => new { p.HeaderId, p.Token })
            .IsUnique();
        });

        builder.Entity<UserEntity>(entity =>
        {
            entity.ToTable("User");

            entity.HasKey(p => p.Id);

            entity.HasIndex(p => p.Subject)
                .IsUnique();
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
