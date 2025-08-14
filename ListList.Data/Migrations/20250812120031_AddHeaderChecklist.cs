using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHeaderChecklist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Checklist",
                table: "ListHeader",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Checklist",
                table: "ListHeader");
        }
    }
}
