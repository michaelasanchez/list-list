using ListList.Api.Contracts;
using ListList.Api.Contracts.Put;
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
        public async Task<ActionResult<IEnumerable<ListHeader>>> Get()
        {
            IEnumerable<ListHeader> listHeaders;

            try
            {
                listHeaders = await _service.GetListItemsAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(listHeaders);
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

        [HttpPost("{parentId}")]
        public async Task<ActionResult<Guid>> Create([FromRoute] Guid? parentId, ListItemCreation creation)
        {
            Guid id;

            try
            {
                id = await _service.CreateListItemAsync(creation, parentId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(id);
        }

        [HttpDelete("{listItemId}")]
        public async Task<ActionResult> Delete([FromRoute] Guid listItemId)
        {
            try
            {
                await _service.DeleteListItemAsync(listItemId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [HttpPost("complete/{listItemId}")]
        public async Task<ActionResult> Complete(Guid listItemId)
        {
            try
            {
                await _service.CompleteListItemAsync(listItemId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }
    }
}
