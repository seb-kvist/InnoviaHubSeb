import React from "react";
import "../styles/Hero.css";
import { Link } from "react-router-dom";

// Props för Hero-komponenten
interface HeroProps {
    isLoggedIn: boolean; // Styr om call-to-action-knappen ska visas
}

// Hero-sektion på landningssidan
// Visar titel, beskrivning och en CTA när användaren inte är inloggad
const Hero: React.FC<HeroProps> = ({ isLoggedIn }) => {
    return (
        <section className="hero">
            <h2>Välkommen till</h2>
            <h1>Innovia Hub</h1>
            <p>
            Innovia Hub är en modern plattform där du kan upptäcka, boka och använda resurser 
            som konferensrum, coworking-ytor, VR-headset och AI-server. Oavsett om du vill samarbeta, 
            utveckla idéer eller testa ny teknik gör Innovia Hub det enkelt att reservera rätt resurs 
            för dina behov.
            </p>

            {/* Visa CTA endast om användaren inte är inloggad */}
            {!isLoggedIn && (
                <Link to="/login" className="btn-cta">BLI MEDLEM IDAG!</Link>
            )}
        </section>
    );
};

export default Hero;