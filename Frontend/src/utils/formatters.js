export function formatNumber(value) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString(
        undefined,
        {
            maximumFractionDigits: 2,
        }
    );
}


export function formatCost(value) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return `$${Number(value).toFixed(4)}`;
}


export function formatLatency(value) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    const latency = Number(value);

    if (latency >= 1000) {
        return `${(
            latency / 1000
        ).toFixed(2)} s`;
    }

    return `${latency.toFixed(0)} ms`;
}


export function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
        }
    );
}


export function formatTraceTime(timestamp) {
    if (!timestamp) {
        return "—";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        undefined,
        {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }
    );
}