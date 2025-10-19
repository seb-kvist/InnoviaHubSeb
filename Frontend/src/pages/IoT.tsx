import React, { useEffect, useState } from "react";
import "../styles/IoT.css";
import SensorCard from "../components/SensorCard";

/**
 * IoT-sida för att visa sensorer och IoT-data från Innovia Hub
 * 
 * Denna sida visar olika typer av sensorer som:
 * - Temperatursensorer i mötesrum Alpha, Beta och Charlie
 * - CO2-sensorer i mötesrum Alpha, Beta och Charlie
 * - Luftfuktighetssensorer i mötesrum Alpha, Beta och Charlie
 * - Rörelsesensor i Lobby
 */

const IoT: React.FC = () => {
  // State för att hantera vilka sensortyper som är expanderade
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

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

  // Funktion för att växla expanderad status för en sensortyp
  const toggleExpanded = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  // Grupperade sensorer per typ
  const sensorGroups = {
    temperature: {
      title: "Temperatursensorer",
      description: "Övervakar temperatur i mötesrum",
      icon: "🌡️",
      sensors: [
        {
          id: "temp-roomalpha",
          title: "Temp Mötesrum Alpha",
          description: "Temperatursensor i mötesrum Alpha",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_temp_roomalpha",
          model: "Toshi-Maestro-Temp-333",
          serial: "toshi001"
        },
        {
          id: "temp-roombeta",
          title: "Temp Mötesrum Beta",
          description: "Temperatursensor i mötesrum Beta",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_temp_roombeta",
          model: "Toshi-Maestro-Temp-666",
          serial: "toshi002"
        },
        {
          id: "temp-roomcharlie",
          title: "Temp Mötesrum Charlie",
          description: "Temperatursensor i mötesrum Charlie",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_temp_roomcharlie",
          model: "Toshi-Maestro-Temp-999",
          serial: "toshi003"
        }
      ]
    },
    co2: {
      title: "CO₂-sensorer",
      description: "Övervakar CO2-nivåer i mötesrum",
      icon: "💨",
      sensors: [
        {
          id: "co2-roomalpha",
          title: "CO₂ Mötesrum Alpha",
          description: "CO2 sensor i mötesrum Alpha",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_co2_roomalpha",
          model: "Toshi-Maestro-CO2-33",
          serial: "toshi004"
        },
        {
          id: "co2-roombeta",
          title: "CO₂ Mötesrum Beta",
          description: "CO2 sensor i mötesrum Beta",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_co2_roombeta",
          model: "Toshi-Maestro-CO2-66",
          serial: "toshi005"
        },
        {
          id: "co2-roomcharlie",
          title: "CO₂ Mötesrum Charlie",
          description: "CO2 sensor i mötesrum Charlie",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_co2_roomcharlie",
          model: "Toshi-Maestro-CO2-99",
          serial: "toshi006"
        }
      ]
    },
    humidity: {
      title: "Luftfuktighetssensorer",
      description: "Övervakar luftfuktighet i mötesrum",
      icon: "💧",
      sensors: [
        {
          id: "humidity-roomalpha",
          title: "Luftfuktighet Mötesrum Alpha",
          description: "Luftfuktighetssensor i mötesrum Alpha",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_humidity_roomalpha",
          model: "Toshi-Maestro-Humidity-3",
          serial: "toshi007"
        },
        {
          id: "humidity-roombeta",
          title: "Luftfuktighet Mötesrum Beta",
          description: "Luftfuktighetssensor i mötesrum Beta",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_humidity_roombeta",
          model: "Toshi-Maestro-Humidity-6",
          serial: "toshi008"
        },
        {
          id: "humidity-roomcharlie",
          title: "Luftfuktighet Mötesrum Charlie",
          description: "Luftfuktighetssensor i mötesrum Charlie",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_humidity_roomcharlie",
          model: "Toshi-Maestro-Humidity-9",
          serial: "toshi009"
        }
      ]
    },
    motion: {
      title: "Rörelsesensorer",
      description: "Detekterar rörelse och aktivitet",
      icon: "👥",
      sensors: [
        {
          id: "motion-lobby",
          title: "Rörelsesensor Lobby",
          description: "Rörelsesensor i Lobby",
          placeholder: "Data kommer från Sensor-API...",
          deviceId: "device_id_motion_lobby",
          model: "Ihsot-Maestro-Motion-1337",
          serial: "toshi010"
        }
      ]
    }
  };

  return (
    <div className="iot-container">
      <header className="iot-header">
        <h1>IoT Dashboard</h1>
        <p>Övervaka sensorer och IoT-enheter i Innovia Hub</p>
      </header>

      <div className="sensor-groups">
        {Object.entries(sensorGroups).map(([type, group]) => (
          <div key={type} className="sensor-group">
            <div 
              className="sensor-group-header"
              onClick={() => toggleExpanded(type)}
            >
              <div className="sensor-group-title">
                <h3>{group.title}</h3>
              </div>
              <div className="sensor-group-count">
                {group.sensors.length} sensor{group.sensors.length !== 1 ? 'er' : ''}
              </div>
              <div className={`expand-icon ${expandedTypes.has(type) ? 'expanded' : ''}`}>
                ▼
              </div>
            </div>
            
            {expandedTypes.has(type) && (
              <div className="sensor-group-content">
                <p className="sensor-group-description">{group.description}</p>
                <div className="sensor-list">
                  {group.sensors.map((sensor) => (
                    <SensorCard
                      key={sensor.id}
                      title={sensor.title}
                      description={sensor.description}
                      placeholder={sensor.placeholder}
                      loading={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default IoT;
