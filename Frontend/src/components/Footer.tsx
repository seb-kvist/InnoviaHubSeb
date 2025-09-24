import React from "react";
import "../styles/Footer.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-links">
                <div>
                    <h4>INNOVIA HUB</h4>
                    <ul>
                        <li>Om oss</li>
                        <li>Tjänster</li>
                        <li>Kontakt</li>
                        <li>FAQ</li>
                    </ul>
                    </div>

                    <div>
                    <h4>Resursers</h4>
                    <ul>
                        <li>Karriär</li>
                        <li>Partners</li>
                        <li>Integritet</li>
                        <li>Användarvillkor</li>
                    </ul>
                </div>    
            </div>
        
            <div className="social-links">
            <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram size={32} />
        </a>
        <a
          href="https://www.linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin size={32} />
        </a>
            </div>

            <div className="footer-socials">
            <div className="headerLogo">
      <Link to="/">
        <img
          src="/img/innovialogo.png"
          alt="Innovia Hub logo"
          className="logoImg"
        />
      </Link>
    </div>
                <span>© Innovia Hub</span>
            </div>
        </footer>
    );
};


export default Footer;