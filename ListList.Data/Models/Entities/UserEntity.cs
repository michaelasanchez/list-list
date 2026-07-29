namespace ListList.Data.Models.Entities;

public class UserEntity : BaseEntity
{
    public string Subject { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;

    public string? PictureUrl { get; set; }
    public string? RefreshToken { get; set; }
}