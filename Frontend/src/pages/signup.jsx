import { useState } from "react";
import { signup } from "../api/auth";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const data = await signup(email, password);

            console.log("Signup successful:", data);
        } catch (error) {
            console.error("Signup failed:", error);
        }
    };

    return (
        <div>
            <h1>TraceForge</h1>

            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">
                    Sign Up
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