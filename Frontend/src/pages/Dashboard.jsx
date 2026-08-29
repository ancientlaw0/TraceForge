import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActiveAlerts from "../components/ActiveAlerts";
import { getMe } from "../api/auth";
import {
  getOverview,
  getTimeseries,
} from "../api/analytics";

import "../css/Dashboard.css";
const TIME_RANGES = [
    {
        value: "hour",
        label: "Last hour",
    },
    {
        value: "day",
        label: "Last 24 hours",
    },
    {
        value: "week",
        label: "Last 7 days",
    },
    {
        value: "month",
        label: "Last 30 days",
    },
    {
        value: "all",
        label: "All time",
    },
];

function formatNumber(value) {
  return new Intl.NumberFormat().format(
    Number(value || 0)
  );
}


function formatCost(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}


function formatLatency(value) {
  const number = Number(value || 0);

  if (number >= 1000) {
    return `${(number / 1000).toFixed(2)} s`;
  }

  return `${number.toFixed(0)} ms`;
}


function formatChartLabel(timestamp, timeRange) {
    const date = new Date(timestamp);

    if (timeRange === "hour") {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
}


function RequestsChart({ data, timeRange }) {

    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No request data available for this period.</p>
            </div>
        );
    }


  /*
   * We only draw points that actually came
   * from the backend.
   *
   * No interpolation.
   * No fabricated values.
   */

  const width = 760;
  const height = 240;

  const values = data.map(
    (point) => Number(point.requests || 0)
  );

  const max = Math.max(...values);
  const min = Math.min(...values);

  const range = max - min;


  /*
   * One point is not a trend.
   *
   * We display the real value instead of
   * pretending there is a line.
   */




  const coordinates = data.map(
    (point, index) => {

const x =
  data.length === 1
    ? width / 2
    : (index / (data.length - 1)) * width;

      const normalized =
        range === 0
          ? 0.5
          : (
              Number(point.requests || 0) - min
            ) / range;

      const y =
        height -
        normalized * (height - 20) -
        10;

      return {
        x,
        y,
        point,
      };
    }
  );


  const linePoints = coordinates
    .map(
      ({ x, y }) =>
        `${x},${y}`
    )
    .join(" ");


  return (
    <div className="chart">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="chart-svg"
      >

        <line
          x1="0"
          y1="30"
          x2={width}
          y2="30"
          className="chart-grid"
        />

        <line
          x1="0"
          y1="120"
          x2={width}
          y2="120"
          className="chart-grid"
        />

        <line
          x1="0"
          y1="210"
          x2={width}
          y2="210"
          className="chart-grid"
        />

        <polyline
          points={linePoints}
          fill="none"
          className="chart-line"
        />

        {coordinates.map(
          ({ x, y, point }) => (

            <circle
              key={point.timestamp}
              cx={x}
              cy={y}
              r="4"
              className="chart-point"
            />

          )
        )}

      </svg>


      <div className="chart-labels">

        {data.map((point) => (
  <span key={point.timestamp}>
    {formatChartLabel(
      point.timestamp,
      timeRange
    )}
  </span>
))}

      </div>

    </div>
  );
}


function StatCard({
  label,
  value,
}) {

  return (
    <div className="stat-card surface">

      <p className="stat-label">
        {label}
      </p>

      <p className="stat-value">
        {value}
      </p>

    </div>
  );
}


export default function Dashboard() {

  const [user, setUser] =
    useState(null);

  const [overview, setOverview] =
    useState(null);

  const [timeseries, setTimeseries] =
    useState([]);

const [timeRange, setTimeRange] = useState("week");

  const [loading, setLoading] =
    useState(true);

  const [chartLoading, setChartLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /*
   * Load user + overview.
   *
   * These don't depend on the selected
   * chart range.
   */

  useEffect(() => {
      async function loadDashboardData() {
          try {
              setChartLoading(true);
              setError("");

              const [
                  overviewData,
                  timeseriesData,
              ] = await Promise.all([
                  getOverview({
                      time: timeRange,
                  }),
                  getTimeseries({
                      time: timeRange,
                  }),
              ]);

              setOverview(overviewData);
              setTimeseries(timeseriesData);
              setLastUpdated(new Date());

          } catch (error) {
              console.error(
                  "Failed to load dashboard data:",
                  error
              );

              setError(
                  error.message ||
                  "Failed to load dashboard data."
              );
          } finally {
              setChartLoading(false);
          }
      }

      loadDashboardData();
  }, [timeRange]);


  useEffect(() => {
    async function loadUser() {
        try {
            const userData = await getMe();
            setUser(userData);
        } catch (error) {
            console.error(
                "Failed to load user:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    loadUser();
}, []);
  /*
   * Load timeseries.
   *
   * IMPORTANT:
   *
   * The current backend endpoint does not
   * accept a range parameter.
   *
   * Therefore we fetch what the backend
   * currently provides and filter it locally
   * when there are enough points.
   */

  useEffect(() => {
      async function loadTimeseries() {
          try {
              setChartLoading(true);

              const data = await getTimeseries({
                  time: timeRange,
              });

              setTimeseries(data);
          } catch (error) {
              console.error(
                  "Failed to load timeseries:",
                  error
              );
          } finally {
              setChartLoading(false);
          }
      }

      loadTimeseries();
  }, [timeRange]);


  /*
   * Auto refresh every 30 seconds.
   */

  useEffect(() => {
    const interval = setInterval(
        async () => {
            try {
                const [
                    overviewData,
                    timeseriesData,
                ] = await Promise.all([
                    getOverview({
                        time: timeRange,
                    }),
                    getTimeseries({
                        time: timeRange,
                    }),
                ]);

                setOverview(
                    overviewData
                );

                setTimeseries(
                    timeseriesData
                );

                setLastUpdated(
                    new Date()
                );

            } catch (error) {
                console.error(
                    "Dashboard refresh failed:",
                    error
                );
            }
        },
        30 * 1000
    );

    return () =>
        clearInterval(interval);

}, [timeRange]);

  const firstName =
    user?.email?.split("@")[0] ||
    "there";


  if (loading) {

    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );

  }


  if (error) {

    return (
      <div className="dashboard-error">

        <h2>
          Unable to load dashboard
        </h2>

        <p>
          {error}
        </p>

      </div>
    );

  }


  const summary =
    overview?.summary || {};

  const latency =
    overview?.latency || {};


  return (

    <div className="dashboard">


      {/* MAIN */}

      <main className="dashboard-page">

        <header className="dashboard-topbar">

          <div />

          <div className="user-menu">

            <div className="user-avatar">

              {firstName
                .charAt(0)
                .toUpperCase()}

            </div>

            <span>
              {user?.email || "Account"}
            </span>

          </div>

        </header>


        <div className="dashboard-content">

          {/* HEADER */}

          <header className="dashboard-header">

            <div>

              <p className="page-eyebrow">
                Overview
              </p>

              <h1 className="dashboard-title">
                Good to see you, {firstName}.
              </h1>

              <p className="dashboard-subtitle">
                Your system activity at a glance.
              </p>

            </div>

          </header>


          {/* STATS */}

          <section className="stats-grid">

            <StatCard
              label="Requests"
              value={formatNumber(
                summary.total_requests
              )}
            />

            <StatCard
              label="Success rate"
              value={`${Number(
                summary.success_rate || 0
              ).toFixed(2)}%`}
            />

            <StatCard
              label="Avg latency"
              value={formatLatency(
                latency.average
              )}
            />

            <StatCard
              label="Total cost"
              value={formatCost(
                summary.total_cost
              )}
            />

          </section>


          {/* REQUESTS */}

          <section className="dashboard-card surface">

            <div className="card-header">

              <div>

                <h2>
                  Requests
                </h2>

                <p>
                  Request volume over the
                  selected period.
                </p>

              </div>


              <div className="request-controls">

                <select
                  value={timeRange}
                  onChange={(event) =>
                    setTimeRange(
                      event.target.value
                    )
                  }
                  className="time-select"
                >

                  {TIME_RANGES.map(
                    (range) => (

                      <option
                        key={range.value}
                        value={range.value}
                      >
                        {range.label}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {chartLoading ? (

              <div className="chart-empty">
                Updating chart...
              </div>

            ) : (

<RequestsChart
  data={timeseries}
  timeRange={timeRange}
/>

            )}


            {lastUpdated && (

              <p className="updated-text">
                Updated{" "}
                {lastUpdated.toLocaleTimeString(
                  [],
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}
              </p>

            )}

          </section>


          {/* HEALTH + LATENCY */}

          <section className="health-grid">

            <div className="dashboard-card surface">

              <div className="card-header">

                <div>

                  <h2>
                    Request health
                  </h2>

                  <p>
                    Distribution by request status.
                  </p>

                </div>

              </div>


              <div className="health-list">

                <div className="health-row">

                  <span>
                    Successful
                  </span>

                  <strong>
                    {Number(
                      summary.success_rate || 0
                    ).toFixed(2)}%
                  </strong>

                </div>

                <div className="health-bar">

                  <div
                    className="health-fill health-success"
                    style={{
                      width: `${summary.success_rate || 0}%`,
                    }}
                  />

                </div>


                <div className="health-row">

                  <span>
                    Errors
                  </span>

                  <strong>
                    {Number(
                      summary.error_rate || 0
                    ).toFixed(2)}%
                  </strong>

                </div>

                <div className="health-bar">

                  <div
                    className="health-fill health-error"
                    style={{
                      width: `${summary.error_rate || 0}%`,
                    }}
                  />

                </div>


                <div className="health-row">

                  <span>
                    Timeouts
                  </span>

                  <strong>
                    {Number(
                      summary.timeout_rate || 0
                    ).toFixed(2)}%
                  </strong>

                </div>

                <div className="health-bar">

                  <div
                    className="health-fill health-warning"
                    style={{
                      width: `${summary.timeout_rate || 0}%`,
                    }}
                  />

                </div>

              </div>

            </div>


            <div className="dashboard-card surface">

              <div className="card-header">

                <div>

                  <h2>
                    Latency
                  </h2>

                  <p>
                    Response time distribution.
                  </p>

                </div>

              </div>


              <div className="latency-list">

                <div>
                  <span>Average</span>
                  <strong>
                    {formatLatency(
                      latency.average
                    )}
                  </strong>
                </div>

                <div>
                  <span>P50</span>
                  <strong>
                    {formatLatency(
                      latency.p50
                    )}
                  </strong>
                </div>

                <div>
                  <span>P95</span>
                  <strong>
                    {formatLatency(
                      latency.p95
                    )}
                  </strong>
                </div>

                <div>
                  <span>P99</span>
                  <strong>
                    {formatLatency(
                      latency.p99
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </section>


          {/* TOKEN + COST */}

          <section className="health-grid">

            <div className="dashboard-card surface">

              <div className="card-header">

                <div>

                  <h2>
                    Token usage
                  </h2>

                  <p>
                    Recorded token consumption.
                  </p>

                </div>

              </div>


              <div className="latency-list">

                <div>
                  <span>Input tokens</span>
                  <strong>
                    {formatNumber(
                      summary.total_input_tokens
                    )}
                  </strong>
                </div>

                <div>
                  <span>Output tokens</span>
                  <strong>
                    {formatNumber(
                      summary.total_output_tokens
                    )}
                  </strong>
                </div>

                <div>
                  <span>Total tokens</span>
                  <strong>
                    {formatNumber(
                      (
                        summary.total_input_tokens ||
                        0
                      ) +
                      (
                        summary.total_output_tokens ||
                        0
                      )
                    )}
                  </strong>
                </div>

              </div>

            </div>


            <div className="dashboard-card surface">

              <div className="card-header">

                <div>

                  <h2>
                    Cost
                  </h2>

                  <p>
                    Recorded model usage cost.
                  </p>

                </div>

              </div>


              <div className="latency-list">

                <div>
                  <span>Total</span>
                  <strong>
                    {formatCost(
                      summary.total_cost
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </section>
  <ActiveAlerts />


        </div>

      </main>

    </div>

  );
}