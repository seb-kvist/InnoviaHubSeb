using System;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;


// IoTHub är en SignalR-hub som hanterar realtidsanslutningar mellan backend och frontend
public class IoTHub : Hub
{
    // Metod som anropas när klient ansluter och lyssnar på data från specifik tenant. 
    public async Task JoinTenant(string tenantSlug)
    => await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantSlug}"); // Detta lägger till användarens SignalR-anslutning i en grupp baserad på tenantens namn

}
