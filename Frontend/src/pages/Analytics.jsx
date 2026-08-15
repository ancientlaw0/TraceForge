import { useEffect, useMemo, useState } from "react";
import "../styles/analytics.css";

import {
    getOverview,
    getModels,
    getProviders,
    getTimeseries,
    getErrors,
} from "../api/analytics";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";


function Analytics() {

    /* ================================
       FILTERS
    ================================= */

    const [filters, setFilters] = useState({
        time: "week",
        provider: "",
        model: "",
        status: "",
        start: "",
        end: "",
    });


    /* ================================
       DATA
    ================================= */

    const [overview, setOverview] = useState(null);
    const [models, setModels] = useState([]);
    const [providers, setProviders] = useState([]);
    const [timeseries, setTimeseries] = useState([]);
    const [errors, setErrors] = useState([]);


    /* ================================
       PAGE STATE
    ================================= */

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [errorsBySection, setErrorsBySection] =
        useState({});


    /* ================================
       LOAD ANALYTICS
    ================================= */

    const loadAnalytics = async () => {

        setRefreshing(true);

        const requests = [
            {
                name: "overview",
                request: getOverview(filters),
            },
            {
                name: "models",
                request: getModels(filters),
            },
            {
                name: "providers",
                request: getProviders(filters),
            },
            {
                name: "timeseries",
                request: getTimeseries(filters),
            },
            {
                name: "errors",
                request: getErrors(filters),
            },
        ];


        const results = await Promise.allSettled(
            requests.map((item) => item.request)
        );


        const sectionErrors = {};


        results.forEach((result, index) => {

            const section =
                requests[index].name;


            if (result.status === "fulfilled") {

                switch (section) {

                    case "overview":
                        setOverview(result.value);
                        break;


                    case "models":
                        setModels(
                            Array.isArray(result.value)
                                ? result.value
                                : []
                        );
                        break;


                    case "providers":
                        setProviders(
                            Array.isArray(result.value)
                                ? result.value
                                : []
                        );
                        break;


                    case "timeseries":
                        setTimeseries(
                            Array.isArray(result.value)
                                ? result.value
                                : []
                        );
                        break;


                    case "errors":
                        setErrors(
                            Array.isArray(result.value)
                                ? result.value
                                : []
                        );
                        break;


                    default:
                        break;
                }

            } else {

                sectionErrors[section] =
                    getErrorMessage(result.reason);
            }
        });


        setErrorsBySection(sectionErrors);

        setLoading(false);
        setRefreshing(false);
    };


    /* ================================
       INITIAL LOAD
    ================================= */

    useEffect(() => {
        loadAnalytics();
    }, []);


    /* ================================
       FILTER HANDLING
    ================================= */

    const handleFilterChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleApplyFilters = () => {

        const validationError =
            validateFilters(filters);


        if (validationError) {

            setErrorsBySection((previous) => ({
                ...previous,
                filters: validationError,
            }));

            return;
        }


        setErrorsBySection((previous) => {

            const next = {
                ...previous,
            };

            delete next.filters;

            return next;
        });


        loadAnalytics();
    };


    /* ================================
       DERIVED DATA
    ================================= */

    const summary =
        overview?.summary;


    const latency =
        overview?.latency;


    const derived =
        useMemo(
            () => calculateDerivedMetrics(summary),
            [summary]
        );


    const formattedTimeseries =
        useMemo(
            () =>
                timeseries.map((item) => ({
                    ...item,
                    time: formatTimestamp(
                        item.timestamp
                    ),
                })),
            [timeseries]
        );


    /* ================================
       INITIAL LOADING
    ================================= */

    if (loading) {

        return (
            <div className="analytics-page">

                <div className="analytics-loading">

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Loading analytics...
                    </p>

                </div>

            </div>
        );
    }


    /* ================================
       PAGE
    ================================= */

    return (
        <div className="analytics-page">

            {/* =================================
                HEADER
            ================================= */}

            <header className="analytics-header">

                <div>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        Monitor requests, latency,
                        cost, tokens and errors.
                    </p>

                </div>


                <button
                    className="secondary-button"
                    onClick={loadAnalytics}
                    disabled={refreshing}
                >
                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </header>


            {/* =================================
                FILTERS
            ================================= */}

            <section className="analytics-filters">

                <div className="section-heading">

                    <div>

                        <h2>
                            Filters
                        </h2>

                        <p>
                            Filters apply to all
                            analytics endpoints.
                        </p>

                    </div>

                </div>


                <div className="filter-grid">

                    <FilterField
                        label="Time"
                    >

                        <select
                            name="time"
                            value={filters.time}
                            onChange={
                                handleFilterChange
                            }
                        >

                            <option value="hour">
                                Last hour
                            </option>

                            <option value="day">
                                Last 24 hours
                            </option>

                            <option value="week">
                                Last 7 days
                            </option>

                            <option value="month">
                                Last 30 days
                            </option>

                            <option value="custom">
                                Custom
                            </option>

                        </select>

                    </FilterField>


                    <FilterField
                        label="Provider"
                    >

                        <input
                            type="text"
                            name="provider"
                            value={filters.provider}
                            placeholder="All providers"
                            onChange={
                                handleFilterChange
                            }
                        />

                    </FilterField>


                    <FilterField
                        label="Model"
                    >

                        <input
                            type="text"
                            name="model"
                            value={filters.model}
                            placeholder="All models"
                            onChange={
                                handleFilterChange
                            }
                        />

                    </FilterField>


                    <FilterField
                        label="Status"
                    >

                        <select
                            name="status"
                            value={filters.status}
                            onChange={
                                handleFilterChange
                            }
                        >

                            <option value="">
                                All statuses
                            </option>

                            <option value="success">
                                Success
                            </option>

                            <option value="error">
                                Error
                            </option>

                            <option value="timeout">
                                Timeout
                            </option>

                        </select>

                    </FilterField>

                </div>


                {/* CUSTOM DATE */}

                {filters.time === "custom" && (

                    <div className="custom-date-grid">

                        <FilterField
                            label="Start"
                        >

                            <input
                                type="datetime-local"
                                name="start"
                                value={filters.start}
                                onChange={
                                    handleFilterChange
                                }
                            />

                        </FilterField>


                        <FilterField
                            label="End"
                        >

                            <input
                                type="datetime-local"
                                name="end"
                                value={filters.end}
                                onChange={
                                    handleFilterChange
                                }
                            />

                        </FilterField>

                    </div>

                )}


                {errorsBySection.filters && (

                    <div className="inline-error">

                        {errorsBySection.filters}

                    </div>

                )}


                <button
                    className="primary-button"
                    onClick={
                        handleApplyFilters
                    }
                    disabled={refreshing}
                >
                    {refreshing
                        ? "Applying..."
                        : "Apply Filters"}
                </button>

            </section>


            {/* =================================
                KPI CARDS
            ================================= */}

            <section className="metric-grid">

                <MetricCard
                    title="Total Requests"
                    value={formatNumber(
                        summary?.total_requests
                    )}
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="Success Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                summary.success_rate
                            )}%`
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="Error Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                summary.error_rate
                            )}%`
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="Timeout Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                summary.timeout_rate
                            )}%`
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="Total Cost"
                    value={
                        summary
                            ? formatCost(
                                summary.total_cost
                            )
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="Average Latency"
                    value={
                        latency
                            ? formatLatency(
                                latency.average
                            )
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="P50 Latency"
                    value={
                        latency
                            ? formatLatency(
                                latency.p50
                            )
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="P95 Latency"
                    value={
                        latency
                            ? formatLatency(
                                latency.p95
                            )
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />


                <MetricCard
                    title="P99 Latency"
                    value={
                        latency
                            ? formatLatency(
                                latency.p99
                            )
                            : "—"
                    }
                    error={
                        errorsBySection.overview
                    }
                />

            </section>


            {/* =================================
                EFFICIENCY
            ================================= */}

            <section className="analytics-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Efficiency
                        </h2>

                        <p>
                            Calculated from the
                            returned analytics.
                        </p>

                    </div>

                </div>


                <div className="metric-grid">

                    <MetricCard
                        title="Cost / Request"
                        value={
                            derived.costPerRequest !== null
                                ? formatCost(
                                    derived.costPerRequest
                                )
                                : "—"
                        }
                    />


                    <MetricCard
                        title="Tokens / Request"
                        value={
                            derived.tokensPerRequest !== null
                                ? formatNumber(
                                    derived.tokensPerRequest
                                )
                                : "—"
                        }
                    />


                    <MetricCard
                        title="Input Tokens / Request"
                        value={
                            derived.inputTokensPerRequest !== null
                                ? formatNumber(
                                    derived.inputTokensPerRequest
                                )
                                : "—"
                        }
                    />


                    <MetricCard
                        title="Output Tokens / Request"
                        value={
                            derived.outputTokensPerRequest !== null
                                ? formatNumber(
                                    derived.outputTokensPerRequest
                                )
                                : "—"
                        }
                    />


                    <MetricCard
                        title="Total Input Tokens"
                        value={formatNumber(
                            summary?.total_input_tokens
                        )}
                    />


                    <MetricCard
                        title="Total Output Tokens"
                        value={formatNumber(
                            summary?.total_output_tokens
                        )}
                    />

                </div>

            </section>


            {/* =================================
                REQUEST ACTIVITY
            ================================= */}

            <ChartCard
                title="Request Activity"
                error={
                    errorsBySection.timeseries
                }
                empty={!timeseries.length}
            >

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart
                        data={formattedTimeseries}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="time"
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
                            dataKey="successful_requests"
                            name="Successful"
                            dot={false}
                        />


                        <Line
                            type="monotone"
                            dataKey="error_requests"
                            name="Errors"
                            dot={false}
                        />


                        <Line
                            type="monotone"
                            dataKey="timeout_requests"
                            name="Timeouts"
                            dot={false}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </ChartCard>


            {/* =================================
                COST + TOKENS
            ================================= */}

            <div className="two-column">

                <ChartCard
                    title="Cost Over Time"
                    error={
                        errorsBySection.timeseries
                    }
                    empty={!timeseries.length}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={formattedTimeseries}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="time"
                            />

                            <YAxis />

                            <Tooltip />


                            <Line
                                type="monotone"
                                dataKey="total_cost"
                                name="Cost"
                                dot={false}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </ChartCard>


                <ChartCard
                    title="Token Usage"
                    error={
                        errorsBySection.timeseries
                    }
                    empty={!timeseries.length}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={formattedTimeseries}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="time"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />


                            <Line
                                type="monotone"
                                dataKey="total_input_tokens"
                                name="Input Tokens"
                                dot={false}
                            />


                            <Line
                                type="monotone"
                                dataKey="total_output_tokens"
                                name="Output Tokens"
                                dot={false}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </ChartCard>

            </div>


            {/* =================================
                LATENCY
            ================================= */}

            <ChartCard
                title="Latency Distribution"
                error={
                    errorsBySection.overview
                }
                empty={!latency}
            >

                {latency && (

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={[
                                {
                                    name: "Average",
                                    value: latency.average,
                                },
                                {
                                    name: "P50",
                                    value: latency.p50,
                                },
                                {
                                    name: "P95",
                                    value: latency.p95,
                                },
                                {
                                    name: "P99",
                                    value: latency.p99,
                                },
                            ]}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="name"
                            />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="value"
                                name="Latency"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </ChartCard>


            {/* =================================
                MODEL PERFORMANCE
            ================================= */}

            <ChartCard
                title="Model Performance"
                error={
                    errorsBySection.models
                }
                empty={!models.length}
            >

                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Provider
                                </th>

                                <th>
                                    Model
                                </th>

                                <th>
                                    Requests
                                </th>

                                <th>
                                    Success
                                </th>

                                <th>
                                    Errors
                                </th>

                                <th>
                                    Timeouts
                                </th>

                                <th>
                                    Avg Latency
                                </th>

                                <th>
                                    P95
                                </th>

                                <th>
                                    Cost
                                </th>

                                <th>
                                    Cost / Request
                                </th>

                                <th>
                                    Tokens / Request
                                </th>

                                <th>
                                    Error Rate
                                </th>

                                <th>
                                    Timeout Rate
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {models.map((model) => (

                                <tr
                                    key={`${model.provider}-${model.model}`}
                                >

                                    <td>
                                        {model.provider}
                                    </td>

                                    <td>
                                        {model.model}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.successful_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.error_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.timeout_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatLatency(
                                            model.average_latency
                                        )}
                                    </td>

                                    <td>
                                        {formatLatency(
                                            model.p95_latency
                                        )}
                                    </td>

                                    <td>
                                        {formatCost(
                                            model.total_cost
                                        )}
                                    </td>

                                    <td>
                                        {formatCost(
                                            getCostPerRequest(
                                                model
                                            )
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            getTokensPerRequest(
                                                model
                                            )
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.error_rate
                                        )}%
                                    </td>

                                    <td>
                                        {formatNumber(
                                            model.timeout_rate
                                        )}%
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </ChartCard>


            {/* =================================
                PROVIDER CHARTS
            ================================= */}

            <div className="two-column">

                <ChartCard
                    title="Provider Cost"
                    error={
                        errorsBySection.providers
                    }
                    empty={!providers.length}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={providers}
                            layout="vertical"
                            margin={{
                                left: 30,
                                right: 20,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                type="number"
                            />

                            <YAxis
                                type="category"
                                dataKey="provider"
                                width={100}
                            />

                            <Tooltip />

                            <Bar
                                dataKey="total_cost"
                                name="Cost"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </ChartCard>


                <ChartCard
                    title="Provider Latency"
                    error={
                        errorsBySection.providers
                    }
                    empty={!providers.length}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={providers}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="provider"
                            />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="average_latency"
                                name="Average Latency"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </ChartCard>

            </div>


            {/* =================================
                PROVIDER PERFORMANCE
            ================================= */}

            <ChartCard
                title="Provider Performance"
                error={
                    errorsBySection.providers
                }
                empty={!providers.length}
            >

                <div className="table-wrapper">

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
                                    Success
                                </th>

                                <th>
                                    Errors
                                </th>

                                <th>
                                    Timeouts
                                </th>

                                <th>
                                    Avg Latency
                                </th>

                                <th>
                                    P95
                                </th>

                                <th>
                                    Cost
                                </th>

                                <th>
                                    Cost / Request
                                </th>

                                <th>
                                    Tokens / Request
                                </th>

                                <th>
                                    Error Rate
                                </th>

                                <th>
                                    Timeout Rate
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {providers.map((provider) => (

                                <tr
                                    key={provider.provider}
                                >

                                    <td>
                                        {provider.provider}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.successful_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.error_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.timeout_requests
                                        )}
                                    </td>

                                    <td>
                                        {formatLatency(
                                            provider.average_latency
                                        )}
                                    </td>

                                    <td>
                                        {formatLatency(
                                            provider.p95_latency
                                        )}
                                    </td>

                                    <td>
                                        {formatCost(
                                            provider.total_cost
                                        )}
                                    </td>

                                    <td>
                                        {formatCost(
                                            getCostPerRequest(
                                                provider
                                            )
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            getTokensPerRequest(
                                                provider
                                            )
                                        )}
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.error_rate
                                        )}%
                                    </td>

                                    <td>
                                        {formatNumber(
                                            provider.timeout_rate
                                        )}%

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </ChartCard>


            {/* =================================
                TOP ERRORS
            ================================= */}

            <ChartCard
                title="Top Errors"
                error={
                    errorsBySection.errors
                }
                empty={!errors.length}
            >

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart
                        data={errors}
                        layout="vertical"
                        margin={{
                            left: 50,
                            right: 20,
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            type="number"
                        />

                        <YAxis
                            type="category"
                            dataKey="error_message"
                            width={220}
                        />

                        <Tooltip />

                        <Bar
                            dataKey="count"
                            name="Occurrences"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </ChartCard>

        </div>
    );
}


/* =================================
   FILTER FIELD
================================= */

function FilterField({
    label,
    children,
}) {

    return (
        <div className="filter-field">

            <label>
                {label}
            </label>

            {children}

        </div>
    );
}


/* =================================
   METRIC CARD
================================= */

function MetricCard({
    title,
    value,
    error,
}) {

    return (
        <div className="metric-card">

            <span className="metric-title">
                {title}
            </span>


            {error ? (

                <p className="metric-error">
                    {error}
                </p>

            ) : (

                <strong className="metric-value">
                    {value}
                </strong>

            )}

        </div>
    );
}


/* =================================
   CHART CARD
================================= */

function ChartCard({
    title,
    children,
    error,
    empty,
}) {

    return (
        <section className="chart-card">

            <div className="chart-heading">

                <h2>
                    {title}
                </h2>

            </div>


            {error ? (

                <div className="section-error">

                    <strong>
                        Unable to load this section.
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            ) : empty ? (

                <div className="empty-state">

                    No data available for the
                    selected filters.

                </div>

            ) : (

                children

            )}

        </section>
    );
}


/* =================================
   FILTER VALIDATION
================================= */

function validateFilters(filters) {

    if (filters.time !== "custom") {
        return null;
    }


    if (!filters.start || !filters.end) {

        return (
            "Please select both start and end dates."
        );
    }


    const start =
        new Date(filters.start);

    const end =
        new Date(filters.end);


    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {

        return (
            "Please enter valid dates."
        );
    }


    if (start >= end) {

        return (
            "Start date must be before end date."
        );
    }


    return null;
}


/* =================================
   DERIVED METRICS
================================= */

function calculateDerivedMetrics(summary) {

    if (!summary) {

        return {
            costPerRequest: null,
            tokensPerRequest: null,
            inputTokensPerRequest: null,
            outputTokensPerRequest: null,
        };
    }


    const requests =
        Number(summary.total_requests) || 0;


    const cost =
        Number(summary.total_cost) || 0;


    const inputTokens =
        Number(summary.total_input_tokens) || 0;


    const outputTokens =
        Number(summary.total_output_tokens) || 0;


    return {

        costPerRequest:
            requests > 0
                ? cost / requests
                : null,


        tokensPerRequest:
            requests > 0
                ? (
                    inputTokens +
                    outputTokens
                ) / requests
                : null,


        inputTokensPerRequest:
            requests > 0
                ? inputTokens / requests
                : null,


        outputTokensPerRequest:
            requests > 0
                ? outputTokens / requests
                : null,
    };
}


/* =================================
   MODEL / PROVIDER CALCULATIONS
================================= */

function getCostPerRequest(item) {

    const requests =
        Number(item?.requests) || 0;


    const cost =
        Number(item?.total_cost) || 0;


    if (requests <= 0) {
        return null;
    }


    return cost / requests;
}


function getTokensPerRequest(item) {

    const requests =
        Number(item?.requests) || 0;


    const input =
        Number(item?.total_input_tokens) || 0;


    const output =
        Number(item?.total_output_tokens) || 0;


    if (requests <= 0) {
        return null;
    }


    return (
        (input + output) / requests
    );
}


/* =================================
   NUMBER FORMATTING
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
   COST FORMATTING
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
   LATENCY FORMATTING
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
   TIMESTAMP FORMATTING
================================= */

function formatTimestamp(timestamp) {

    if (!timestamp) {
        return "";
    }


    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
        }
    );
}


/* =================================
   ERROR HANDLING
================================= */

function getErrorMessage(error) {

    if (!error) {
        return "Unknown error.";
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
                "to view this analytics data."
            );
        }


        if (status === 422) {

            const detail =
                error.response.data?.detail;


            if (Array.isArray(detail)) {

                return (
                    "Invalid analytics filters."
                );
            }


            return (
                detail ||
                "Invalid analytics filters."
            );
        }


        if (status === 404) {

            return (
                "Analytics endpoint was not found."
            );
        }


        if (status >= 500) {

            return (
                "Server error. Please try again later."
            );
        }


        return (
            error.response.data?.detail ||
            "Unable to load this section."
        );
    }


    if (error.request) {

        return (
            "Unable to connect to the server."
        );
    }


    return (
        "Something went wrong. Please try again."
    );
}


export default Analytics;