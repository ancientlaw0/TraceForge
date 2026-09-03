export default function ChartCard({
    title,
    subtitle,
    children,
    error,
    empty,
}) {
    return (
        <section className="chart-card">
            <div className="chart-card-header">
                <div>
                    <h2>{title}</h2>

                    {subtitle && (
                        <p>{subtitle}</p>
                    )}
                </div>
            </div>

            {error ? (
                <div className="section-error">
                    <strong>
                        Unable to load this section
                    </strong>

                    <span>{error}</span>
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