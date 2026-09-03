export default function MetricCard({
    label,
    value,
    tone = "",
    icon,
}) {
    return (
        <div
            className={`metric-card ${
                tone
                    ? `metric-${tone}`
                    : ""
            }`}
        >
            <div className="metric-card-top">
                <span className="metric-label">
                    {label}
                </span>

                {icon && (
                    <span className="metric-icon">
                        {icon}
                    </span>
                )}
            </div>

            <strong className="metric-value">
                {value}
            </strong>
        </div>
    );
}