import { useState } from "react";
import { login, getMe } from "../api/auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const data = await login(email, password);

            console.log("Login successful:", data);

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            const user = await getMe(data.access_token);

            console.log("Current user:", user);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div>
            <h1>TraceForge</h1>

            <h2>Login</h2>

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
                    />
                </div>

                <button type="submit">
                    Login
                </button>
            </form>

            <p>
                Don't have an account?
                <a href="/auth/signup"> Sign up</a>
            </p>
        </div>
    );
}

export default Login;