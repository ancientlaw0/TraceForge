import {
    formatNumber,
    formatCost,
    formatLatency,
    formatTraceTime,
} from "../../utils/formatters";

import TraceField from "./TraceField";

export default function TraceDetails({
    trace,
    onClose,
}) {
    return (
        <div className="trace-details">
            <div className="trace-details-header">
                <div>
                    <div className="analytics-eyebrow">
                        TRACE
                    </div>

                    <h3>
                        {trace.trace_id}
                    </h3>
                </div>

                <button
                    className="trace-close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="trace-details-grid">
                <TraceField
                    label="Provider"
                    value={trace.provider}
                />

                <TraceField
                    label="Model"
                    value={trace.model}
                />

                <TraceField
                    label="Status"
                    value={trace.status}
                />

                <TraceField
                    label="Latency"
                    value={formatLatency(
                        trace.latency_ms
                    )}
                />

                <TraceField
                    label="Input Tokens"
                    value={formatNumber(
                        trace.input_tokens
                    )}
                />

                <TraceField
                    label="Output Tokens"
                    value={formatNumber(
                        trace.output_tokens
                    )}
                />

                <TraceField
                    label="Cost"
                    value={formatCost(
                        trace.cost
                    )}
                />

                <TraceField
                    label="Created"
                    value={formatTraceTime(
                        trace.created_at
                    )}
                />
            </div>

            <div className="trace-content-section">
                <h4>Prompt</h4>

                <pre>
                    {trace.prompt || "—"}
                </pre>
            </div>

            <div className="trace-content-section">
                <h4>Response</h4>

                <pre>
                    {trace.response || "—"}
                </pre>
            </div>

            {trace.error_message && (
                <div className="trace-content-section">
                    <h4>Error</h4>

                    <pre>
                        {trace.error_message}
                    </pre>
                </div>
            )}

            <div className="trace-content-section">
                <h4>Metadata</h4>

                <pre>
                    {JSON.stringify(
                        trace.metadata_trace,
                        null,
                        2
                    )}
                </pre>
            </div>
        </div>
    );
}