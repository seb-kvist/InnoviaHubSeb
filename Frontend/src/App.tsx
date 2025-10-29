import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Resource from "./pages/Resource";
import IoT from "./pages/IoT";
import Layout from "./pages/Layout"; // "ram" med Header + Footer
import Login from "./pages/Login";
import ProtectedRoute from "./components/protectedRoute";
import { useEffect, useState } from "react";

function App() {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    try {
      setToken(localStorage.getItem("token"));
    } catch (error) {
      console.error("Error loading token:", error);
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [location]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              {token ? <Admin token={token} /> : <div>Loading...</div>}
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:resourceId/:date/:slot"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/iot"
          element={
            <ProtectedRoute>
              <IoT />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource/:resourceId"
          element={
            <ProtectedRoute>
              <Resource />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
