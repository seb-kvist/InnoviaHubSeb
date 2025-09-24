import { useState } from "react";

export const useFormMessages = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return { errorMessage, setErrorMessage, successMessage, setSuccessMessage, resetMessages };
};