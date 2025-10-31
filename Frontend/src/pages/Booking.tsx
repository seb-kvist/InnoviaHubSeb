import { useNavigate, useParams } from "react-router-dom";
import ResourceImgAndDate from "../components/ResourceImgAndDate";
import resourceData from "../data/resourceData";
import "../styles/Booking.css";
import { useEffect, useState } from "react";
import { createBooking, getFreeSlots } from "../api/api";
import { getConnection } from "../signalRConnection";

const Booking = () => {
  const { resourceId, date, slot } = useParams();
  const resource = resourceData.find((r) => r.id === Number(resourceId));
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const navigate = useNavigate();
  const normalizedDate = date
    ? new Date(date).toISOString().slice(0, 10)
    : "";

  useEffect(() => {
    if (!token || !resourceId || !slot || !normalizedDate) return;

    const verifyAvailability = async () => {
      try {
        const slots = await getFreeSlots(
          normalizedDate,
          Number(resourceId),
          token
        );
        const stillAvailable = slots.includes(slot);
        setIsSlotAvailable(stillAvailable);
        if (!stillAvailable) {
          setErrorMessage("Denna tid är redan bokad. Välj en annan tid.");
        }
      } catch (err) {
        console.error("Kunde inte verifiera slotens tillgänglighet", err);
      }
    };

    void verifyAvailability();
  }, [normalizedDate, resourceId, slot, token]);

  useEffect(() => {
    if (!token || !normalizedDate || !slot || !resourceId) return;
    const conn = getConnection(token);

    const matchesCurrentBooking = (update: any) => {
      if (!update) return false;
      const updateSlot =
        typeof update.timeSlot === "string" ? update.timeSlot : "";
      const updateDate = typeof update.date === "string" ? update.date : "";
      const updateResourceName =
        typeof update.resourceName === "string" ? update.resourceName : "";

      const resourceNameMatches = resource?.name
        ? updateResourceName.toLowerCase().startsWith(
            resource.name.toLowerCase()
          )
        : true;

      return (
        updateSlot === slot &&
        updateDate === normalizedDate &&
        resourceNameMatches
      );
    };

    const handleBookingUpdate = (update: any) => {
      if (!matchesCurrentBooking(update)) return;
      setIsSlotAvailable(false);
      setErrorMessage("");
    };

    const handleDeleteUpdate = (update: any) => {
      if (!matchesCurrentBooking(update)) return;
      setIsSlotAvailable(true);
      setErrorMessage("");
    };

    conn.on("ReceiveBookingUpdate", handleBookingUpdate);
    conn.on("ReceiveDeleteBookingUpdate", handleDeleteUpdate);

    return () => {
      conn.off("ReceiveBookingUpdate", handleBookingUpdate);
      conn.off("ReceiveDeleteBookingUpdate", handleDeleteUpdate);
    };
  }, [normalizedDate, resource?.name, resourceId, slot, token]);

  // Funktion för att skapa bokning
  const completeReservation = async () => {
    if (!userId || !date || !slot || !resourceId || !token) {
      return;
    }
    if (!isSlotAvailable) {
      setErrorMessage("Denna tid är inte längre tillgänglig.");
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
        setIsSlotAvailable(false);
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
            disabled={isLoading || !isSlotAvailable}
          >
            {isLoading
              ? "Reserverar..."
              : !isSlotAvailable
              ? "Inte tillgänglig"
              : "Reservera"}
          </button>

          {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};
export default Booking;
