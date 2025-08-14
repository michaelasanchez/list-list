using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveItemCompletable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Completable",
                table: "ListItem");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Completable",
                table: "ListItem",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
