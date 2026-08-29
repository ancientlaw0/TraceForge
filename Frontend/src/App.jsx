import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import APIKeys from "./pages/APIKeys";
import Analytics from "./pages/Analytics";
import Live from "./pages/Live";
import Chat from "./pages/Chat";
import Alerts from "./pages/Alerts";
import Usage from "./pages/Usage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    PUBLIC ROUTES
                ========================= */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route
                    path="/auth/login"
                    element={<Login />}
                />

                <Route
                    path="/auth/signup"
                    element={<Signup />}
                />


                {/* =========================
                    PROTECTED ROUTES
                ========================= */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<ProtectedLayout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/api-keys"
                            element={<APIKeys />}
                        />

                        <Route
                            path="/analytics"
                            element={<Analytics />}
                        />

                        <Route
                            path="/live"
                            element={<Live />}
                        />

                        <Route
                            path="/chat"
                            element={<Chat />}
                        />

                        <Route
                            path="/alerts"
                            element={<Alerts />}
                        />

                        <Route
                            path="/usage"
                            element={<Usage />}
                        />

                    </Route>

                </Route>


                {/* =========================
                    UNKNOWN ROUTE
                ========================= */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;