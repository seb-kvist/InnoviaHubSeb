import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { useLocation } from "react-router-dom";

const Login = () => {
  const location = useLocation();
  const [showRegister, setShowRegister] = useState(false);

  // Kolla om vi ska visa registerformulär direkt baserat på location state
  useEffect(() => {
    if (location.state?.mode === "register") {
      setShowRegister(true);
    } else {
      setShowRegister(false);
    }
  }, [location.state]);

  return (
    <div className={`loginContainer ${showRegister ? "showRegister" : ""}`}>
      {/* Formulärssektion */}
      <div className="formHolder">
        {showRegister ? <RegisterForm /> : <LoginForm />}
      </div>

      {/* Sekundär vy som uppmanar användare att byta */}
      <div
        className={`secondaryView ${showRegister ? "secondaryViewLogin" : ""}`}
      >
        {showRegister ? (
          <>
            <h2>Har du redan ett konto?</h2>
            <button onClick={() => setShowRegister(false)}>Logga in här</button>
          </>
        ) : (
          <>
            <h2>Besöker du oss första gången?</h2>
            <button onClick={() => setShowRegister(true)}>Skapa konto</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
