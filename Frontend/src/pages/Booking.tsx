import { useNavigate, useParams } from "react-router-dom";
import ResourceImgAndDate from "../components/ResourceImgAndDate";
import resourceData from "../data/resourceData";
import "../styles/Booking.css";
import { useEffect, useState } from "react";
import { createBooking } from "../api/api";

const Booking = () => {
  const { resourceId, date, slot } = useParams();
  const resource = resourceData.find((r) => r.id === Number(resourceId));
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Funktion för att skapa bokning
  const completeReservation = async () => {
    if (!userId || !date || !slot || !resourceId || !token) {
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Skicka ISO-datum (yyyy-MM-dd) om möjligt
      const isoDate = new Date(date).toISOString().slice(0, 10);

      await createBooking(
        {
          date: isoDate,
          timeSlot: slot,
          resourceTypeId: Number(resourceId),
          userId,
        },
        token
      );

      // visar en alert för att bekräfta bokningen
      alert(
        "Bokningen lyckades! Du kommer nu att omdirigeras till dina bokningar."
      );

      // navigerar till profilsidan
      navigate("/profile");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setErrorMessage("Denna tid är redan bokad. Välj en annan tid.");
      } else {
        setErrorMessage("Något gick fel vid bokningen. Försök igen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Lägg till bakgrund när komponenten mountas
  useEffect(() => {
    document.body.classList.add("resourceBg");
    return () => {
      document.body.classList.remove("resourceBg");
    };
  }, []);
  if (!resource) return <p>Resurs hittades inte</p>;

  return (
    <div className="bookingPage">
      <h2 className="resourceName">Boka {resource.name}</h2>

      <div className="recourceImgAndDate">
        {/* Bild och datum */}
        <ResourceImgAndDate
          imgUrl={resource.imageUrl}
          imgAlt={resource.name}
          selectedDate={date!}
        />

        {/* Bokningsinfo och knapp */}
        <div className="bookingDescription">
          <p>{resource.description}</p>
          <div className="bookingInfo">
            <p>Datum: {date}</p>
            <p>Tid: {slot}</p>
            <p>Namn:{userName} </p>
          </div>
          <button
            className=" formBtn reserveBtn"
            onClick={completeReservation}
            disabled={isLoading}
          >
            {isLoading ? "Reserverar..." : "Reservera"}
          </button>

          {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};
export default Booking;
