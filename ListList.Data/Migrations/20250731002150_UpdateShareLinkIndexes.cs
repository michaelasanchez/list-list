using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateShareLinkIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "ShareLink",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId_Permission",
                table: "ShareLink",
                columns: new[] { "HeaderId", "Permission" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId_Token",
                table: "ShareLink",
                columns: new[] { "HeaderId", "Token" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShareLink_HeaderId_Permission",
                table: "ShareLink");

            migrationBuilder.DropIndex(
                name: "IX_ShareLink_HeaderId_Token",
                table: "ShareLink");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "ShareLink",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink",
                column: "HeaderId");
        }
    }
}
