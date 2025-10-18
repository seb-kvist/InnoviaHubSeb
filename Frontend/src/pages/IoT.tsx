import React, { useEffect } from "react";
import "../styles/IoT.css";
import SensorCard from "../components/SensorCard";

/**
 * IoT-sida för att visa sensorer och IoT-data från Innovia Hub
 * 
 * Denna sida visar olika typer av sensorer som:
 * - Temperatur- och luftkvalitetssensorer i mötesrum
 * - Rörelsesensorer i coworkingytor  
 * - Elförbrukningsmätare per resurs
 * - AI-server för bokningsbara beräkningstjänster
 * - Säkerhetsrelaterade sensorer i serverhall och poddstudio
 */

const IoT: React.FC = () => {
  // TODO: Implementera API-anrop när Sensor-API är tillgängligt
  useEffect(() => {
    // Placeholder för framtida API-integration
    // const fetchSensorData = async () => {
    //   try {
    //     const response = await fetch('/api/sensors');
    //     const data = await response.json();
    //     setSensorData(data);
    //   } catch (error) {
    //     console.error('Fel vid hämtning av sensordata:', error);
    //   }
    // };
    // fetchSensorData();
  }, []);

  // Sensor-konfigurationer med ikoner och beskrivningar
  const sensorTypes = [
    {
      id: "temperature-air",
      title: "Temperatur och luftkvalitet",
      description: "Övervakar temperatur och luftkvalitet i mötesrum",
      icon: "🌡️",
      placeholder: "Data kommer från Sensor-API...",
      location: "Mötesrum"
    },
    {
      id: "motion",
      title: "Rörelsesensorer",
      description: "Detekterar rörelse och aktivitet i coworkingytor",
      icon: "👥",
      placeholder: "Data kommer från Sensor-API...",
      location: "Coworkingytor"
    },
    {
      id: "power-consumption",
      title: "Elförbrukningsmätare",
      description: "Mäter elförbrukning per resurs och utrustning",
      icon: "⚡",
      placeholder: "Data kommer från Sensor-API...",
      location: "Alla resurser"
    },
    {
      id: "ai-server",
      title: "AI-server",
      description: "Övervakar bokningsbara beräkningstjänster och prestanda",
      icon: "🤖",
      placeholder: "Data kommer från Sensor-API...",
      location: "AI Server"
    },
    {
      id: "security",
      title: "Säkerhetssensorer",
      description: "Övervakar säkerhet i serverhall och poddstudio",
      icon: "🔒",
      placeholder: "Data kommer från Sensor-API...",
      location: "Serverhall & Poddstudio"
    }
  ];

  return (
    <div className="iot-container">
      <header className="iot-header">
        <h1>IoT Dashboard</h1>
        <p>Övervaka sensorer och IoT-enheter i Innovia Hub</p>
      </header>

      <div className="iot-grid">
        {sensorTypes.map((sensor) => (
          <SensorCard
            key={sensor.id}
            title={sensor.title}
            description={sensor.description}
            icon={sensor.icon}
            placeholder={sensor.placeholder}
            location={sensor.location}
            loading={false}
          />
        ))}
      </div>

    </div>
  );
};

export default IoT;
