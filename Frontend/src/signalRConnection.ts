import * as signalR from "@microsoft/signalr";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const hubUrl = `${apiBaseUrl.replace(/\/api$/, "")}/bookingHub`;

let connection: signalR.HubConnection | null = null;

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
  if (
    connection &&
    connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  void startConnection(connection);
  return connection;
}
