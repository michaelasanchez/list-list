namespace ListList.Api.Models
{
    public class ListItem
    {
        public Guid? Id { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Complete { get; set; }
    }
}
