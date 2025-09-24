import Hero from "../components/Hero";
import ResourceCards from "../components/RecourceCards";
import { useEffect, useState } from "react";

// Landningssidan som visar hero-sektionen och resurskorten
const LandingPage: React.FC = () => {
  // Håller koll på om användaren är inloggad (utifrån om token finns i localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Kollar vid mount om det finns en token och uppdaterar inloggningsstatus
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero visar titel, intro och CTA (om ej inloggad) */}
      <Hero isLoggedIn={isLoggedIn} />
      {/* ResourceCards visar alla resurser och rätt knapp beroende på inloggad status */}
      <ResourceCards isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default LandingPage;