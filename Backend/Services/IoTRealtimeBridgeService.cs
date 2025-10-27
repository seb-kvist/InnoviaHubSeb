using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

//Klassen fungerar som en modell för konfigurationsinställningar. Dessa används av både PortalAdapterService och IoTRealtimeBridgeService.
public class InnoviaIoTOptions
{
    public string PortalAdapterBase { get; set; } = default!;
    public string RealtimeHubBase { get; set; } = default!;
    public string DeviceRegistryBase { get; set; } = default!;
    public string TenantId { get; set; } = default!;
    public string TenantSlug { get; set; } = default!;
}

// BackgroundService fungerar som en brygga mellan systemet som tar emot IoT-data (RealtimeHubBase) och vår egen
// SignalR-hub (IoTHub) som frontend lyssnar på.Så fort en ny mätning kommer in, skickas den vidare direkt till alla webbläsare i rätt tenant.
public class IoTRealtimeBridgeService : BackgroundService
{
    private readonly IHubContext<IoTHub> _hubContext;
    private readonly InnoviaIoTOptions _opt;
    private readonly ILogger<IoTRealtimeBridgeService> _logger;

    public IoTRealtimeBridgeService(
        IHubContext<IoTHub> hubContext,
        IOptions<InnoviaIoTOptions> opt,
        ILogger<IoTRealtimeBridgeService> logger)
    {
        _hubContext = hubContext;
        _opt = opt.Value;
        _logger = logger;
    }
    // Metod: ExecuteAsync. 
    // Skapar huvudloop för tjänsten och körs automatiskt när servern startas och körs så länge appen körs.  Skapa en SignalR-klient som kopplar upp sig mot den externa realtids-hubben (RealtimeHubBase) 
    // och lyssnar efter inkommande mätdata ("measurementReceived"), som sedan skickar till frontenden via IoTHub
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var announcedOnline = false;
        var announcedOffline = false;

        while (!stoppingToken.IsCancellationRequested)
        {
            HubConnection? connection = null;
            try
            {
                connection = new HubConnectionBuilder()
                    .WithUrl($"{_opt.RealtimeHubBase}/hub/telemetry")
                    .WithAutomaticReconnect()
                    .Build();

                connection.On<object>("measurementReceived", async payload =>
                {
                    await _hubContext.Clients
                        .Group($"tenant:{_opt.TenantSlug}")
                        .SendAsync("measurementReceived", payload);
                });

                await connection.StartAsync(stoppingToken);
                await connection.InvokeAsync("JoinTenant", _opt.TenantSlug, cancellationToken: stoppingToken);
                _logger.LogInformation("Connected to Innovia IoT realtime hub.");

                if (!announcedOnline)
                {
                    try
                    {
                        await BroadcastStatusAsync(true, stoppingToken);
                        announcedOnline = true;
                    }
                    catch (OperationCanceledException)
                    {
                        throw;
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogDebug(notifyEx, "Failed to notify IoT status change.");
                    }
                }

                announcedOffline = false;

                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                if (connection is not null)
                {
                    await connection.DisposeAsync();
                }
                throw;
            }
            catch (Exception ex)
            {
                if (connection is not null)
                {
                    await connection.DisposeAsync();
                }

                var firstFailure = !announcedOffline;

                if (firstFailure)
                {
                    try
                    {
                        await BroadcastStatusAsync(false, stoppingToken);
                        announcedOffline = true;
                    }
                    catch (OperationCanceledException)
                    {
                        return;
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogDebug(notifyEx, "Failed to notify IoT status change.");
                    }
                }

                announcedOnline = false;

                if (firstFailure)
                {
                    _logger.LogWarning("Innovia IoT realtime hub är inte tillgänglig. Nytt försök om 10 sekunder.");
                    _logger.LogDebug(ex, "Detaljer för misslyckad anslutning till Innovia IoT realtime hub.");
                }
                else
                {
                    _logger.LogDebug(ex, "Fortfarande ingen anslutning till Innovia IoT realtime hub. Nytt försök om 10 sekunder.");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }
    }

    private Task BroadcastStatusAsync(bool online, CancellationToken cancellationToken) =>
        _hubContext.Clients
            .Group($"tenant:{_opt.TenantSlug}")
            .SendAsync("iotStatusChanged", new { online }, cancellationToken);
}
