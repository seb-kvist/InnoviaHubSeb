// src/pages/IoT.tsx
import React, { useEffect, useState } from "react";
import "../styles/IoT.css";
import * as signalR from "@microsoft/signalr";

// Interface för sensor-objekt som beskriver strukturen av sensordata
interface Sensor {
  id: string;
  name: string;
  type: string;
  value: number | string;
  unit?: string;
  description?: string;
}

// API-konfiguration och konstanter
const API_BASE = "http://localhost:5022/api/IoT";
const HUB_URL = "http://localhost:5022/iothub";
const TENANT_SLUG = "sebastians-hub"; // Måste matcha Backend: InnoviaIot:TenantSlug

const IoT: React.FC = () => {
  // State för att hantera sensordata, laddningsstatus och anslutningsstatus
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  // Alla kort visas alltid expanderade

  // Funktion för att hämta initial sensordata från backend API
  const fetchData = async () => {
    try {
      // Hämta JWT från localStorage och skicka som Bearer
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/devices`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Device request failed with status ${res.status}`);
      }

      const devices = await res.json();
      if (!Array.isArray(devices) || devices.length === 0) {
        setSensors([]);
        return;
      }

      // För varje enhet, hämta senaste mätvärde och skapa sensor-objekt
      const deviceData = await Promise.all(
        devices.map(async (device: any) => {
          const latestRes = await fetch(`${API_BASE}/devices/${device.id}/latest`);
          let latest: any = null;
          if (latestRes.ok) {
            try {
              latest = await latestRes.json();
            } catch (jsonErr) {
              console.warn("Kunde inte tolka latest-respons:", jsonErr);
            }
          }

          // Beräkna beskrivning som inte duplicerar namnet
          const computedName = device.name || device.model || device.serial || "Okänd sensor";
          const descCandidate = (device.description ?? device.model ?? device.serial ?? "").toString();
          const description = descCandidate && descCandidate !== computedName ? descCandidate : "";

          return {
            id: device.id,
            name: computedName,
            type: latest?.type || "unknown",
            value: latest?.value ?? "-",
            unit:
              latest?.type === "temperature"
                ? "°C"
                : latest?.type === "humidity"
                ? "%"
                : latest?.type === "co2"
                ? "ppm"
                : "",
            description,
          };
        })
      );

      setSensors(deviceData);
    } catch (err) {
      console.error("Kunde inte hämta sensordata:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect som körs när komponenten mountas - sätter upp SignalR-anslutning och hämtar data
  useEffect(() => {
    fetchData();

    // Skapa SignalR-anslutning till IoT-hubben
    const token = localStorage.getItem("token");
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || "",
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Starta anslutning och gå med i tenant-grupp
    connection
      .start()
      .then(async () => {
        console.log("✅ Ansluten till IoTHub!");
        setConnectionStatus("Connected");
        try {
          await connection.invoke("JoinTenant", TENANT_SLUG);
          console.log(`👥 Joined tenant group: ${TENANT_SLUG}`);
          setConnectionStatus(`Connected to ${TENANT_SLUG}`);
        } catch (e) {
          console.error("❌ Failed to join tenant group:", e);
          setConnectionStatus("Connected (group join failed)");
        }
      })
      .catch((err) => {
        console.error("❌ Misslyckades ansluta till IoTHub:", err);
        setConnectionStatus("Connection failed");
      });

    // Hantera anslutningsstatusändringar
    connection.onclose(() => {
      console.log("🔌 SignalR connection closed");
      setConnectionStatus("Disconnected");
    });

    connection.onreconnecting(() => {
      console.log("🔄 SignalR reconnecting...");
      setConnectionStatus("Reconnecting...");
    });

    connection.onreconnected(() => {
      console.log("✅ SignalR reconnected");
      setConnectionStatus("Reconnected");
      // Gå med i tenant-grupp igen efter återanslutning
      connection.invoke("JoinTenant", TENANT_SLUG).catch(e => 
        console.error("❌ Failed to rejoin tenant group:", e)
      );
    });

    // Lyssna på nya mätningar från backend och uppdatera sensorvärden
    connection.on("measurementReceived", (payload: any) => {
      console.log("📡 Ny mätning:", payload);
      console.log("🔍 Current sensors:", sensors.map(s => ({ id: s.id, name: s.name })));

      setSensors((prevSensors) => {
        console.log("🔄 Updating sensors, looking for deviceId:", payload.deviceId);
        
        const updated = prevSensors.map((s) => {
          if (s.id === payload.deviceId) {
            console.log("✅ Found matching sensor:", s.name, "updating with:", payload);
            return {
              ...s,
              value: payload.value,
              type: payload.type,
              unit:
                payload.type === "temperature"
                  ? "°C"
                  : payload.type === "humidity"
                  ? "%"
                  : payload.type === "co2"
                  ? "ppm"
                  : payload.type === "motion"
                  ? ""
                  : "",
            };
          }
          return s;
        });
        
        console.log("📊 Updated sensors:", updated.map(s => ({ id: s.id, name: s.name, value: s.value })));
        return updated;
      });
    });

    // Cleanup-funktion som stänger anslutningen när komponenten unmountas
    return () => {
      connection.stop();
    };
  }, []);

  // Enkel rollkontroll - samma som adminpanelen
  const role = (typeof window !== "undefined" ? localStorage.getItem("role") : null) || "";
  const isAdmin = role.toLowerCase() === "admin";

  if (!isAdmin) {
    return null; // Dölj sidan helt för icke-admin
  }

  if (loading) return <p>Laddar sensordata...</p>;

  // Definiera sensor-typer som ska visas i kort
  const types = [
    { key: "temperature", title: "Temperature" },
    { key: "co2", title: "CO₂" },
    { key: "humidity", title: "Humidity" },
    { key: "motion", title: "Motion" },
  ] as const;

  // Gruppera sensorer efter typ för att visa i rätt kort
  const grouped: Record<string, Sensor[]> = sensors.reduce((acc, s) => {
    const k = s.type || "unknown";
    acc[k] = acc[k] || [];
    acc[k].push(s);
    return acc;
  }, {} as Record<string, Sensor[]>);

  // Rendera IoT-sidan med sensor-kort
  return (
    <div className="iot-page">
      <h2>Sensorer</h2>
      <div className="connection-status">
        Status: {connectionStatus}
      </div>

      <div className="sensor-grid">
        {types.map(t => (
          <div key={t.key} className="sensor-type-card">
            <div className="sensor-type-header">
              <div className="sensor-type-header-content">
                <div className="sensor-type-title-group">
                  <h3 className="sensor-type-title">{t.title}</h3>
                </div>
                <span className="sensor-count">{grouped[t.key]?.length ?? 0} sensorer</span>
              </div>
            </div>
            
            <div className="sensor-list">
              {(grouped[t.key] ?? []).map(s => (
                <div key={s.id} className="sensor-item">
                  <div className="sensor-details">
                    <div className="sensor-name">{s.name}</div>
                    <div className="sensor-description">
                      {s.description ? `${s.type} • ${s.description}` : s.type}
                    </div>
                  </div>
                  <div className="sensor-value">
                    {s.value}{typeof s.value === 'number' ? ` ${s.unit ?? ''}` : ''}
                  </div>
                </div>
              ))}
              {(grouped[t.key]?.length ?? 0) === 0 && (
                <div className="empty-state">
                  Inga sensorer av typen {t.title}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IoT;
