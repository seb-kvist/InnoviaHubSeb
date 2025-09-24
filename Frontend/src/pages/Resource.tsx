import { Link, useParams } from "react-router-dom";
import resourceData from "../data/resourceData";
import "../styles/Resource.css";
import Calendar from "../components/Calendar";
import { useEffect, useState } from "react";
import FreeSlots from "../components/FreeSlots";
import ResouceImageAndDate from "../components/ResourceImgAndDate";

const Resource = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { resourceId } = useParams<{ resourceId: string }>();
  const id = resourceId ? parseInt(resourceId, 10) : null;

  //Hitta resursen i vår data baserat på id
  const resource = resourceData.find((r) => r.id === id);

  // Lägg till bakgrundsfärg när komponenten mountas, ta bort när den unmountas
  useEffect(() => {
    document.body.classList.add("resourceBg");
    return () => {
      document.body.classList.remove("resourceBg");
    };
  }, []);

  return (
    <div className="resourcePage">
      <h2>{resource?.name}</h2>

      {/* Resursbild + kalender */}
      <div className="recourceImgAndDate">
        {resource?.imageUrl &&
          resource?.name &&
          selectedDate?.toLocaleDateString() && (
            <ResouceImageAndDate
              imgUrl={resource.imageUrl}
              imgAlt={resource.name}
              selectedDate={selectedDate.toLocaleDateString()}
            />
          )}
        <div className="calendar">
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            variant="full"
          />
        </div>
      </div>

      {/* Tidsslotts */}
      <div>
        <h3>Välj en tid för att boka</h3>
        {id && selectedDate && (
          <FreeSlots resourceId={id} date={selectedDate} />
        )}
      </div>
      
      {/* Other resources thumbnails */}
      <div className="otherResources">
        <h3>Andra resurser</h3>
        <div className="otherResources-grid">
          {resourceData
            .filter((r) => r.id !== id)
            .map((r) => (
              <Link
                key={r.id}
                to={r.path}
                className="otherResource-card"
                aria-label={r.name}>
                <img src={r.imageUrl} alt={r.name} />
                <span>{r.name}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default Resource;
