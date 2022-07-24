namespace ListList.Data.Models.Entities
{
    public class ListItemEntity : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid? RootId { get; set; }

        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Complete { get; set; }

        public int Left { get; set; }
        public int Right { get; set; }
    }
}
