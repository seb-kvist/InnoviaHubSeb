import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css"; 

// Props för Header-komponenten
interface HeaderProps {
    isLoggedIn: boolean; // Om användaren är inloggad eller inte
    onLogout?: () => void;
}

// Header-komponenten som visar logo, adminknapp (för admins) och resterande knappar
const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout}) => {
    const navigate = useNavigate(); 

    // Hämta roll från localStorage och avgör om användaren är admin
    const role = (typeof window !== "undefined" ? localStorage.getItem("role") : null) || "";
    const isAdmin = role.toLowerCase() === "admin";

    return (
        <header className="header"> 
            <nav className="header-nav">
    {/* Adminpanel-knapp (visas endast för admin) */}
    {isAdmin && (
      <button
        className="btn-back"
        onClick={() => navigate("/admin")}
      >
        Adminpanel
      </button>
    )}

    {/* Logo */}
    <div className="header-logo">
      <Link to="/">
        <img
          src="/img/innovialogo.png"
          alt="Innovia Hub logo"
          className="logo-img"
        />
      </Link>
    </div>

    {/* Högerställda knappar (inloggnings-/profilflöde) */}
    <div className="header-buttons">
      {!isLoggedIn ? (
        <>
          <Link to="/login" state={{ mode: "login" }} className="btn-login">Logga in</Link>
          <Link to="/login" state={{ mode: "register" }} className="btn-register">Registrera</Link>
        </>
      ) : (
        <>
          <Link to="/profile" className="btn-profile">Min profil</Link>
          <button className="btn-logout" onClick={onLogout}>Logga ut</button>
        </>
      )}
    </div>
  </nav>
        </header>
    );
};

export default Header;