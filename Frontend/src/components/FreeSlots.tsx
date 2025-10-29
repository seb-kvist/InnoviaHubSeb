import { useCallback, useEffect, useState } from "react";
import type { FreeSlotsProps } from "../Interfaces/Props";
import { useNavigate } from "react-router-dom";
import { getFreeSlots } from "../api/api";
import { getConnection } from "../signalRConnection";

const FreeSlots = ({ resourceId, date }: FreeSlotsProps) => {
  const allSlots = ["08-10", "10-12", "12-14", "14-16", "16-18", "18-20"];
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isBookable, setIsBookable] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Normalize date to YYYY-MM-DD once
  const normalizedDate =
    date instanceof Date
      ? date.toISOString().split("T")[0]
      : new Date(date).toISOString().split("T")[0];

  // Hämta tillgängliga slots från API
  const fetchSlots = useCallback(async () => {
    if (!token) return;
    try {
      const slots = await getFreeSlots(normalizedDate, resourceId, token);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Kunde inte hämta slots", error);
    }
  }, [normalizedDate, resourceId, token]);

  // Fetch slots när komponenten mountas eller dependencies ändras
  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

  // Lyssna på SignalR-uppdateringar och refetcha
  useEffect(() => {
    if (!token) return;
    const conn = getConnection(token);
    const handler = (update: { resourceId: number; isBookable: boolean }) => {
      setIsBookable(update.isBookable);
      console.log(update.isBookable);
    };
    conn.on("ReceiveResourceStatusUpdate", handler);
    return () => {
      conn.off("ReceiveResourceStatusUpdate", handler);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const conn = getConnection(token);
    const handler = (update: any) => {
      try {
        const updateDate = typeof update?.date === "string" ? update.date : "";
        const updateSlot = update?.timeSlot as string | undefined;
        
        // Om samma datum → ta bort sloten direkt
        if (updateDate === normalizedDate && updateSlot) {
          setAvailableSlots((prev) => prev.filter((s) => s !== updateSlot));
        }
      } catch (err) {
        console.log(err);
      }
      void fetchSlots();
    };

    conn.on("ReceiveBookingUpdate", handler);
    return () => {
      conn.off("ReceiveBookingUpdate", handler);
    };
  }, [fetchSlots, normalizedDate, token]);

   // Kontrollera om sloten är i framtiden
  const isFutureSlot = (slot: string) => {
    const [startHour, endHour] = slot.split("-").map(Number);
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];
    if (normalizedDate !== today) return true;

    // om datumet är idag jämför sluttiden
    return now.getHours() < endHour;
  };

  return (
    <div className="slotsHolder">
      {allSlots.map((slot) => {
        const isAvailable = availableSlots.includes(slot);
        const isFuture = isFutureSlot(slot);
        const canBook = isAvailable && isFuture && isBookable;
        return (
          <div
            key={slot}
            className={canBook ? "isAvailable" : "notAvailable"}
            onClick={() =>
              canBook &&
              navigate(`/booking/${resourceId}/${normalizedDate}/${slot}`)
            }>
            {slot}
          </div>
        );
      })}
    </div>
  );
};

export default FreeSlots;
