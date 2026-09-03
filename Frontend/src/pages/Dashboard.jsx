import ActiveAlerts from "../components/ActiveAlerts";
import useDashboard from "../hooks/useDashboard";
import RequestsChart from "../components/Dashboard/RequestsChart";
import DashboardStats from "../components/Dashboard/DashboardStats";
import RequestHealth from "../components/Dashboard/RequestHealth";
import LatencySummary from "../components/Dashboard/LatencySummary";
import TokenCostSummary from "../components/Dashboard/TokenCostSummary";
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


export default function Dashboard() {

    const {
        user,
        overview,
        timeseries,
        timeRange,
        setTimeRange,
        loading,
        chartLoading,
        error,
        lastUpdated,
    } = useDashboard();


    const firstName =
        user?.email?.split("@")[0] ||
        "there";


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );

    }


    // =========================================================
    // ERROR
    // =========================================================

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


    // =========================================================
    // DATA
    // =========================================================

    const summary =
        overview?.summary || {};

    const latency =
        overview?.latency || {};


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="dashboard">


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-page">


                {/* =================================================
                    TOP BAR
                ================================================= */}

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


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="dashboard-content">


                    {/* =================================================
                        HEADER
                    ================================================= */}

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


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <DashboardStats
                        summary={summary}
                        latency={latency}
                    />


                    {/* =================================================
                        REQUESTS
                    ================================================= */}

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


                    {/* =================================================
                        HEALTH + LATENCY
                    ================================================= */}

                    <section className="health-grid">

                        <RequestHealth
                            summary={summary}
                        />

                        <LatencySummary
                            latency={latency}
                        />

                    </section>


                    {/* =================================================
                        TOKEN + COST
                    ================================================= */}

                    <TokenCostSummary
                        summary={summary}
                    />


                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    <ActiveAlerts />


                </div>

            </main>

        </div>
    );
}