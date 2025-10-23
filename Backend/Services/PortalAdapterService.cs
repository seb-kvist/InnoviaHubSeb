using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Backend.Services;


// Den här klassen ansvarar för all kommunikation mellan backend och Innovia Hub Portal API.
// Hämtar en lista över registrerade IoT-enheter (GetDevicesAsync),hämtar alla mätvärden för en viss enhet (GetMeasurementsAsync)
// Hämtar den senaste mätningen för en viss enhet (GetLatestMeasurementAsync) aka flöde som är Frontend → IoTController → PortalAdapterService → Portal.Adapter API
public class PortalAdapterService
{
    private readonly HttpClient _http;
    private readonly InnoviaIoTOptions _opt;
    private readonly ILogger<PortalAdapterService> _logger;

    public PortalAdapterService(HttpClient http, IOptions<InnoviaIoTOptions> opt, ILogger<PortalAdapterService> logger)
    {
        _http = http;
        _opt = opt.Value;
        _logger = logger;
    }

    // Metod: GetDevicesAsync()
    // Hämtar alla IoT-enheter som tillhör den aktuella tenant:en. Endpoint som anropas: /api/tenants/{tenantId}/devices
    // och returnerar en lista med DeviceDto-objekt (enheter).
    public async Task<IReadOnlyList<DeviceDto>> GetDevicesAsync(CancellationToken cancellationToken = default)
    {
        // Skapar upp fullständig URL till Device Registry
        var url = $"{_opt.DeviceRegistryBase}/api/tenants/{_opt.TenantId}/devices";

        try
        {
            using var response = await _http.GetAsync(url, cancellationToken);

            // Om API:t svarar 404 (NotFound) returnerar vi en tom lista (ingen krasch)
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return Array.Empty<DeviceDto>();
            }

            // Kastar fel om statuskod inte är 200 OK
            response.EnsureSuccessStatusCode();

            // Läser in JSON och konveretar till en lista av DeviceDto

            var payload = await response.Content.ReadFromJsonAsync<List<DeviceDto>>(cancellationToken: cancellationToken);
            return payload ?? new List<DeviceDto>(); // Returnerar listan eller en tom lista om payload = null
        }
        catch (Exception ex)
        {   // Loggar felet i serverkonsolen för felsökning
            _logger.LogError(ex, "Failed to GET devices from {Url}", url);
            throw;
        }
    }

    // Metod: GetMeasurementsAsync()
    // Hämtar HTTP-svar med alla mätvärden för en specifik enhet. Endpoint: /portal/{tenantId}/devices/{deviceId}/measurements 
    // och returnerar: HttpResponseMessage för bättre felhhantering
    public Task<HttpResponseMessage> GetMeasurementsRawAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        var url = $"{_opt.PortalAdapterBase}/portal/{_opt.TenantId}/devices/{deviceId}/measurements";
        return _http.GetAsync(url, cancellationToken);
    }


    // Metod: GetMeasurementsAsync()
    // Hämtar mätvärden (temperatur, CO2, etc.) för en viss enhet och returnerar ett objekt av typen PortalMeassurementsEnvelope
    // Returnerar ett objekt av typen PortalMeasurementsEnvelope som som innehåller lista av MeasurementItem.
    public async Task<PortalMeasurementsEnvelope?> GetMeasurementsAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        using var response = await GetMeasurementsRawAsync(deviceId, cancellationToken);
        // Om API:t returnerar 404 (Not Found) eller 400 (Bad Request), avbryt
        if (response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.BadRequest)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();  // Läs in JSON-svaret och konvertera till PortalMeasurementsEnvelope

        return await response.Content.ReadFromJsonAsync<PortalMeasurementsEnvelope>(cancellationToken: cancellationToken);
    }


    // Metod GetLatestMeasurementAsync()
    // Hämtar endast den senaste mätningen från listan av mätvärden. Returnerar ett MeasurementItem-objekt.
    public async Task<MeasurementItem?> GetLatestMeasurementAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        var envelope = await GetMeasurementsAsync(deviceId, cancellationToken);
        if (envelope?.Measurements is null || envelope.Measurements.Count == 0)
        {
            // Om det inte finns några mätningar, returnera null
            return null;
        }

        // Returnerar den sista posten i listan (den senaste mätningen)
        return envelope.Measurements[^1];
    }


    //REcord represenderar data som tas emot från Portal.Adapter API. Matchar JSOn formatet som apiet levererar
    
    // En IoT-enhet (Device)
    public record DeviceDto(Guid Id, Guid TenantId, Guid? RoomId, string? Model, string? Serial, string Status);
    
    // En enskild mätning (t.ex. temperatur, CO2)
    public record MeasurementItem(DateTimeOffset Time, string Type, double Value);
    
    // En hel uppsättning mätningar för en enhet
    public record PortalMeasurementsEnvelope(Guid DeviceId, int Count, DateTimeOffset? From, DateTimeOffset? To, string? Type, List<MeasurementItem> Measurements);
}
