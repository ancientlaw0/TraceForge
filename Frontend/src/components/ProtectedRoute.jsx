import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getMe } from "../api/auth";

function ProtectedRoute() {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setAuthenticated(false);
                setChecking(false);
                return;
            }

            try {
                await getMe();

                setAuthenticated(true);
            } catch (error) {
                localStorage.removeItem("access_token");
                setAuthenticated(false);
            } finally {
                setChecking(false);
            }
        };

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