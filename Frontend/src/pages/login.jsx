import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const justSignedUp = location.state?.signedUp;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to TraceForge"
      subtitle="Track latency, cost, and errors across every model call."
    >
      {justSignedUp && (
        <div className="auth-banner auth-banner-success">
          Account created. Log in to continue.
        </div>
      )}

      {error && (
        <div className="auth-banner auth-banner-error">
          {error}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <label className="auth-field">
          <span>Email</span>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

      </form>

      <p className="auth-switch">
        New to TraceForge?{" "}
        <Link to="/auth/signup">
          Create an account
        </Link>
      </p>

    </AuthLayout>
  );
}