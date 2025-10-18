import React from "react";

/**
 * Props för SensorCard-komponenten
 */
interface SensorCardProps {
  title: string;           // Titeln på sensorn (t.ex. "Temperatur och luftkvalitet")
  description: string;      // Beskrivning av vad sensorn gör
  icon: string;            // Emoji eller ikon för sensorn
  placeholder: string;     // Placeholder-text för när data inte är tillgänglig
  location: string;        // Var sensorn befinner sig
  loading?: boolean;      // Om data laddas
}

/**
 * Återanvändbar komponent för att visa sensorinformation
 * 
 * Denna komponent skapar en kort för varje sensortyp med:
 * - Titel och beskrivning
 * - Ikon för visuell representation
 * - Plats där sensorn befinner sig
 * - Placeholder för framtida sensordata
 */
const SensorCard: React.FC<SensorCardProps> = ({
  title,
  description,
  icon,
  placeholder,
  location,
  loading = false
}) => {
  return (
    <div className="sensor-card">
      <div className="sensor-card-header">
        <div className="sensor-icon">{icon}</div>
        <h3 className="sensor-title">{title}</h3>
      </div>
      
      <div className="sensor-card-body">
        <p className="sensor-description">{description}</p>
        <div className="sensor-location">
          <span className="location-label">Plats:</span>
          <span className="location-value">{location}</span>
        </div>
        
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
