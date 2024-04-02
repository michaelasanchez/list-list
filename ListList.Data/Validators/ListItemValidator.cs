using ListList.Data.Validators.Interfaces;
using ListList.Data.Models.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ListList.Data.Models;

namespace ListList.Data.Validators
{
    public class ListItemValidator : IListItemValidator
    {
        private readonly IListListContext _context;

        public ListItemValidator(IListListContext context)
        {
            _context = context;
        }

        public async Task<ValidationResult> ListItemIsEmptyAsync(Guid userId, Guid listItemId, ValidationResult result)
        {
            var targetNode = await _context.ListItems
                .Where(z => z.Id == listItemId)
                .Select(z => new { z.ListHeaderId, z.Left, z.Right })
                .SingleOrDefaultAsync();

            if (targetNode is not null)
            {
                var listItemNotEmpty = await _context.ListItems
                    .AnyAsync(z =>
                        z.ListHeaderId == targetNode.ListHeaderId &&
                        z.Left > targetNode.Left &&
                        z.Right < targetNode.Right);

                if (listItemNotEmpty)
                {
                    result.AddError($"List item is not empty.");
                }
            }

            return result;
        }

        public async Task<ValidationResult> UserOwnsListItemAsync(Guid userId, Guid listItemId, ValidationResult result)
        {
            var userOwnsListHeader = await _context.ListItems
                .Include(z => z.ListHeader)
                .AnyAsync(z => z.Id == listItemId && z.ListHeader.UserId == userId);

            if (!userOwnsListHeader)
            {
                result.AddError("You do not own this list.");
            }

            return result;
        }
    }
}
