import React, { useState } from "react";
import type { User, Booking } from "../Interfaces/types";
import { getUserBookings, deleteUserById, deleteBooking } from "../api/api";

interface UserCardProps {
  user: User;
  onDelete: (id: string, token: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
  const [userBookings, setUserBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookings, setShowBookings] = useState(false);

  const handleFetchBookings = async () => {
    // Toggle off if already shown
    if (showBookings) {
      setShowBookings(false);
      return;
    }

    // If bookings already fetched, just show them
    if (userBookings) {
      setShowBookings(true);
      return;
    }

    // Otherwise fetch bookings
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token")!;
      const bookings = await getUserBookings(user.id, token);
      setUserBookings(bookings);
      setShowBookings(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );
    if (!confirmed) return; // exit if user clicked "Cancel"
    try {
      const token = localStorage.getItem("token")!;
      deleteUserById(user.id, token).then(() => onDelete(user.id, token));
      alert("User deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const handleDeleteBooking = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token")!;
      await deleteBooking(id, token);

      setUserBookings((prev) =>
        prev ? prev.filter((b) => b.bookingId !== id) : []
      );
      alert("Booking deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete booking");
    }
  };

  return (
    <>
      <div
        onClick={handleFetchBookings}
        className={`user-card ${showBookings ? "activeShowBookings" : ""}`}
      >
        <img src="/img/profile.png" />
        <p>{user.name}</p>
        <button
          onClick={() => {
            handleDeleteUser();
          }}
          className="delete-btn"
        >
          Ta bort
        </button>
      </div>
      <div className={`userBookings ${showBookings ? "show" : ""}`}>
        {showBookings && (
          <>
            <div>
              <h3>Bookings:</h3>
              <p>{user.email}</p>
            </div>
            {loading ? (
              <p>Loading bookings...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : userBookings && userBookings.length > 0 ? (
              <ul>
                {userBookings.map((booking) => (
                  <li key={booking.bookingId}>
                    {booking.resourceName} — {booking.date}
                    <button
                      className="deleteBookingBtn"
                      onClick={() => {
                        handleDeleteBooking(booking.bookingId);
                      }}
                    >
                      🗑
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="noBookings">No bookings</p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserCard;
