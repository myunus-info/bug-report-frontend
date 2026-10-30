import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "../utils/auth";
import { getMe } from "../services/auth.api";

export default function ProtectedRoute({ children }) {
  const token = getToken();
  const [isValid, setIsValid] = useState(() => (token ? null : false));

  useEffect(() => {
    if (!token) {
      return;
    }

    // Verify token is valid with backend profile endpoint
    let isMounted = true;
    getMe()
      .then(() => {
        if (isMounted) setIsValid(true);
      })
      .catch(() => {
        if (isMounted) {
          clearToken();
          setIsValid(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
