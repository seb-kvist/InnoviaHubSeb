import React from "react";
import { Link } from "react-router-dom"; 
import "../styles/ResourceCards.css";
import resourceData from "../data/resourceData";

// Props för ResourceCards-komponenten
interface ResourceCardsProps {
    isLoggedIn: boolean; // Styr om vi visar "Reservera" eller uppmaning att logga in
}

// Visar en grid med resurskort hämtade från gemensam datafil
const ResourceCards: React.FC<ResourceCardsProps> = ({ isLoggedIn }) => {

    return (
        <section className="resourcecards">
            {/* Loopa igenom resursdatan och rendera ett kort per resurs */}
            {resourceData.map((res) => (
                <div key={res.id} className="resource-card-section">
                <img src={res.imageUrl} alt={res.name} />

                {/* Overlay med namn, beskrivning och knapp */}
                <div className="overlay">
                    <h3>{res.name}</h3>
                    <p className="resource-desc">{res.description}</p>
                    {isLoggedIn ? (
                    // Om inloggad → länka till resursens sida
                    <Link to={res.path} className="btn-reserve">
                        Reservera
                    </Link>
                    ) : (
                    // Om inte inloggad → länka till login-sidan
                    <Link to="/login" className="btn-reserve">
                        Logga in för att reservera
                    </Link>
                    )}
                   </div>
                </div>  
            ))}
        </section>
    );
};

export default ResourceCards