import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth";

function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await signup(email, password);

            navigate("/auth/login", {
                state: {
                    message: "Account created successfully. Please log in.",
                },
            });

        } catch (error) {

            if (error.response) {
                const status = error.response.status;

                if (status === 409) {
                    setError("Email is already registered.");
                }
                else if (status === 422) {
                    setError(
                        "Please enter a valid email and a password between 8 and 128 characters."
                    );
                }
                else if (status >= 500) {
                    setError(
                        "Server error. Please try again later."
                    );
                }
                else {
                    setError("Signup failed. Please try again.");
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

            <h2>Create Account</h2>

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
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

            </form>

            <p>
                Already have an account?
                <a href="/auth/login"> Login</a>
            </p>
        </div>
    );
}

export default Signup;