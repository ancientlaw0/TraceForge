export default function FilterField({
    label,
    children,
}) {
    return (
        <div className="filter-field">
            <label>{label}</label>
            {children}
        </div>
    );
}