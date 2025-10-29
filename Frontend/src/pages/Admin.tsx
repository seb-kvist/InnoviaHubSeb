import React, { useState, useEffect } from "react";
import "../styles/admin.css";
import BookingsTab from "../components/BookingsTab";
import UsersTab from "../components/UsersTab";
import ResourcesTab from "../components/ResourcesTab";
import { getConnection } from "../signalRConnection";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AdminProps {
  token: string;
}

const Admin: React.FC<AdminProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const page = localStorage.getItem("activePage");
    if (page) {
      setActiveTab(page);
    }
    document.body.classList.add("adminBg");
    return () => {
      document.body.classList.remove("adminBg");
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const conn = getConnection(token);
    const bookingHandler = (update: any) => {
      toast.info(
        `en ${update.resourceName} har blivit bokad på ${update.date} under ${update.timeSlot}`
      );
      console.log(update);
    };
    const deleteHandler = (update: any) => {
      toast.info(
        `en ${update.resourceName} har blivit Avbokad på ${update.date} under ${update.timeSlot}`
      );
      console.log(update);
    };
    conn.on("ReceiveBookingUpdate", bookingHandler);
    conn.on("ReceiveDeleteBookingUpdate", deleteHandler);
    return () => {
      conn.off("ReceiveBookingUpdate", bookingHandler);
      conn.off("ReceiveDeleteBookingUpdate", deleteHandler);
    };
  }, [token]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="adminHeaderHolder">
        <header className="header">
          <div>
            <h1>Adminpanel</h1>
          </div>
        </header>
      </div>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("bookings");
            localStorage.setItem("activePage", "bookings");
          }}>
          BOKNINGAR
        </button>
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            localStorage.setItem("activePage", "users");
          }}>
          ANVÄNDARE
        </button>
        <button
          className={`tab ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("resources");
            localStorage.setItem("activePage", "resources");
          }}>
          RESURSER
        </button>
      </nav>

      <div className="content">
        {activeTab === "bookings" && <BookingsTab token={token} />}
        {activeTab === "users" && <UsersTab token={token} />}
        {activeTab === "resources" && <ResourcesTab token={token} />}
      </div>
    </div>
  );
};

export default Admin;
