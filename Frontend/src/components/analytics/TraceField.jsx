export default function TraceField({
    label,
    value,
}) {
    return (
        <div className="trace-field">
            <span>{label}</span>

            <strong>{value}</strong>
        </div>
    );
}