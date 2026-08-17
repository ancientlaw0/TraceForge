import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import APIKeys from "./pages/APIKeys";
import Analytics from "./pages/Analytics";
import Live from "./pages/Live";
import Chat from "./pages/Chat";
import Alerts from "./pages/Alerts";
import Usage from "./pages/Usage";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    PUBLIC ROUTES
                ========================= */}

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
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <Alerts />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/usage"
                        element={
                            <ProtectedRoute>
                                <Usage />
                            </ProtectedRoute>
                        }
                    />

                </Route>


                {/* =========================
                    UNKNOWN ROUTE
                ========================= */}

                <Route
                    path="*"
                    element={
                        <div>
                            <h1>404</h1>
                            <p>Page not found.</p>
                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;