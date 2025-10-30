import * as signalR from "@microsoft/signalr";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const hubUrl = `${apiBaseUrl}/bookingHub`;

let connection: signalR.HubConnection | null = null;
let connectionToken: string | null = null;

async function startConnection(conn: signalR.HubConnection) {
  try {
    await conn.start();
    console.log("✅ Connected to BookingHub (SignalR)");
  } catch (error) {
    console.error("❌ SignalR connection failed, retrying in 3s...", error);
    setTimeout(() => startConnection(conn), 3000);
  }
}

export function getConnection(token: string) {
  if (!token) throw new Error("SignalR requires a token");

  if (
    connection &&
    connectionToken === token &&
    connection.state === signalR.HubConnectionState.Connected
  ) {
    return connection;
  }

  if (connection) {
    connection.stop().catch(err =>
      console.warn("Failed to stop previous SignalR connection:", err)
    );
  }

  connectionToken = token;
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
      skipNegotiation: true, // ⚡ go straight to WebSockets
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([1000, 2000, 5000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  startConnection(connection);
  return connection;
}
