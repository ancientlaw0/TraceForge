import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, getMe } from "../api/auth";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);

            localStorage.setItem(
                "access_token",
                data.access_token
            );
             const user = await getMe();
            console.log("Login successful:", data);
            console.log("Current user:", user);

            // Dashboard redirect will be added later.

        } catch (error) {

            if (error.response) {
                const status = error.response.status;

                if (status === 401) {
                    setError("Invalid email or password.");
                }
                else if (status === 422) {
                    setError(
                        "Please enter a valid email and password."
                    );
                }
                else if (status >= 500) {
                    setError(
                        "Server error. Please try again later."
                    );
                }
                else {
                    setError(
                        "Login failed. Please try again."
                    );
                }

            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please try again."
                );

            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>TraceForge</h1>

            <h2>Login</h2>

            {location.state?.message && (
                <p>
                    {location.state.message}
                </p>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        disabled={loading}
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            <p>
                Don't have an account?
                <button
                    type="button"
                    onClick={() => navigate("/auth/signup")}
                >
                    Sign up
                </button>
            </p>
        </div>
    );
}

export default Login;