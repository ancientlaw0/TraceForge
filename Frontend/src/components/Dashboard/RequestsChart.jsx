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


export default function RequestsChart({
    data,
    timeRange,
}) {

    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>
                    No request data available for this period.
                </p>
            </div>
        );
    }


    const width = 760;
    const height = 240;


    const values = data.map(
        (point) => Number(point.requests || 0)
    );

    const max = Math.max(...values);
    const min = Math.min(...values);

    const range = max - min;


    const coordinates = data.map(
        (point, index) => {

            const x =
                data.length === 1
                    ? width / 2
                    : (
                        index /
                        (data.length - 1)
                    ) * width;


            const normalized =
                range === 0
                    ? 0.5
                    : (
                        Number(
                            point.requests || 0
                        ) - min
                    ) / range;


            const y =
                height -
                normalized *
                    (height - 20) -
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