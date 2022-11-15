using ListList.Data.Validators.Interfaces;
using ListList.Data.Models.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ListList.Data.Validators
{
    public class ListItemValidator : IListItemValidator
    {
        private readonly IListListContext _context;

        public ListItemValidator(IListListContext context)
        {
            _context = context;
        }
    }
}
