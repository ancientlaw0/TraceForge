import {
    formatLatency,
} from "../../utils/formatters";


export default function LatencySummary({
    latency,
}) {
    return (
        <div className="dashboard-card surface">

            <div className="card-header">

                <div>

                    <h2>
                        Latency
                    </h2>

                    <p>
                        Response time distribution.
                    </p>

                </div>

            </div>


            <div className="latency-list">

                <div>

                    <span>
                        Average
                    </span>

                    <strong>
                        {formatLatency(
                            latency.average
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        P50
                    </span>

                    <strong>
                        {formatLatency(
                            latency.p50
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        P95
                    </span>

                    <strong>
                        {formatLatency(
                            latency.p95
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        P99
                    </span>

                    <strong>
                        {formatLatency(
                            latency.p99
                        )}
                    </strong>

                </div>

            </div>

        </div>
    );
}