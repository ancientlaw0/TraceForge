import StatCard from "../ui/StatCard";
import {
    formatNumber,
    formatCost,
    formatLatency,
} from "../../utils/formatters";


export default function DashboardStats({
    summary,
    latency,
}) {
    return (
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
    );
}