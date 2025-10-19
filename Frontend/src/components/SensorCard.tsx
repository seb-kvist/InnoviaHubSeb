import React from "react";

/**
 * Props för SensorCard-komponenten
 */
interface SensorCardProps {
  title: string;           // Titeln på sensorn (t.ex. "Temperatur och luftkvalitet")
  description: string;      // Beskrivning av vad sensorn gör
  placeholder: string;     // Placeholder-text för när data inte är tillgänglig
  loading?: boolean;      // Om data laddas
}

/**
 * Återanvändbar komponent för att visa sensorinformation
 * 
 * Denna komponent skapar en kort för varje sensortyp med:
 * - Titel och beskrivning
 * - Placeholder för framtida sensordata
 */
const SensorCard: React.FC<SensorCardProps> = ({
  title,
  description,
  placeholder,
  loading = false
}) => {
  return (
    <div className="sensor-card">
      <div className="sensor-card-header">
        <h3 className="sensor-title">{title}</h3>
      </div>
      
      <div className="sensor-card-body">
        <p className="sensor-description">{description}</p>
        
        <div className="sensor-data">
          {loading ? (
            <div className="loading-indicator">
              <span>Laddar...</span>
            </div>
          ) : (
            <div className="data-placeholder">
              <span>{placeholder}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
