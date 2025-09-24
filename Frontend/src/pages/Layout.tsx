import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * Layout-komponenten fungerar som en "ram" för hela applikationen.
 * - Header och Footer renderas alltid.
 * - <Outlet /> renderar den aktuella sidans innehåll baserat på route.
 */

const Layout: React.FC = () => {
  // Håller koll på om användaren är inloggad (token i localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const location = useLocation(); // Används för att reagera på sidbyten
  const navigate = useNavigate(); // Används för att navigera vid utloggning

  // Uppdatera inloggningsstatus när route ändras (t.ex. efter login/logout)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Hanterar utloggning: rensar token och användardata och navigerar till login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");

    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      {/* Header visas på alla sidor och får inloggningsstatus + logout-funktion */}
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main>
        {/* Här visas den route du går till */}
        <Outlet />
      </main>
      {/* Footer visas på alla sidor */}
      <Footer />
    </>
  );
};

export default Layout;
