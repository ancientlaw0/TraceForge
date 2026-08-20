import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ActiveAlerts.css";
import { getAlerts } from "../api/alerts";
export default function ActiveAlerts() {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadAlerts() {

            try {
                const data = await getAlerts();

                setAlerts(
                    data
                        .filter((alert) => alert.enabled)
                        .slice(0, 5)
                );

            } catch (error) {

                console.error(
                    "Failed to load alerts:",
                    error
                );

            } finally {

                setLoading(false);

            }
        }

        loadAlerts();

    }, []);

    return (
        <section className="active-alerts-section">

            <div className="active-alerts-header">

                <div className="active-alerts-header-content">

                    <h2>
                        Active alerts
                    </h2>

                    <p>
                        Conditions currently being monitored.
                    </p>

                </div>

                <Link
                    to="/alerts"
                    className="active-alerts-view-all"
                >
                    View all →
                </Link>

            </div>


            <div className="surface active-alerts-card">

                {loading && (
                    <div className="active-alerts-empty">
                        Loading alerts...
                    </div>
                )}


                {!loading && alerts.length === 0 && (
                    <div className="active-alerts-empty">

                        <strong>
                            No active alerts
                        </strong>

                        <span>
                            Your configured alert conditions
                            will appear here.
                        </span>

                    </div>
                )}


                {!loading && alerts.length > 0 && (

                    <div className="active-alerts-list">

                        {alerts.map((alert) => (

                            <div
                                className="active-alert-row"
                                key={alert.id}
                            >

                                <div className="active-alert-info">

                                    <span className="active-alert-metric">
                                        {formatMetric(alert.metric)}
                                    </span>

                                    <span className="active-alert-rule">
                                        {alert.operator}{" "}
                                        {alert.threshold_value}
                                    </span>

                                    <span className="active-alert-window">
                                        {alert.window_minutes} min window
                                    </span>

                                </div>


                                <span className="active-alert-status">
                                    Monitoring
                                </span>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}


function formatMetric(metric) {

    const names = {
        latency_avg: "Average latency",
        latency_max: "Maximum latency",
        error_rate: "Error rate",
        timeout_rate: "Timeout rate",
        cost: "Cost",
        total_tokens: "Total tokens",
    };

    return names[metric] || metric;
}