export default function RequestHealth({
    summary,
}) {
    return (
        <div className="dashboard-card surface">

            <div className="card-header">

                <div>

                    <h2>
                        Request health
                    </h2>

                    <p>
                        Distribution by request status.
                    </p>

                </div>

            </div>


            <div className="health-list">

                <div className="health-row">

                    <span>
                        Successful
                    </span>

                    <strong>
                        {Number(
                            summary.success_rate || 0
                        ).toFixed(2)}%
                    </strong>

                </div>


                <div className="health-bar">

                    <div
                        className="health-fill health-success"
                        style={{
                            width: `${
                                summary.success_rate || 0
                            }%`,
                        }}
                    />

                </div>


                <div className="health-row">

                    <span>
                        Errors
                    </span>

                    <strong>
                        {Number(
                            summary.error_rate || 0
                        ).toFixed(2)}%
                    </strong>

                </div>


                <div className="health-bar">

                    <div
                        className="health-fill health-error"
                        style={{
                            width: `${
                                summary.error_rate || 0
                            }%`,
                        }}
                    />

                </div>


                <div className="health-row">

                    <span>
                        Timeouts
                    </span>

                    <strong>
                        {Number(
                            summary.timeout_rate || 0
                        ).toFixed(2)}%
                    </strong>

                </div>


                <div className="health-bar">

                    <div
                        className="health-fill health-warning"
                        style={{
                            width: `${
                                summary.timeout_rate || 0
                            }%`,
                        }}
                    />

                </div>

            </div>

        </div>
    );
}