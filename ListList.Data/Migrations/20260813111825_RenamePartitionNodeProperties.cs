using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenamePartitionNodeProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_HeaderId",
                table: "ListItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedAccess_ListHeader_HeaderId",
                table: "SharedAccess");

            migrationBuilder.DropForeignKey(
                name: "FK_ShareLink_ListHeader_HeaderId",
                table: "ShareLink");

            migrationBuilder.RenameColumn(
                name: "HeaderId",
                table: "ShareLink",
                newName: "PartitionId");

            migrationBuilder.RenameIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink",
                newName: "IX_ShareLink_PartitionId");

            migrationBuilder.RenameColumn(
                name: "HeaderId",
                table: "SharedAccess",
                newName: "PartitionId");

            migrationBuilder.RenameIndex(
                name: "IX_SharedAccess_HeaderId_UserId",
                table: "SharedAccess",
                newName: "IX_SharedAccess_PartitionId_UserId");

            migrationBuilder.RenameColumn(
                name: "HeaderId",
                table: "ListItem",
                newName: "PartitionId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_HeaderId",
                table: "ListItem",
                newName: "IX_ListItem_PartitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_PartitionId",
                table: "ListItem",
                column: "PartitionId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SharedAccess_ListHeader_PartitionId",
                table: "SharedAccess",
                column: "PartitionId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShareLink_ListHeader_PartitionId",
                table: "ShareLink",
                column: "PartitionId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_PartitionId",
                table: "ListItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedAccess_ListHeader_PartitionId",
                table: "SharedAccess");

            migrationBuilder.DropForeignKey(
                name: "FK_ShareLink_ListHeader_PartitionId",
                table: "ShareLink");

            migrationBuilder.RenameColumn(
                name: "PartitionId",
                table: "ShareLink",
                newName: "HeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_ShareLink_PartitionId",
                table: "ShareLink",
                newName: "IX_ShareLink_HeaderId");

            migrationBuilder.RenameColumn(
                name: "PartitionId",
                table: "SharedAccess",
                newName: "HeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_SharedAccess_PartitionId_UserId",
                table: "SharedAccess",
                newName: "IX_SharedAccess_HeaderId_UserId");

            migrationBuilder.RenameColumn(
                name: "PartitionId",
                table: "ListItem",
                newName: "HeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_PartitionId",
                table: "ListItem",
                newName: "IX_ListItem_HeaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_HeaderId",
                table: "ListItem",
                column: "HeaderId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SharedAccess_ListHeader_HeaderId",
                table: "SharedAccess",
                column: "HeaderId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShareLink_ListHeader_HeaderId",
                table: "ShareLink",
                column: "HeaderId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
