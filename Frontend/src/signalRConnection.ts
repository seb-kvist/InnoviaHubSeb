import * as signalR from "@microsoft/signalr";

const token = localStorage.getItem("token");
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const hubUrl = `${apiBaseUrl.replace(/\/api$/, "")}/bookingHub`;

export const connection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, {
    accessTokenFactory: () => token || "",
  })
  .withAutomaticReconnect()
  .build();
