using System;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

public class IoTHub : Hub
{
    public async Task JoinTenant(string tenantSlug)
    => await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantSlug}");
}
