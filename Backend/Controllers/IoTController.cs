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

        //DI, portaladapter in i konstroktur
        public IoTController(PortalAdapterService portalService)
        {
            _portalService = portalService;
        }

        //GET /api/iot/devices
        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices(CancellationToken cancellationToken)
        {
            try
            {
                //Hämtar alla enheter från PortalAdapterService
                var devices = await _portalService.GetDevicesAsync(cancellationToken);

                //Gör om så att frontend får ren json
                var shaped = devices.Select(d => new
                {
                    id = d.Id, //databas id
                    name = string.IsNullOrWhiteSpace(d.Model) ? (d.Serial ?? d.Id.ToString()) : d.Model, //Om modell saknas så kommer serial visas istället
                    serial = d.Serial, //serienumret på enhet
                    model = d.Model, //Modell på sensor
                    status = d.Status //om sensor är aktiv aka av eller på
                });

                return Ok(shaped); // Returnerar som JSON med status 200 OK
            }
            catch (InnoviaIoTOfflineException)
            {
                return IoTOfflineResponse();
            }
        }

        // GET /api/iot/devices/{deviceId}/measurements
        [HttpGet("devices/{deviceId:guid}/measurements")]
        public async Task<IActionResult> GetMeasurements(Guid deviceId, CancellationToken cancellationToken)
        {
            try
            {
                // Hämtar alla mätdata (temperatur, CO2, etc.) för en viss device
                var envelope = await _portalService.GetMeasurementsAsync(deviceId, cancellationToken);
                if (envelope is null) // Om ingen data hittades, returnera 404 Not Found
                {
                    return NotFound();
                }

                return Ok(envelope); // Returnerar mätdata som JSON
            }
            catch (InnoviaIoTOfflineException)
            {
                return IoTOfflineResponse();
            }
        }
        

        // GET /api/iot/devices/{deviceId}/latest
        [HttpGet("devices/{deviceId:guid}/latest")]
        public async Task<IActionResult> GetLatest(Guid deviceId, CancellationToken cancellationToken)
        {
            try
            {
                // Hämtar den senaste mätningen för en viss device
                var latest = await _portalService.GetLatestMeasurementAsync(deviceId, cancellationToken);

                if (latest is null)
                {
                    return NotFound();
                }

                // Returnerar senaste värdet (ex: senaste temperatur)
                return Ok(latest);
            }
            catch (InnoviaIoTOfflineException)
            {
                return IoTOfflineResponse();
            }
        }

        private IActionResult IoTOfflineResponse() =>
            StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "IoT-tjänsten är offline just nu." });
    }
}
