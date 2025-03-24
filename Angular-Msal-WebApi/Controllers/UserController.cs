using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace Angular_Msal_WebApi.Controllers;

[Route("[controller]")]
[ApiController]
public class UserController : Controller
{
    [Route("")]
    [AcceptVerbs("GET")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual ActionResult<Models.UserProfile> GetUserProfile()
    {
        return Ok(new Models.UserProfile());
    }
    
    [Authorize]
    [RequiredScope("Crm.Access")]
    [Route("auth")]
    [AcceptVerbs("GET")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual ActionResult<Models.UserProfile> GetAuth()
    {
        return Ok();
    }
}