using System;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Options;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

//Klassen fungerar som en modell för konfigurationsinställningar
public class InnoviaIoTOptions
{
    public string PortalAdapterBase { get; set; } = default!;
    public string RealtimeHubBase { get; set; } = default!;
    public string DeviceRegistryBase { get; set; } = default!;
    public string TenantId { get; set; } = default!;
    public string TenantSlug { get; set; } = default!;
}

// BackgroundService fungerar som en brygga mellan systemet som tar emot IoT-data (RealtimeHubBase) och vår egen
// SignalR-hub (IoTHub) som frontend lyssnar på.
public class IoTRealtimeBridgeService : BackgroundService
{
    private readonly IHubContext<IoTHub> _hubContext;
    private readonly InnoviaIoTOptions _opt;

    // Konstruktor som tar in hub-context och konfigurationsinställningar via dependency injection
    public IoTRealtimeBridgeService(IHubContext<IoTHub> hubContext, IOptions<InnoviaIoTOptions> opt)
    {
        _hubContext = hubContext;
        _opt = opt.Value;
    }

    // Skapa en SignalR-klient som kopplar upp sig mot den externa realtids-hubben (RealtimeHubBase) 
    // och lyssnar efter inkommande mätdata ("measurementReceived").
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

        //Skapar kopplingen mot externa hubben
        var connection = new HubConnectionBuilder()
        .WithUrl($"{_opt.RealtimeHubBase}/hub/telemetry") //Fullständig URL till realtid http://localhost:5104/hub/telemetry
        .WithAutomaticReconnect()
        .Build();


        // När realtids-hubben tar emot ett nytt mätvärde (t.ex. Edge.Simulator via MQTT → Ingest.Gateway),
        // så skickas detta event ("measurementReceived") ut. Payloaden skickar den vidare till frontend via vår egen hub.
        connection.On<object>("measurementReceived", async (payload) =>
        {
            // payload innehåller mätdata:{ tenantSlug, deviceId, type, value, unit, timestamp }
            await _hubContext.Clients
                .Group($"tenant:{_opt.TenantSlug}")
                .SendAsync("measurementReceived", payload);
        });

        await connection.StartAsync(stoppingToken); //Startar anslutningen till den externa realtids-hubben.
        await connection.InvokeAsync("JoinTenant", _opt.TenantSlug, cancellationToken: stoppingToken); //Körs kontinuerligt så lämnge appen är igång aka uppdaterar med ny data hela tiden
    }
}
