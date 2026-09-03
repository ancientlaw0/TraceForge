import {
    formatNumber,
    formatCost,
} from "../../utils/formatters";


export default function TokenCostSummary({
    summary,
}) {
    return (
        <section className="health-grid">

            {/* TOKEN USAGE */}

            <div className="dashboard-card surface">

                <div className="card-header">

                    <div>

                        <h2>
                            Token usage
                        </h2>

                        <p>
                            Recorded token consumption.
                        </p>

                    </div>

                </div>


                <div className="latency-list">

                    <div>

                        <span>
                            Input tokens
                        </span>

                        <strong>
                            {formatNumber(
                                summary.total_input_tokens
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Output tokens
                        </span>

                        <strong>
                            {formatNumber(
                                summary.total_output_tokens
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total tokens
                        </span>

                        <strong>
                            {formatNumber(
                                (
                                    summary.total_input_tokens ||
                                    0
                                ) +
                                (
                                    summary.total_output_tokens ||
                                    0
                                )
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* COST */}

            <div className="dashboard-card surface">

                <div className="card-header">

                    <div>

                        <h2>
                            Cost
                        </h2>

                        <p>
                            Recorded model usage cost.
                        </p>

                    </div>

                </div>


                <div className="latency-list">

                    <div>

                        <span>
                            Total
                        </span>

                        <strong>
                            {formatCost(
                                summary.total_cost
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        </section>
    );
}