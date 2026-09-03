export default function StatCard({
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