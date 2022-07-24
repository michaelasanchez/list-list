using ListList.Api.Models;
using ListList.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListList.Api.Controllers
{
    [ApiController]
	[Route("api/[controller]")]
    public class ListItemController : Controller
    {
        private readonly IListItemService _service;

        public ListItemController(IListItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListItem>>> Get()
        {
            IEnumerable<ListItem> listItems;

            try
            {
                listItems = await _service.GetListItemsAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(listItems);
        }

        [HttpGet("{listItemId}")]
        public async Task<ActionResult<ListItem>> GetById([FromRoute] Guid listItemId)
        {
            ListItem listItem;

            try
            {
                listItem = await _service.GetListItemByIdAsync(listItemId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(listItem);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create(ListItem listItem, Guid? parentId)
        {
            Guid id;

            try
            {
                id = await _service.CreateListItemAsync(listItem, parentId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(id);
        }
    }
}
