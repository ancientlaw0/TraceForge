import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import {
  getMe,
  getToken,
  logout,
} from "../api/auth";

function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const token = getToken();

      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        await getMe();

        setAuthenticated(true);
      } catch (error) {
        /*
         * The token exists but the backend rejected it.
         * Therefore the local session is no longer valid.
         */
        logout();

        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }

    checkAuthentication();
  }, []);

  if (checking) {
    return (
      <div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;