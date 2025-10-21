using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Backend.Services;

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

    public async Task<IReadOnlyList<DeviceDto>> GetDevicesAsync(CancellationToken cancellationToken = default)
    {
        var url = $"{_opt.DeviceRegistryBase}/api/tenants/{_opt.TenantId}/devices";

        try
        {
            using var response = await _http.GetAsync(url, cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return Array.Empty<DeviceDto>();
            }

            response.EnsureSuccessStatusCode();
            var payload = await response.Content.ReadFromJsonAsync<List<DeviceDto>>(cancellationToken: cancellationToken);
            return payload ?? new List<DeviceDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to GET devices from {Url}", url);
            throw;
        }
    }

    public Task<HttpResponseMessage> GetMeasurementsRawAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        var url = $"{_opt.PortalAdapterBase}/portal/{_opt.TenantId}/devices/{deviceId}/measurements";
        return _http.GetAsync(url, cancellationToken);
    }

    public async Task<PortalMeasurementsEnvelope?> GetMeasurementsAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        using var response = await GetMeasurementsRawAsync(deviceId, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.BadRequest)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PortalMeasurementsEnvelope>(cancellationToken: cancellationToken);
    }

    public async Task<MeasurementItem?> GetLatestMeasurementAsync(Guid deviceId, CancellationToken cancellationToken = default)
    {
        var envelope = await GetMeasurementsAsync(deviceId, cancellationToken);
        if (envelope?.Measurements is null || envelope.Measurements.Count == 0)
        {
            return null;
        }

        return envelope.Measurements[^1];
    }

    public record DeviceDto(Guid Id, Guid TenantId, Guid? RoomId, string? Model, string? Serial, string Status);

    public record MeasurementItem(DateTimeOffset Time, string Type, double Value);

    public record PortalMeasurementsEnvelope(Guid DeviceId, int Count, DateTimeOffset? From, DateTimeOffset? To, string? Type, List<MeasurementItem> Measurements);
}
