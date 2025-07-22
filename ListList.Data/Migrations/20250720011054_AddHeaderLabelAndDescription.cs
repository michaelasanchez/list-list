using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations;

public partial class AddHeaderLabelAndDescription : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "ListHeader",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Label",
            table: "ListHeader",
            type: "nvarchar(max)",
            nullable: false,
            defaultValue: "");

        migrationBuilder.Sql(@"
UPDATE lh
SET lh.Label = li.Label
FROM ListHeader lh
JOIN (
    SELECT li.ListHeaderId, li.Label
    FROM ListItem li
    JOIN (
        SELECT ListHeaderId, MIN([Left]) AS MinLeft
        FROM ListItem
        GROUP BY ListHeaderId
    ) sub ON li.ListHeaderId = sub.ListHeaderId AND li.[Left] = sub.MinLeft
) li ON lh.Id = li.ListHeaderId;
");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Description",
            table: "ListHeader");

        migrationBuilder.DropColumn(
            name: "Label",
            table: "ListHeader");
    }
}
