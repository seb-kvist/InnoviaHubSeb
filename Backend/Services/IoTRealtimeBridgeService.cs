using System;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Options;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class InnoviaIoTOptions
{
    public string PortalAdapterBase { get; set; } = default!;
    public string RealtimeHubBase { get; set; } = default!;
    public string DeviceRegistryBase { get; set; } = default!;
    public string TenantId { get; set; } = default!;
    public string TenantSlug { get; set; } = default!;
}

public class IoTRealtimeBridgeService : BackgroundService
{
    private readonly IHubContext<IoTHub> _hubContext;
    private readonly InnoviaIoTOptions _opt;

    public IoTRealtimeBridgeService(IHubContext<IoTHub> hubContext, IOptions<InnoviaIoTOptions> opt)
    {
        _hubContext = hubContext;
        _opt = opt.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var connection = new HubConnectionBuilder()
        .WithUrl($"{_opt.RealtimeHubBase}/hub/telemetry")
        .WithAutomaticReconnect()
        .Build();

        connection.On<object>("measurementReceived", async (payload) =>
        {
            // payload = { tenantSlug, deviceId (GUID), type, value, time, ... } from innovia-iot
            await _hubContext.Clients
                .Group($"tenant:{_opt.TenantSlug}")
                .SendAsync("measurementReceived", payload);
        });

        await connection.StartAsync(stoppingToken);
        await connection.InvokeAsync("JoinTenant", _opt.TenantSlug, cancellationToken: stoppingToken);

    }
}
