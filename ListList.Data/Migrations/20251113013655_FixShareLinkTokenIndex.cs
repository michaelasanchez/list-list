using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixShareLinkTokenIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShareLink_HeaderId_Token",
                table: "ShareLink");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink",
                column: "HeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_Token",
                table: "ShareLink",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink");

            migrationBuilder.DropIndex(
                name: "IX_ShareLink_Token",
                table: "ShareLink");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId_Token",
                table: "ShareLink",
                columns: new[] { "HeaderId", "Token" },
                unique: true);
        }
    }
}
