using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenamePartitionNode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListHeader_User_OwnerId",
                table: "ListHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_PartitionId",
                table: "ListItem");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedAccess_ListHeader_PartitionId",
                table: "SharedAccess");

            migrationBuilder.DropForeignKey(
                name: "FK_ShareLink_ListHeader_PartitionId",
                table: "ShareLink");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ListItem",
                table: "ListItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ListHeader",
                table: "ListHeader");

            migrationBuilder.RenameTable(
                name: "ListItem",
                newName: "Node");

            migrationBuilder.RenameTable(
                name: "ListHeader",
                newName: "Partition");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_PartitionId",
                table: "Node",
                newName: "IX_Node_PartitionId");

            migrationBuilder.RenameIndex(
                name: "IX_ListHeader_OwnerId",
                table: "Partition",
                newName: "IX_Partition_OwnerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Node",
                table: "Node",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Partition",
                table: "Partition",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Node_Partition_PartitionId",
                table: "Node",
                column: "PartitionId",
                principalTable: "Partition",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Partition_User_OwnerId",
                table: "Partition",
                column: "OwnerId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SharedAccess_Partition_PartitionId",
                table: "SharedAccess",
                column: "PartitionId",
                principalTable: "Partition",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShareLink_Partition_PartitionId",
                table: "ShareLink",
                column: "PartitionId",
                principalTable: "Partition",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Node_Partition_PartitionId",
                table: "Node");

            migrationBuilder.DropForeignKey(
                name: "FK_Partition_User_OwnerId",
                table: "Partition");

            migrationBuilder.DropForeignKey(
                name: "FK_SharedAccess_Partition_PartitionId",
                table: "SharedAccess");

            migrationBuilder.DropForeignKey(
                name: "FK_ShareLink_Partition_PartitionId",
                table: "ShareLink");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Partition",
                table: "Partition");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Node",
                table: "Node");

            migrationBuilder.RenameTable(
                name: "Partition",
                newName: "ListHeader");

            migrationBuilder.RenameTable(
                name: "Node",
                newName: "ListItem");

            migrationBuilder.RenameIndex(
                name: "IX_Partition_OwnerId",
                table: "ListHeader",
                newName: "IX_ListHeader_OwnerId");

            migrationBuilder.RenameIndex(
                name: "IX_Node_PartitionId",
                table: "ListItem",
                newName: "IX_ListItem_PartitionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ListHeader",
                table: "ListHeader",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ListItem",
                table: "ListItem",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ListHeader_User_OwnerId",
                table: "ListHeader",
                column: "OwnerId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
    }
}
