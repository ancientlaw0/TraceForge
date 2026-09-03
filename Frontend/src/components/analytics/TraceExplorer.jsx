import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import ChartCard from "./ChartCard";
import TraceDetails from "./TraceDetails";

import {
    formatNumber,
    formatLatency,
    formatCost,
    formatTraceTime,
} from "../../utils/formatters";

export default function TraceExplorer({
    traces,
    error,
}) {
    const [selectedTrace, setSelectedTrace] =
        useState(null);

    useEffect(() => {
        if (selectedTrace) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedTrace]);

    return (
        <ChartCard
            title="Trace Explorer"
            subtitle="Inspect individual requests and their complete telemetry"
            error={error}
            empty={!traces.length}
        >
            <div className="table-wrapper trace-table-wrapper">
                <table className="analytics-table trace-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Provider</th>
                            <th>Model</th>
                            <th>Status</th>
                            <th>Latency</th>
                            <th>Input</th>
                            <th>Output</th>
                            <th>Cost</th>
                            <th>Trace ID</th>
                        </tr>
                    </thead>

                    <tbody>
                        {traces.map((trace) => (
                            <tr
                                key={trace.trace_id}
                                className={
                                    `trace-row ${
                                        selectedTrace?.trace_id ===
                                        trace.trace_id
                                            ? "trace-row-selected"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setSelectedTrace(
                                        trace
                                    )
                                }
                            >
                                <td>
                                    {formatTraceTime(
                                        trace.created_at
                                    )}
                                </td>

                                <td>
                                    <span className="provider-badge">
                                        {trace.provider}
                                    </span>
                                </td>

                                <td>
                                    <span className="model-name">
                                        {trace.model}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={
                                            `trace-status ` +
                                            `trace-status-${trace.status}`
                                        }
                                    >
                                        {trace.status}
                                    </span>
                                </td>

                                <td>
                                    {formatLatency(
                                        trace.latency_ms
                                    )}
                                </td>

                                <td>
                                    {formatNumber(
                                        trace.input_tokens
                                    )}
                                </td>

                                <td>
                                    {formatNumber(
                                        trace.output_tokens
                                    )}
                                </td>

                                <td>
                                    {formatCost(
                                        trace.cost
                                    )}
                                </td>

                                <td>
                                    <span className="trace-id">
                                        {trace.trace_id.slice(
                                            0,
                                            8
                                        )}
                                        …
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTrace &&
                createPortal(
                    <div
                        className="trace-modal-backdrop"
                        onClick={() =>
                            setSelectedTrace(null)
                        }
                    >
                        <div
                            className="trace-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <TraceDetails
                                trace={selectedTrace}
                                onClose={() =>
                                    setSelectedTrace(
                                        null
                                    )
                                }
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </ChartCard>
    );
}