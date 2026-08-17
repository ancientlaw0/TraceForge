import { useEffect, useRef, useState } from "react";

import {
    getLive,
    createLiveWebSocket,
} from "../api/live";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import "../css/live.css";


function Live() {

    const [liveData, setLiveData] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [connectionStatus, setConnectionStatus] =
        useState("connecting");

    const [lastUpdated, setLastUpdated] =
        useState(null);

    const socketRef =
        useRef(null);


    /* =================================
       INITIAL DATA + WEBSOCKET
    ================================= */

    useEffect(() => {

        let mounted = true;

        const token =
            localStorage.getItem(
                "access_token"
            );


        if (!token) {

            setError(
                "You must be logged in to view live analytics."
            );

            setLoading(false);

            setConnectionStatus("unauthorized");

            return;
        }


        const since =
            new Date(
                Date.now() -
                60 * 60 * 1000
            ).toISOString();


        async function initialise() {

            try {

                /*
                 * First get the current snapshot.
                 */

                const initialData =
                    await getLive(since);


                if (!mounted) {
                    return;
                }


                setLiveData(
                    normalizeLiveData(initialData)
                );

                setLastUpdated(
                    new Date()
                );

                setLoading(false);


                /*
                 * Then connect WebSocket.
                 */

                connectWebSocket(
                    token,
                    since
                );

            } catch (err) {

                if (!mounted) {
                    return;
                }


                setLoading(false);

                setError(
                    getErrorMessage(err)
                );

                setConnectionStatus(
                    "error"
                );
            }
        }


        initialise();


        return () => {

            mounted = false;

            if (socketRef.current) {

                socketRef.current.close();

                socketRef.current = null;
            }
        };

    }, []);


    /* =================================
       WEBSOCKET
    ================================= */

    function connectWebSocket(
        token,
        since
    ) {

        try {

            setConnectionStatus(
                "connecting"
            );


            const socket =
                createLiveWebSocket(
                    token,
                    since
                );


            socketRef.current =
                socket;


            socket.onopen = () => {

                setConnectionStatus(
                    "connected"
                );

                setError("");
            };


            socket.onmessage = (event) => {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );


                    setLiveData(
                        normalizeLiveData(data)
                    );

                    setLastUpdated(
                        new Date()
                    );

                    setError("");

                } catch {

                    setError(
                        "Received invalid data from the live server."
                    );
                }
            };


            socket.onerror = () => {

                setConnectionStatus(
                    "error"
                );

                setError(
                    "Unable to connect to the live server."
                );
            };


            socket.onclose = (event) => {

                socketRef.current =
                    null;


                if (
                    event.code === 1008
                ) {

                    setConnectionStatus(
                        "unauthorized"
                    );

                    setError(
                        "Live connection was rejected. Please log in again."
                    );

                    return;
                }


                setConnectionStatus(
                    "disconnected"
                );
            };

        } catch {

            setConnectionStatus(
                "error"
            );

            setError(
                "Unable to create live connection."
            );
        }
    }


    /* =================================
       LOADING
    ================================= */

    if (loading) {

        return (
            <div className="live-page">

                <div className="live-loading">

                    <h1>
                        Live
                    </h1>

                    <p>
                        Loading live analytics...
                    </p>

                </div>

            </div>
        );
    }


    /* =================================
       MAIN PAGE
    ================================= */

    return (
        <div className="live-page">

            {/* ============================
                HEADER
            ============================ */}

            <header className="live-header">

                <div>

                    <h1>
                        Live
                    </h1>

                    <p>
                        Real-time activity from your
                        TraceForge traces.
                    </p>

                </div>


                <ConnectionIndicator
                    status={
                        connectionStatus
                    }
                />

            </header>


            {/* ============================
                ERROR
            ============================ */}

            {error && (

                <div className="live-error">

                    <strong>
                        Live connection issue
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* ============================
                LAST UPDATED
            ============================ */}

            <div className="live-meta">

                <span>

                    Last update:{" "}

                    {lastUpdated
                        ? lastUpdated.toLocaleTimeString()
                        : "—"}

                </span>


                <span>

                    {connectionStatus ===
                    "connected"
                        ? "Receiving live updates"
                        : "Live updates unavailable"}

                </span>

            </div>


            {/* ============================
                SUMMARY
            ============================ */}

            <section className="live-section">

                <div className="live-metric-grid">

                    <MetricCard
                        title="Requests"
                        value={
                            formatNumber(
                                liveData?.summary?.requests
                            )
                        }
                    />


                    <MetricCard
                        title="Success"
                        value={
                            formatNumber(
                                liveData?.summary?.success
                            )
                        }
                    />


                    <MetricCard
                        title="Errors"
                        value={
                            formatNumber(
                                liveData?.summary?.errors ??
                                liveData?.summary?.failed
                            )
                        }
                    />


                    <MetricCard
                        title="Timeouts"
                        value={
                            formatNumber(
                                liveData?.summary?.timeouts
                            )
                        }
                    />


                    <MetricCard
                        title="Average Latency"
                        value={
                            formatLatency(
                                liveData?.summary?.avg_latency
                            )
                        }
                    />


                    <MetricCard
                        title="Cost"
                        value={
                            formatCost(
                                liveData?.summary?.cost
                            )
                        }
                    />


                    <MetricCard
                        title="Input Tokens"
                        value={
                            formatNumber(
                                liveData?.summary?.input_tokens
                            )
                        }
                    />


                    <MetricCard
                        title="Output Tokens"
                        value={
                            formatNumber(
                                liveData?.summary?.output_tokens
                            )
                        }
                    />


                    <MetricCard
                        title="Total Tokens"
                        value={
                            formatNumber(
                                liveData?.summary?.total_tokens ??
                                (
                                    Number(
                                        liveData?.summary?.input_tokens
                                    ) || 0
                                ) +
                                (
                                    Number(
                                        liveData?.summary?.output_tokens
                                    ) || 0
                                )
                            )
                        }
                    />

                </div>

            </section>


            {/* ============================
                REQUEST ACTIVITY
            ============================ */}

            <section className="live-card">

                <div className="live-card-header">

                    <div>

                        <h2>
                            Request Activity
                        </h2>

                        <p>
                            Recent requests over time.
                        </p>

                    </div>

                </div>


                {liveData?.graph?.length ? (

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <LineChart
                            data={
                                normalizeGraph(
                                    liveData.graph
                                )
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="minute"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />


                            <Line
                                type="monotone"
                                dataKey="requests"
                                name="Requests"
                                dot={false}
                            />


                            <Line
                                type="monotone"
                                dataKey="success"
                                name="Success"
                                dot={false}
                            />


                            <Line
                                type="monotone"
                                dataKey="errors"
                                name="Errors"
                                dot={false}
                            />


                            <Line
                                type="monotone"
                                dataKey="timeouts"
                                name="Timeouts"
                                dot={false}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                ) : (

                    <EmptyState
                        message={
                            "No recent request activity."
                        }
                    />

                )}

            </section>


            {/* ============================
                PROVIDERS + MODELS
            ============================ */}

            <div className="live-two-column">


                {/* PROVIDERS */}

                <section className="live-card">

                    <div className="live-card-header">

                        <div>

                            <h2>
                                Providers
                            </h2>

                            <p>
                                Current provider activity.
                            </p>

                        </div>

                    </div>


                    {liveData?.providers?.length ? (

                        <div className="live-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Provider
                                        </th>

                                        <th>
                                            Requests
                                        </th>

                                        <th>
                                            Cost
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {liveData.providers.map(
                                        (provider) => (

                                            <tr
                                                key={
                                                    provider.provider
                                                }
                                            >

                                                <td>
                                                    {
                                                        provider.provider
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatNumber(
                                                            provider.requests
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatCost(
                                                            provider.cost
                                                        )
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <EmptyState
                            message={
                                "No provider activity."
                            }
                        />

                    )}

                </section>


                {/* MODELS */}

                <section className="live-card">

                    <div className="live-card-header">

                        <div>

                            <h2>
                                Models
                            </h2>

                            <p>
                                Current model activity.
                            </p>

                        </div>

                    </div>


                    {liveData?.models?.length ? (

                        <div className="live-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Model
                                        </th>

                                        <th>
                                            Requests
                                        </th>

                                        <th>
                                            Cost
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {liveData.models.map(
                                        (model) => (

                                            <tr
                                                key={
                                                    model.model
                                                }
                                            >

                                                <td>
                                                    {
                                                        model.model
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatNumber(
                                                            model.requests
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatCost(
                                                            model.cost
                                                        )
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <EmptyState
                            message={
                                "No model activity."
                            }
                        />

                    )}

                </section>

            </div>

        </div>
    );
}


/* =================================
   CONNECTION INDICATOR
================================= */

function ConnectionIndicator({
    status,
}) {

    let text = "Connecting...";
    let className = "connecting";


    if (status === "connected") {

        text = "Live";
        className = "connected";

    } else if (
        status === "disconnected"
    ) {

        text = "Disconnected";
        className = "disconnected";

    } else if (
        status === "unauthorized"
    ) {

        text = "Unauthorized";
        className = "error";

    } else if (
        status === "error"
    ) {

        text = "Connection error";
        className = "error";
    }


    return (
        <div
            className={
                `connection-indicator ${className}`
            }
        >

            <span className="connection-dot" />

            <span>
                {text}
            </span>

        </div>
    );
}


/* =================================
   METRIC CARD
================================= */

function MetricCard({
    title,
    value,
}) {

    return (
        <div className="live-metric-card">

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* =================================
   EMPTY STATE
================================= */

function EmptyState({
    message,
}) {

    return (
        <div className="live-empty">

            {message}

        </div>
    );
}


/* =================================
   NORMALIZE RESPONSE
================================= */

function normalizeLiveData(data) {

    if (!data || typeof data !== "object") {

        return {
            summary: {
                requests: 0,
                success: 0,
                errors: 0,
                timeouts: 0,
                avg_latency: 0,
                cost: 0,
                input_tokens: 0,
                output_tokens: 0,
                total_tokens: 0,
            },

            graph: [],

            providers: [],

            models: [],
        };
    }


    const summary =
        data.summary || {};


    return {

        ...data,

        summary: {

            requests:
                Number(
                    summary.requests
                ) || 0,

            success:
                Number(
                    summary.success
                ) || 0,

            errors:
                Number(
                    summary.errors ??
                    summary.failed
                ) || 0,

            timeouts:
                Number(
                    summary.timeouts
                ) || 0,

            avg_latency:
                Number(
                    summary.avg_latency
                ) || 0,

            cost:
                Number(
                    summary.cost
                ) || 0,

            input_tokens:
                Number(
                    summary.input_tokens
                ) || 0,

            output_tokens:
                Number(
                    summary.output_tokens
                ) || 0,

            total_tokens:
                Number(
                    summary.total_tokens
                ) ||
                (
                    Number(
                        summary.input_tokens
                    ) || 0
                ) +
                (
                    Number(
                        summary.output_tokens
                    ) || 0
                ),
        },


        graph:
            Array.isArray(data.graph)
                ? data.graph
                : [],


        providers:
            Array.isArray(data.providers)
                ? data.providers
                : [],


        models:
            Array.isArray(data.models)
                ? data.models
                : [],
    };
}


/* =================================
   GRAPH NORMALIZATION
================================= */

function normalizeGraph(graph) {

    return graph.map((point) => ({

        ...point,

        requests:
            Number(
                point.requests
            ) || 0,

        success:
            Number(
                point.success
            ) || 0,

        errors:
            Number(
                point.errors ??
                point.failed
            ) || 0,

        timeouts:
            Number(
                point.timeouts
            ) || 0,
    }));
}


/* =================================
   NUMBER
================================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "—";
    }


    return Number(value).toLocaleString(
        undefined,
        {
            maximumFractionDigits: 2,
        }
    );
}


/* =================================
   COST
================================= */

function formatCost(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "—";
    }


    return `$${Number(value).toFixed(4)}`;
}


/* =================================
   LATENCY
================================= */

function formatLatency(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "—";
    }


    const latency =
        Number(value);


    if (latency >= 1000) {

        return `${(
            latency / 1000
        ).toFixed(2)} s`;
    }


    return `${latency.toFixed(0)} ms`;
}


/* =================================
   ERROR HANDLING
================================= */

function getErrorMessage(error) {

    if (!error) {

        return (
            "Something went wrong."
        );
    }


    if (error.response) {

        const status =
            error.response.status;


        if (status === 401) {

            return (
                "Authentication expired. " +
                "Please log in again."
            );
        }


        if (status === 403) {

            return (
                "You are not authorized " +
                "to view live analytics."
            );
        }


        if (status === 422) {

            return (
                "Invalid live analytics request."
            );
        }


        if (status >= 500) {

            return (
                "Server error. Please try again later."
            );
        }


        return (
            error.response.data?.detail ||
            "Unable to load live analytics."
        );
    }


    if (error.request) {

        return (
            "Unable to connect to the TraceForge server."
        );
    }


    return (
        "Something went wrong. Please try again."
    );
}


export default Live;