import { useState } from "react";
import { registerUser } from "../api/api";
import "../styles/LoginAndRegisterForms.css";
import { useFormMessages } from "../hooks/useFormMessages";

const RegisterForm = () => {
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    errorMessage,
    setErrorMessage,
    resetMessages,
    setSuccessMessage,
    successMessage,
  } = useFormMessages();

  // Hantera formulärsubmission
  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();
    resetMessages();

    if (!userName || !email || !password) {
      setErrorMessage("Fyll i alla fält");
      return;
    }

    // Grundläggande validering
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Ange en giltig e-postadress");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Lösenordet måste vara minst 6 tecken långt");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Fyll i både email och lösenord");
      return;
    }

    try {
      // Registrera användaren via API
      await registerUser(email, password, userName);
      setErrorMessage("");
      setSuccessMessage("Konto skapat! Du kan nu logga in.");
    } catch (error: any) {
      setErrorMessage(
        error.response?.status === 409
          ? "E-postadressen används redan"
          : "Något gick fel, försök igen senare"
      );
    }
  };
  return (
    <div className="formBox">
      <h2 className="formHeading">Skapa konto</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="username"
          placeholder={"Användarnamn"}
          onChange={(e) => setUsername(e.target.value)}
          value={userName}
        />
        <input
          type="email"
          placeholder={"Email"}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder={"Lösenord"}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        {/* Visa eventuella fel- eller succémeddelanden */}
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        {successMessage && <p className="successMessage">{successMessage}</p>}

        <button type="submit" className="formBtn">
          Registrera dig
        </button>
      </form>
    </div>
  );
};
export default RegisterForm;
