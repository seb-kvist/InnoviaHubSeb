import React, { useEffect, useState, useRef } from "react";
import { deleteBooking, getFilteredBookings } from "../api/api";
import Calendar from "./Calendar";
import { connection } from "../signalRConnection";

interface Booking {
  bookingId: number;
  userName: string;
  resourceName: string;
  date: string;
  timeSlot: string;
  status: boolean;
}

interface Props {
  token: string;
}

const BookingsTab: React.FC<Props> = ({ token }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  //  fetch bookings for selected date
  const fetchFilteredBookings = async () => {
    try {
      setLoading(true);
      const res = await getFilteredBookings(token, selectedDateRef.current);
      setFilteredBookings(res);
    } catch {
      setError("Kunde inte ladda bokningar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredBookings();
  }, [selectedDate, token]);

  //  setup SignalR once
  useEffect(() => {
    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
          console.log("Connected to BookingHub");
        }
      } catch (err) {
        console.error("SignalR error:", err);
      }
    };

    startConnection();

    const updateHandler = () => {
      getFilteredBookings(token, selectedDateRef.current).then(
        setFilteredBookings
      );
    };

    connection.on("ReceiveBookingUpdate", updateHandler);

    return () => {
      connection.off("ReceiveBookingUpdate", updateHandler);
    };
  }, [token]);

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna bokning?")) return;
    try {
      await deleteBooking(id, token);
      setFilteredBookings((prev) => prev.filter((b) => b.bookingId !== id));
    } catch {
      alert("Kunde inte ta bort bokningen. Försök igen senare.");
    }
  };

  if (loading) return <p>Laddar bokningar...</p>;
  if (error) return <p className="error">{error}</p>;

  const resourceImages = (resourceName: string): string => {
    if (resourceName.startsWith("VR Headset")) {
      return "./img/vrheadset.png";
    } else if (resourceName.startsWith("Drop-in skrivbord")) {
      return "./img/skrivbord.png";
    } else if (resourceName.startsWith("Mötesrum")) {
      return "./img/motesrum.png";
    } else if (resourceName.startsWith("AI Server")) {
      return "./img/aiserver.png";
    }
    return "/images/innovialogo.png"; //fall back bild om det inte funkar
  };

  return (
    <div className="bookings">
      <div className="calendar">
        <Calendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          variant="popup"
        />
      </div>
      {filteredBookings.length === 0 ? (
        <p>Inga bokningar hittades</p>
      ) : (
        filteredBookings.map((b) => (
          <div key={b.bookingId} className="booking-card">
            <img src={resourceImages(b.resourceName)} alt={b.resourceName} />
            <div className="booking-info">
              <p className="resource">{b.resourceName}</p>
              <p>Tid: {b.timeSlot}</p>
              <p>Bokad av: {b.userName}</p>
            </div>
            <div className="booking-actions">
              <button
                className="delete-btn"
                onClick={() => handleDeleteBooking(b.bookingId)}
              >
                TA BORT
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BookingsTab;
