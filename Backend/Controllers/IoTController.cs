using System.Linq;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IoTController : ControllerBase
    {
        private readonly PortalAdapterService _portalService;

        public IoTController(PortalAdapterService portalService)
        {
            _portalService = portalService;
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices(CancellationToken cancellationToken)
        {
            var devices = await _portalService.GetDevicesAsync(cancellationToken);
            var shaped = devices.Select(d => new
            {
                id = d.Id,
                name = string.IsNullOrWhiteSpace(d.Model) ? (d.Serial ?? d.Id.ToString()) : d.Model,
                serial = d.Serial,
                model = d.Model,
                status = d.Status
            });

            return Ok(shaped);
        }

        [HttpGet("devices/{deviceId:guid}/measurements")]
        public async Task<IActionResult> GetMeasurements(Guid deviceId, CancellationToken cancellationToken)
        {
            var envelope = await _portalService.GetMeasurementsAsync(deviceId, cancellationToken);
            if (envelope is null)
            {
                return NotFound();
            }

            return Ok(envelope);
        }
        
        [HttpGet("devices/{deviceId:guid}/latest")]
        public async Task<IActionResult> GetLatest(Guid deviceId, CancellationToken cancellationToken)
        {
            var latest = await _portalService.GetLatestMeasurementAsync(deviceId, cancellationToken);
            if (latest is null)
            {
                return NotFound();
            }

            return Ok(latest);
        }

    }
}
