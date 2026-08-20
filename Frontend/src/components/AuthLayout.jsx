import "../css/auth.css";

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="auth-shell">

      <section className="auth-brand">

        <div className="auth-logo">
          TraceForge
        </div>

        <div className="auth-brand-mid">
          <svg
            className="trace-pulse"
            viewBox="0 0 520 180"
            aria-hidden="true"
          >
            <polyline
              points="20,125 100,125 135,35 170,125 245,125 280,80 315,125 395,125 430,15 475,125"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.65"
            />

            <circle
              cx="135"
              cy="35"
              r="4"
              fill="currentColor"
            />

            <circle
              cx="280"
              cy="80"
              r="4"
              fill="currentColor"
            />

            <circle
              cx="430"
              cy="15"
              r="4"
              fill="currentColor"
            />

            <text
              x="135"
              y="22"
              textAnchor="middle"
              className="trace-label"
            >
              184ms
            </text>

            <text
              x="280"
              y="67"
              textAnchor="middle"
              className="trace-label"
            >
              62ms
            </text>

            <text
              x="430"
              y="4"
              textAnchor="middle"
              className="trace-label"
            >
              312ms
            </text>
          </svg>
        </div>

        <p className="auth-brand-copy">
          Every call, traced. Every prompt,
          accountable.
        </p>

      </section>

      <main className="auth-panel">
        <div className="auth-card">

          <span className="auth-eyebrow">
            {eyebrow}
          </span>

          <h1 className="auth-title">
            {title}
          </h1>

          <p className="auth-subtitle">
            {subtitle}
          </p>

          {children}

        </div>
      </main>

    </div>
  );
}