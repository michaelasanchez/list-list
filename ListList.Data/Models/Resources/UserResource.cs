namespace ListList.Data.Models.Resources;

public class UserResource
{
    public Guid? Id { get; set; }
    public string Subject { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string PictureUrl { get; set; }
    public string RefreshToken { get; set; }
}