import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import APIKeys from "./pages/APIKeys";

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