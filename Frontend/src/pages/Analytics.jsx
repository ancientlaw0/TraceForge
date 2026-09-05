import "../css/analytics.css";

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
    Cell,
} from "recharts";

import useAnalytics from "../hooks/useAnalytics";

import {
    formatNumber,
    formatCost,
    formatLatency,
    formatTimestamp,
} from "../utils/formatters";

import FilterField from "../components/analytics/FilterField";
import MetricCard from "../components/analytics/MetricCard";
import ChartCard from "../components/analytics/ChartCard";
import TraceExplorer from "../components/analytics/TraceExplorer";


const CHART = {
    primary: "#315f50",
    secondary: "#6f9689",
    tertiary: "#9bb6ad",
    error: "#b85c5c",
    warning: "#b68a4a",
    grid: "#deddd6",
};

const tooltipStyle = {
    background: "#ffffff",
    border: "1px solid #deddd6",
    borderRadius: "8px",
    boxShadow:
        "0 8px 24px rgba(15, 23, 42, 0.08)",
    fontSize: "12px",
};

function Analytics() {
    const {
        filters,
        overview,
        models,
        providers,
        timeseries,
        errors,
        traces,

        providerCatalog,
        availableModels,

        loading,
        refreshing,
        errorsBySection,

        loadAnalytics,
        handleFilterChange,
        handleApplyFilters,
    } = useAnalytics();

    const summary = overview?.summary;
    const latency = overview?.latency;

    const formattedTimeseries =
        timeseries.map((item) => ({
            ...item,
            time: formatTimestamp(
                item.timestamp
            ),
        }));

    const latencyData = latency
        ? [
              {
                  name: "Average",
                  value: Number(
                      latency.average || 0
                  ),
              },
              {
                  name: "P50",
                  value: Number(
                      latency.p50 || 0
                  ),
              },
              {
                  name: "P95",
                  value: Number(
                      latency.p95 || 0
                  ),
              },
              {
                  name: "P99",
                  value: Number(
                      latency.p99 || 0
                  ),
              },
          ]
        : [];

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="analytics-loading">
                    <div className="loading-spinner" />

                    <span>
                        Loading analytics...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">

            {/* HEADER */}

            <header className="analytics-header">
                <div>
                    <div className="analytics-eyebrow">
                        OBSERVABILITY
                    </div>

                    <h1>Analytics</h1>

                    <p>
                        Monitor requests, latency,
                        cost, tokens and errors.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadAnalytics}
                    disabled={refreshing}
                >
                    <span
                        className={
                            refreshing
                                ? "refresh-icon spinning"
                                : "refresh-icon"
                        }
                    >
                        ↻
                    </span>

                    {refreshing
                        ? "Refreshing"
                        : "Refresh"}
                </button>
            </header>

            {/* FILTERS */}

            <section className="filters-card">
                <div className="section-heading">
                    <div>
                        <h2>Filters</h2>

                        <p>
                            Narrow analytics to the
                            traffic you want to inspect.
                        </p>
                    </div>
                </div>

                <div className="filter-grid">

                    <FilterField label="Time">
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
                                Custom range
                            </option>

                            <option value="all">
                                All time
                            </option>
                        </select>
                    </FilterField>

                    <FilterField label="Provider">
                        <select
                            name="provider"
                            value={filters.provider}
                            onChange={
                                handleFilterChange
                            }
                        >
                            <option value="">
                                All providers
                            </option>

                            {providerCatalog.map(
                                (provider) => (
                                    <option
                                        key={provider}
                                        value={provider}
                                    >
                                        {provider}
                                    </option>
                                )
                            )}
                        </select>
                    </FilterField>

                    <FilterField label="Model">
                        <select
                            name="model"
                            value={filters.model}
                            onChange={
                                handleFilterChange
                            }
                        >
                            <option value="">
                                All models
                            </option>

                            {availableModels.map(
                                (item) => (
                                    <option
                                        key={`${item.provider}-${item.model}`}
                                        value={item.model}
                                    >
                                        {item.model}
                                    </option>
                                )
                            )}
                        </select>
                    </FilterField>

                    <FilterField label="Status">
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

                {filters.time === "custom" && (
                    <div className="custom-date-grid">
                        <FilterField label="Start">
                            <input
                                type="datetime-local"
                                name="start"
                                value={filters.start}
                                onChange={
                                    handleFilterChange
                                }
                            />
                        </FilterField>

                        <FilterField label="End">
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
                    <div className="filter-error">
                        {errorsBySection.filters}
                    </div>
                )}

                <div className="filter-actions">
                    <span className="filter-summary">
                        {filters.provider ||
                            "All providers"}
                        {" · "}
                        {filters.model ||
                            "All models"}
                        {" · "}
                        {filters.status ||
                            "All statuses"}
                    </span>

                    <button
                        className="apply-button"
                        onClick={
                            handleApplyFilters
                        }
                        disabled={refreshing}
                    >
                        Apply Filters
                    </button>
                </div>
            </section>

            {/* KPI GRID */}

            <section className="metric-grid">
                <MetricCard
                    label="Total Requests"
                    value={formatNumber(
                        summary?.total_requests
                    )}
                    icon="↗"
                />

                <MetricCard
                    label="Success Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                  summary.success_rate
                              )}%`
                            : "—"
                    }
                    tone="success"
                />

                <MetricCard
                    label="Error Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                  summary.error_rate
                              )}%`
                            : "—"
                    }
                    tone="error"
                />

                <MetricCard
                    label="Timeout Rate"
                    value={
                        summary
                            ? `${formatNumber(
                                  summary.timeout_rate
                              )}%`
                            : "—"
                    }
                    tone="warning"
                />

                <MetricCard
                    label="Total Cost"
                    value={
                        summary
                            ? formatCost(
                                  summary.total_cost
                              )
                            : "—"
                    }
                    tone="cost"
                />

                <MetricCard
                    label="Average Latency"
                    value={
                        latency
                            ? formatLatency(
                                  latency.average
                              )
                            : "—"
                    }
                />
            </section>

            {/* REQUEST ACTIVITY */}

            <ChartCard
                title="Request Activity"
                subtitle="Traffic volume and request outcomes"
                error={
                    errorsBySection.timeseries
                }
                empty={!timeseries.length}
            >
                <ResponsiveContainer
                    width="100%"
                    height={320}
                >
                    <LineChart
                        data={formattedTimeseries}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -10,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            stroke={CHART.grid}
                            strokeDasharray="3 5"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={42}
                        />

                        <Tooltip
                            contentStyle={
                                tooltipStyle
                            }
                        />

                        <Legend
                            verticalAlign="top"
                            align="right"
                            height={36}
                        />

                        <Line
                            type="monotone"
                            dataKey="requests"
                            name="Requests"
                            stroke={
                                CHART.primary
                            }
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5 }}
                        />

                        <Line
                            type="monotone"
                            dataKey="successful_requests"
                            name="Successful"
                            stroke={
                                CHART.secondary
                            }
                            strokeWidth={2}
                            dot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="error_requests"
                            name="Errors"
                            stroke={
                                CHART.error
                            }
                            strokeWidth={2}
                            dot={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="timeout_requests"
                            name="Timeouts"
                            stroke={
                                CHART.warning
                            }
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* COST + TOKENS */}

            <div className="two-column">

                <ChartCard
                    title="Cost Over Time"
                    subtitle="Total request cost"
                    error={
                        errorsBySection.timeseries
                    }
                    empty={!timeseries.length}
                >
                    <ResponsiveContainer
                        width="100%"
                        height={250}
                    >
                        <LineChart
                            data={formattedTimeseries}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                stroke={CHART.grid}
                                strokeDasharray="3 5"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={48}
                            />

                            <Tooltip
                                contentStyle={
                                    tooltipStyle
                                }
                                formatter={(value) =>
                                    formatCost(
                                        value
                                    )
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="total_cost"
                                name="Cost"
                                stroke={
                                    CHART.primary
                                }
                                strokeWidth={2.5}
                                dot={false}
                                fill={
                                    CHART.primary
                                }
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Token Usage"
                    subtitle="Input vs output tokens"
                    error={
                        errorsBySection.timeseries
                    }
                    empty={!timeseries.length}
                >
                    <ResponsiveContainer
                        width="100%"
                        height={250}
                    >
                        <LineChart
                            data={formattedTimeseries}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                stroke={CHART.grid}
                                strokeDasharray="3 5"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={52}
                            />

                            <Tooltip
                                contentStyle={
                                    tooltipStyle
                                }
                            />

                            <Legend
                                verticalAlign="top"
                                align="right"
                                height={32}
                            />

                            <Line
                                type="monotone"
                                dataKey="total_input_tokens"
                                name="Input"
                                stroke={
                                    CHART.primary
                                }
                                strokeWidth={2}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="total_output_tokens"
                                name="Output"
                                stroke={
                                    CHART.secondary
                                }
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

            </div>

            {/* LATENCY */}

            <ChartCard
                title="Latency Distribution"
                subtitle="Average and percentile latency"
                error={
                    errorsBySection.overview
                }
                empty={!latency}
            >
                <ResponsiveContainer
                    width="100%"
                    height={270}
                >
                    <BarChart
                        data={latencyData}
                        margin={{
                            top: 15,
                            right: 10,
                            left: -10,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid
                            stroke={CHART.grid}
                            strokeDasharray="3 5"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={50}
                        />

                        <Tooltip
                            contentStyle={
                                tooltipStyle
                            }
                            formatter={(value) =>
                                formatLatency(
                                    value
                                )
                            }
                        />

                        <Bar
                            dataKey="value"
                            name="Latency"
                            radius={[
                                6,
                                6,
                                0,
                                0,
                            ]}
                            barSize={48}
                        >
                            {latencyData.map(
                                (_, index) => (
                                    <Cell
                                        key={index}
                                        fill={
                                            [
                                                CHART.tertiary,
                                                CHART.secondary,
                                                CHART.primary,
                                                CHART.primary,
                                            ][index]
                                        }
                                    />
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* MODEL PERFORMANCE */}

            <ChartCard
                title="Model Performance"
                subtitle="Performance across individual models"
                error={
                    errorsBySection.models
                }
                empty={!models.length}
            >
                <div className="table-wrapper">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Provider</th>
                                <th>Model</th>
                                <th>Requests</th>
                                <th>Success</th>
                                <th>Avg Latency</th>
                                <th>P95</th>
                                <th>Cost</th>
                                <th>Error Rate</th>
                            </tr>
                        </thead>

                        <tbody>
                            {models.map((model) => (
                                <tr
                                    key={`${model.provider}-${model.model}`}
                                >
                                    <td>
                                        <span className="provider-badge">
                                            {
                                                model.provider
                                            }
                                        </span>
                                    </td>

                                    <td>
                                        <span className="model-name">
                                            {model.model}
                                        </span>
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
                                        <span
                                            className={
                                                getRateClass(
                                                    model.error_rate
                                                )
                                            }
                                        >
                                            {formatNumber(
                                                model.error_rate
                                            )}
                                            %
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>

            {/* PROVIDER CHARTS */}

            <div className="two-column">

                <ChartCard
                    title="Provider Cost"
                    subtitle="Total spend by provider"
                    error={
                        errorsBySection.providers
                    }
                    empty={!providers.length}
                >
                    <ResponsiveContainer
                        width="100%"
                        height={270}
                    >
                        <BarChart
                            data={providers}
                            layout="vertical"
                            margin={{
                                top: 5,
                                right: 20,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                stroke={CHART.grid}
                                strokeDasharray="3 5"
                                horizontal={false}
                            />

                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                type="category"
                                dataKey="provider"
                                width={70}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                contentStyle={
                                    tooltipStyle
                                }
                                formatter={(value) =>
                                    formatCost(
                                        value
                                    )
                                }
                            />

                            <Bar
                                dataKey="total_cost"
                                name="Cost"
                                fill={
                                    CHART.primary
                                }
                                radius={[
                                    0,
                                    6,
                                    6,
                                    0,
                                ]}
                                barSize={28}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Provider Latency"
                    subtitle="Average latency by provider"
                    error={
                        errorsBySection.providers
                    }
                    empty={!providers.length}
                >
                    <ResponsiveContainer
                        width="100%"
                        height={270}
                    >
                        <BarChart
                            data={providers}
                            margin={{
                                top: 5,
                                right: 10,
                                left: -10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                stroke={CHART.grid}
                                strokeDasharray="3 5"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="provider"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                contentStyle={
                                    tooltipStyle
                                }
                                formatter={(value) =>
                                    formatLatency(
                                        value
                                    )
                                }
                            />

                            <Bar
                                dataKey="average_latency"
                                name="Average Latency"
                                fill={
                                    CHART.secondary
                                }
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                ]}
                                barSize={42}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

            </div>

            {/* PROVIDER PERFORMANCE */}

            <ChartCard
                title="Provider Performance"
                subtitle="Aggregated provider metrics"
                error={
                    errorsBySection.providers
                }
                empty={!providers.length}
            >
                <div className="table-wrapper">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Provider</th>
                                <th>Requests</th>
                                <th>Success</th>
                                <th>Errors</th>
                                <th>Timeouts</th>
                                <th>Avg Latency</th>
                                <th>P95</th>
                                <th>Cost</th>
                                <th>Error Rate</th>
                            </tr>
                        </thead>

                        <tbody>
                            {providers.map(
                                (provider) => (
                                    <tr
                                        key={
                                            provider.provider
                                        }
                                    >
                                        <td>
                                            <span className="provider-badge">
                                                {
                                                    provider.provider
                                                }
                                            </span>
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

                                        <td className="error-number">
                                            {formatNumber(
                                                provider.error_requests
                                            )}
                                        </td>

                                        <td className="timeout-number">
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
                                            <span
                                                className={
                                                    getRateClass(
                                                        provider.error_rate
                                                    )
                                                }
                                            >
                                                {formatNumber(
                                                    provider.error_rate
                                                )}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </ChartCard>

            {/* TOP ERRORS */}

            <ChartCard
                title="Top Errors"
                subtitle="Most frequent error messages"
                error={
                    errorsBySection.errors
                }
                empty={!errors.length}
            >
                <ResponsiveContainer
                    width="100%"
                    height={Math.max(
                        230,
                        Math.min(
                            errors.slice(
                                0,
                                5
                            ).length *
                                52 +
                                70,
                            340
                        )
                    )}
                >
                    <BarChart
                        data={errors.slice(
                            0,
                            5
                        )}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 25,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            stroke={CHART.grid}
                            strokeDasharray="3 5"
                            horizontal={false}
                        />

                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            type="category"
                            dataKey="error_message"
                            width={220}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={
                                truncateError
                            }
                        />

                        <Tooltip
                            contentStyle={
                                tooltipStyle
                            }
                        />

                        <Bar
                            dataKey="count"
                            name="Occurrences"
                            fill={
                                CHART.error
                            }
                            radius={[
                                0,
                                6,
                                6,
                                0,
                            ]}
                            barSize={25}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <TraceExplorer
                traces={traces}
                error={errorsBySection.traces}
            />
        </div>
    );
}

function truncateError(value) {
    if (!value) {
        return "";
    }

    if (value.length <= 32) {
        return value;
    }

    return `${value.slice(0, 32)}…`;
}

function getRateClass(rate) {
    const value = Number(rate);

    if (value >= 40) {
        return "rate-high";
    }

    if (value >= 20) {
        return "rate-medium";
    }

    return "rate-low";
}

export default Analytics;