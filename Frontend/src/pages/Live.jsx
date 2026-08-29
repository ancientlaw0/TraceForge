import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createLiveSocket } from "../api/live";
import "../css/Live.css";


function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Number(value || 0)
  );
}


function formatCost(value) {
  return `$${Number(value || 0).toFixed(4)}`;
}


function formatLatency(value) {
  const latency = Number(value || 0);

  if (latency < 1000) {
    return `${latency.toFixed(0)} ms`;
  }

  return `${(latency / 1000).toFixed(2)} s`;
}


function formatPercent(value, total) {
  if (!total) {
    return "0.0%";
  }

  return `${(
    (Number(value || 0) / total) *
    100
  ).toFixed(1)}%`;
}
function formatISTTime(value) {
  if (!value) return "";

  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const totalMinutes =
    hours * 60 +
    minutes +
    330;

  const normalized =
    ((totalMinutes % 1440) + 1440) % 1440;

  const istHours = Math.floor(normalized / 60);
  const istMinutes = normalized % 60;

  const suffix = istHours >= 12 ? "PM" : "AM";

  const displayHour =
    istHours % 12 || 12;

  return `${displayHour}:${String(
    istMinutes
  ).padStart(2, "0")} ${suffix}`;
}
const LIVE_RANGES = {
  "30m": 30,
  "1h": 60,
  "2h": 120,
};
/* =========================================================
   REQUEST GRAPH
========================================================= */

function RequestGraph({ data }) {

  const width = 900;
  const height = 280;

  const padding = {
    top: 24,
    right: 24,
    bottom: 42,
    left: 48,
  };

  const innerWidth =
    width -
    padding.left -
    padding.right;

  const innerHeight =
    height -
    padding.top -
    padding.bottom;


  if (!data || data.length === 0) {
    return (
      <div className="live-chart-empty">
        No request activity yet.
      </div>
    );
  }


  const values = data.map(
    (point) => Number(point.requests || 0)
  );

  const maxValue = Math.max(
    ...values,
    1
  );


  const points = data.map(
    (point, index) => {

const x =
  data.length === 1
    ? padding.left + innerWidth / 2
    : padding.left +
      (
        index /
        (data.length - 1)
      ) *
      innerWidth;

      const y =
        padding.top +
        innerHeight -
        (
          Number(point.requests || 0) /
          maxValue
        ) *
        innerHeight;

      return {
        x,
        y,
        value: Number(point.requests || 0),
        minute: point.minute,
      };
    }
  );


  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");


  const gridLines = [0, 0.25, 0.5, 0.75, 1];


  return (
    <div className="live-chart-wrapper">

    <svg
      className="live-chart"
      viewBox={`0 0 ${width} ${height}`}
    >

        {/* Grid */}

        {gridLines.map((ratio) => {

          const y =
            padding.top +
            innerHeight -
            ratio * innerHeight;

          const value =
            Math.round(
              maxValue * ratio
            );

          return (
            <g key={ratio}>

              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="chart-grid-line"
              />

              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {value}
              </text>

            </g>
          );
        })}


        {/* Graph line */}

        <path
          d={path}
          className="chart-line"
          fill="none"
        />


        {/* Points */}

        {points.map((point, index) => {

          /*
           * Don't render every point when there
           * are many minutes. It keeps the graph
           * visually clean.
           */
          const shouldShow =
            data.length <= 20 ||
            index % 5 === 0 ||
            index === data.length - 1;

          if (!shouldShow) {
            return null;
          }

          return (
            <circle
              key={`${point.minute}-${index}`}
              cx={point.x}
              cy={point.y}
              r="3.5"
              className="chart-point"
            />
          );
        })}


        {/* X-axis labels */}

        {points.map((point, index) => {

          const shouldShow =
            index === 0 ||
            index === points.length - 1 ||
            index === Math.floor(points.length / 2);

          if (!shouldShow) {
            return null;
          }

          return (
            <text
              key={`label-${index}`}
              x={point.x}
              y={height - 14}
              textAnchor="middle"
              className="chart-axis-label"
            >
             {formatISTTime(point.minute)}
            </text>
          );
        })}

      </svg>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  secondary,
}) {
  return (
    <div className="live-stat surface">

      <p className="live-stat-label">
        {label}
      </p>

      <strong className="live-stat-value">
        {value}
      </strong>

      {secondary && (
        <p className="live-stat-secondary">
          {secondary}
        </p>
      )}

    </div>
  );
}


/* =========================================================
   PROVIDER / MODEL TABLE
========================================================= */

function BreakdownTable({
  title,
  data,
  type,
}) {

  return (
    <section className="live-panel surface">

      <div className="live-panel-header">

        <div>
          <h2>{title}</h2>

          <p>
            Activity during the live window.
          </p>
        </div>

      </div>


      {data.length === 0 ? (

        <div className="live-empty">
          No activity recorded yet.
        </div>

      ) : (

        <div className="live-table-wrapper">

          <table className="live-table">

            <thead>
              <tr>

                <th>
                  {type === "provider"
                    ? "Provider"
                    : "Model"}
                </th>

                <th>
                  Requests
                </th>

                <th>
                  Cost
                </th>

                <th>
                  Share
                </th>

              </tr>
            </thead>


            <tbody>

              {data.map((item) => {

                const totalRequests =
                  data.reduce(
                    (
                      total,
                      current
                    ) =>
                      total +
                      Number(
                        current.requests || 0
                      ),
                    0
                  );

                return (
                  <tr
                    key={
                      type === "provider"
                        ? item.provider
                        : item.model
                    }
                  >

                    <td className="live-name">
                      {
                        type === "provider"
                          ? item.provider
                          : item.model
                      }
                    </td>

                    <td>
                      {formatNumber(
                        item.requests
                      )}
                    </td>

                    <td>
                      {formatCost(
                        item.cost
                      )}
                    </td>

                    <td>
                      {formatPercent(
                        item.requests,
                        totalRequests
                      )}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function Live() {

  const [data, setData] = useState(null);

  const [connectionState, setConnectionState] =
    useState("connecting");

  const [error, setError] =
    useState("");

  const [timeRange, setTimeRange] =
    useState("30m");


  useEffect(() => {

    const minutes =
      LIVE_RANGES[timeRange];

    const since = new Date(
      Date.now() -
      minutes * 60 * 1000
    );


    let socket;

    setConnectionState("connecting");
    setError("");


    try {

      socket = createLiveSocket(
        since
      );

    } catch (error) {

      setConnectionState("error");
      setError(
        error.message ||
        "Unable to connect to the live service."
      );

      return;
    }


    socket.onopen = () => {

      setConnectionState("connected");
      setError("");

    };


    socket.onmessage = (event) => {

      try {

        const incoming =
          JSON.parse(event.data);

        setData(incoming);

      } catch {

        setError(
          "Received invalid live data."
        );

      }

    };


    socket.onerror = () => {

      setConnectionState("error");

      setError(
        "Unable to connect to the live service."
      );

    };


    socket.onclose = () => {

      setConnectionState(
        (current) =>
          current === "error"
            ? "error"
            : "disconnected"
      );

    };


    return () => {

      socket.close();

    };

  }, [timeRange]);

  const summary = data?.summary || {
    requests: 0,
    success: 0,
    failed: 0,
    avg_latency: 0,
    cost: 0,
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };


  const graph =
    data?.graph || [];


  const providers =
    useMemo(
      () =>
        [...(data?.providers || [])]
          .sort(
            (a, b) =>
              Number(b.requests || 0) -
              Number(a.requests || 0)
          ),
      [data?.providers]
    );


  const models =
    useMemo(
      () =>
        [...(data?.models || [])]
          .sort(
            (a, b) =>
              Number(b.requests || 0) -
              Number(a.requests || 0)
          ),
      [data?.models]
    );


  const lastUpdated =
    data
      ? new Date()
      : null;


  return (
    <div className="live-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="live-header">

        <div>

          <p className="page-eyebrow">
            Observability
          </p>

          <h1 className="page-title">
            Live
          </h1>

          <p className="page-subtitle">
            Real-time activity from your
            applications.
          </p>

        </div>


        <div className="live-status">

          <span
            className={`live-status-dot live-status-${connectionState}`}
          />

          <span>
            {connectionState === "connected"
              ? "Connected"
              : connectionState ===
                "connecting"
              ? "Connecting..."
              : connectionState ===
                "disconnected"
              ? "Disconnected"
              : "Connection error"}
          </span>

        </div>

      </header>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="live-error">
          {error}
        </div>
      )}


      {/* =================================================
          WINDOW
      ================================================= */}

      <div className="live-window">

  <span>
    LIVE WINDOW
  </span>

  <select
    value={timeRange}
    onChange={(event) =>
      setTimeRange(event.target.value)
    }
    className="time-select"
  >
    <option value="30m">
      Last 30 minutes
    </option>

    <option value="1h">
      Last 1 hour
    </option>

    <option value="2h">
      Last 2 hours
    </option>
  </select>

  <span className="live-refresh">
    Updates every 10 seconds
  </span>

</div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="live-stat-grid">

        <StatCard
          label="Requests"
          value={formatNumber(
            summary.requests
          )}
          secondary={`${formatPercent(
            summary.success,
            summary.requests
          )} successful`}
        />

        <StatCard
          label="Successful"
          value={formatNumber(
            summary.success
          )}
          secondary={`${formatPercent(
            summary.success,
            summary.requests
          )} success rate`}
        />

        <StatCard
          label="Failed"
          value={formatNumber(
            summary.failed
          )}
          secondary={`${formatPercent(
            summary.failed,
            summary.requests
          )} failed`}
        />

        <StatCard
          label="Average latency"
          value={formatLatency(
            summary.avg_latency
          )}
        />

        <StatCard
          label="Live cost"
          value={formatCost(
            summary.cost
          )}
        />

        <StatCard
          label="Total tokens"
          value={formatNumber(
            summary.total_tokens
          )}
          secondary={`${formatNumber(
            summary.input_tokens
          )} input · ${formatNumber(
            summary.output_tokens
          )} output`}
        />

      </section>


      {/* =================================================
          REQUEST GRAPH
      ================================================= */}

      <section className="live-panel surface">

        <div className="live-panel-header">

          <div>

            <h2>
              Request activity
            </h2>

            <p>
              Requests per minute over
              the live window.
            </p>

          </div>

{lastUpdated && (
  <span className="live-updated">
    Updated{" "}
    {lastUpdated.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })}
  </span>
)}
        </div>


        <RequestGraph
          data={graph}
        />

      </section>


      {/* =================================================
          PROVIDERS
      ================================================= */}

      <div className="live-breakdown-grid">

        <BreakdownTable
          title="Providers"
          data={providers}
          type="provider"
        />

        <BreakdownTable
          title="Models"
          data={models}
          type="model"
        />

      </div>


      {/* =================================================
          FOOTER NAV
      ================================================= */}

      <div className="live-footer">

        <Link to="/analytics">
          View full analytics →
        </Link>

        <span>
          Live data is retained in Redis
          for real-time monitoring.
        </span>

      </div>

    </div>
  );
}