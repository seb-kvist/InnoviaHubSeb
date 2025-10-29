import * as signalR from "@microsoft/signalr";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const hubUrl = `${apiBaseUrl.replace(/\/api$/, "")}/bookingHub`;

let connection: signalR.HubConnection | null = null;
let connectionToken: string | null = null;

async function startConnection(conn: signalR.HubConnection) {
  try {
    await conn.start();
    console.log("✅ Connected to BookingHub");
  } catch (error) {
    console.error("❌ SignalR connection error, retrying...", error);
    setTimeout(() => {
      void startConnection(conn);
    }, 5000);
  }
}

export function getConnection(token: string) {
  if (!token) {
    throw new Error("SignalR requires a token");
  }

  if (
    connection &&
    connectionToken === token &&
    connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    return connection;
  }

  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    connection.stop().catch((err) =>
      console.warn("Stopping previous SignalR connection failed:", err)
    );
  }

  connectionToken = token;
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  void startConnection(connection);
  return connection;
}
