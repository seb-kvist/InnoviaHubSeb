// src/components/SensorCard.tsx
import React from "react";
import "../styles/IoT.css";

interface SensorCardProps {
  name: string;
  type: string;
  value: number | string;
  unit?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ name, type, value, unit }) => {
  return (
    <div className="sensor-card">
      <h3 className="sensor-name">{name}</h3>
      <p className="sensor-type">{type}</p>
      <div className="sensor-value">
        {value} {unit}
      </div>
    </div>
  );
};

export default SensorCard;
