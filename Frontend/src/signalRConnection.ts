import * as signalR from "@microsoft/signalr";

const token = localStorage.getItem("token");

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5022/bookingHub", {
    accessTokenFactory: () => token || ""
  })
  .withAutomaticReconnect()
  .build();
