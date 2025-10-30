import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FreeSlotsProps } from "../Interfaces/Props";
import { useNavigate } from "react-router-dom";
import { getFreeSlots } from "../api/api";
import { getConnection } from "../signalRConnection";
import resourceData from "../data/resourceData";

type BookingHubUpdate = {
  date?: string;
  timeSlot?: string;
  resourceName?: string;
};

const FreeSlots = ({ resourceId, date }: FreeSlotsProps) => {
  const allSlots = useMemo(
    () => ["08-10", "10-12", "12-14", "14-16", "16-18", "18-20"],
    []
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isBookable, setIsBookable] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const latestFetchId = useRef(0);

  const resourceTypeName = useMemo(
    () => resourceData.find((r) => r.id === resourceId)?.name ?? "",
    [resourceId]
  );

  const normalizedDate =
    date instanceof Date
      ? date.toISOString().split("T")[0]
      : new Date(date).toISOString().split("T")[0];

  const matchesCurrentResource = useCallback(
    (resourceName?: string) => {
      if (!resourceTypeName) return true;
      return Boolean(
        resourceName &&
          resourceName.toLowerCase().startsWith(resourceTypeName.toLowerCase())
      );
    },
    [resourceTypeName]
  );

  const fetchSlots = useCallback(async () => {
    if (!token) return;
    const requestId = ++latestFetchId.current;
    try {
      const slots = await getFreeSlots(normalizedDate, resourceId, token);
      if (requestId === latestFetchId.current) {
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Could not fetch slots", error);
    }
  }, [normalizedDate, resourceId, token]);

  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

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
    const handler = (update: BookingHubUpdate) => {
      try {
        const updateDate = typeof update?.date === "string" ? update.date : "";
        const updateSlot = update?.timeSlot as string | undefined;

        if (!matchesCurrentResource(update.resourceName)) {
          return;
        }

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
  }, [fetchSlots, matchesCurrentResource, normalizedDate, token]);

  useEffect(() => {
    if (!token) return;
    const conn = getConnection(token);
    const handler = (update: BookingHubUpdate) => {
      try {
        const updateDate = typeof update?.date === "string" ? update.date : "";
        const updateSlot = update?.timeSlot as string | undefined;

        if (!matchesCurrentResource(update.resourceName)) {
          return;
        }

        if (updateDate === normalizedDate && updateSlot) {
          setAvailableSlots((prev) => {
            if (prev.includes(updateSlot)) {
              return prev;
            }
            return [...prev, updateSlot].sort(
              (a, b) => allSlots.indexOf(a) - allSlots.indexOf(b)
            );
          });
        }
      } catch (err) {
        console.error(err);
      }
      void fetchSlots();
    };

    conn.on("ReceiveDeleteBookingUpdate", handler);
    return () => {
      conn.off("ReceiveDeleteBookingUpdate", handler);
    };
  }, [allSlots, fetchSlots, matchesCurrentResource, normalizedDate, token]);

  const isFutureSlot = (slot: string) => {
    const [startHour, endHour] = slot.split("-").map(Number);
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];
    if (normalizedDate !== today) return true;
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
            }
          >
            {slot}
          </div>
        );
      })}
    </div>
  );
};

export default FreeSlots;

