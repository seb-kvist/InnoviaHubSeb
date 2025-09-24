import type { JSX } from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Wrapper som skyddar routes baserat på inloggning och användarroll
 * @param children JSX.Element - komponenten som ska renderas om användaren har tillgång
 * @param requiredRole string | undefined - om rollen är specificerad måste användaren ha denna roll
 */
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: string;
}) => {
  // Hämta token och roll från localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLocaleLowerCase();

  // Om ingen token → omdirigera till login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Om en roll krävs och användaren inte har den omdirigera till startsidan
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
