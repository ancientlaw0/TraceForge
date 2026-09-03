import { useEffect, useState } from "react";

import {
    getAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
} from "../api/alerts";

import "../css/alerts.css";
import { getErrorMessage } from "../utils/errors";

const METRICS = [
    {
        value: "latency_avg",
        label: "Average Latency",
        unit: "ms",
    },
    {
        value: "latency_max",
        label: "Maximum Latency",
        unit: "ms",
    },
    {
        value: "error_rate",
        label: "Error Rate",
        unit: "%",
    },
    {
        value: "timeout_rate",
        label: "Timeout Rate",
        unit: "%",
    },
    {
        value: "cost",
        label: "Cost",
        unit: "$",
    },
    {
        value: "total_tokens",
        label: "Total Tokens",
        unit: "tokens",
    },
];


const OPERATORS = [
    {
        value: ">",
        label: "Greater than",
    },
    {
        value: ">=",
        label: "Greater than or equal",
    },
    {
        value: "<",
        label: "Less than",
    },
    {
        value: "<=",
        label: "Less than or equal",
    },
];


const WINDOWS = [
    {
        value: 5,
        label: "5 minutes",
    },
    {
        value: 15,
        label: "15 minutes",
    },
    {
        value: 30,
        label: "30 minutes",
    },
    {
        value: 60,
        label: "1 hour",
    },
    {
        value: 120,
        label: "2 hours",
    },
];


const DEFAULT_FORM = {
    metric: "error_rate",
    operator: ">",
    threshold_value: "",
    window_minutes: 5,
    enabled: true,
    cooldown_minutes: 30,
};


function Alerts() {

    const [alerts, setAlerts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [pageError, setPageError] =
        useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingAlert, setEditingAlert] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [form, setForm] =
        useState(DEFAULT_FORM);

    const [formError, setFormError] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [togglingId, setTogglingId] =
        useState(null);


    /*
     * ================================
     * LOAD ALERTS
     * ================================
     */

    useEffect(() => {

        loadAlerts();

    }, []);


    async function loadAlerts() {

        setLoading(true);
        setPageError("");

        try {

            const data =
                await getAlerts();

            setAlerts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            setPageError(
                getErrorMessage(error)
            );

        } finally {

            setLoading(false);
        }
    }


    /*
     * ================================
     * OPEN CREATE MODAL
     * ================================
     */

    function openCreateModal() {

        setEditingAlert(null);

        setForm({
            ...DEFAULT_FORM,
        });

        setFormError("");

        setModalOpen(true);
    }


    /*
     * ================================
     * OPEN EDIT MODAL
     * ================================
     */

    function openEditModal(alert) {

        setEditingAlert(alert);

        setForm({
            metric: alert.metric,
            operator: alert.operator,
            threshold_value:
                String(
                    alert.threshold_value
                ),
            window_minutes:
                Number(
                    alert.window_minutes
                ),
            enabled:
                Boolean(
                    alert.enabled
                ),
            cooldown_minutes:
                Number(
                    alert.cooldown_minutes
                ),
        });

        setFormError("");

        setModalOpen(true);
    }


    /*
     * ================================
     * CLOSE MODAL
     * ================================
     */

    function closeModal() {

        if (saving) {
            return;
        }

        setModalOpen(false);

        setEditingAlert(null);

        setFormError("");
    }


    /*
     * ================================
     * FORM CHANGE
     * ================================
     */

    function updateForm(field, value) {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }


    /*
     * ================================
     * VALIDATION
     * ================================
     */

    function validateForm() {

        const threshold =
            Number(
                form.threshold_value
            );

        const cooldown =
            Number(
                form.cooldown_minutes
            );


        if (!form.metric) {

            return "Please select a metric.";
        }


        if (!form.operator) {

            return "Please select an operator.";
        }


        if (
            form.threshold_value === "" ||
            !Number.isFinite(threshold)
        ) {

            return (
                "Please enter a valid threshold."
            );
        }


        if (threshold < 0) {

            return (
                "Threshold cannot be negative."
            );
        }


        /*
         * Rates logically cannot exceed 100%.
         */

        if (
            (
                form.metric ===
                    "error_rate" ||
                form.metric ===
                    "timeout_rate"
            ) &&
            threshold > 100
        ) {

            return (
                "Rate threshold cannot exceed 100%."
            );
        }


        if (
            !WINDOWS.some(
                (window) =>
                    Number(
                        window.value
                    ) ===
                    Number(
                        form.window_minutes
                    )
            )
        ) {

            return (
                "Please select a valid time window."
            );
        }


        if (
            !Number.isInteger(
                cooldown
            ) ||
            cooldown < 0
        ) {

            return (
                "Cooldown must be a non-negative whole number."
            );
        }


        return "";
    }


    /*
     * ================================
     * CREATE / UPDATE
     * ================================
     */

    async function handleSubmit(event) {

        event.preventDefault();

        if (saving) {
            return;
        }


        const validationError =
            validateForm();


        if (validationError) {

            setFormError(
                validationError
            );

            return;
        }


        setSaving(true);
        setFormError("");


        const payload = {
            metric: form.metric,
            operator: form.operator,
            threshold_value:
                form.threshold_value,
            window_minutes:
                Number(
                    form.window_minutes
                ),
            enabled:
                Boolean(
                    form.enabled
                ),
            cooldown_minutes:
                Number(
                    form.cooldown_minutes
                ),
        };


        try {

            if (editingAlert) {

                const updated =
                    await updateAlert(
                        editingAlert.id,
                        payload
                    );


                setAlerts(
                    (previous) =>
                        previous.map(
                            (alert) =>
                                alert.id ===
                                editingAlert.id
                                    ? updated
                                    : alert
                        )
                );

            } else {

                const created =
                    await createAlert(
                        payload
                    );


                setAlerts(
                    (previous) => [
                        created,
                        ...previous,
                    ]
                );
            }


            closeModal();

        } catch (error) {

            setFormError(
                getErrorMessage(error)
            );

        } finally {

            setSaving(false);
        }
    }


    /*
     * ================================
     * TOGGLE ENABLED
     * ================================
     */

    async function handleToggle(alert) {

        if (
            togglingId !== null
        ) {
            return;
        }


        setTogglingId(alert.id);


        try {

            const updated =
                await updateAlert(
                    alert.id,
                    {
                        enabled:
                            !alert.enabled,
                    }
                );


            setAlerts(
                (previous) =>
                    previous.map(
                        (item) =>
                            item.id ===
                            alert.id
                                ? updated
                                : item
                    )
            );

        } catch (error) {

            setPageError(
                getErrorMessage(error)
            );

        } finally {

            setTogglingId(null);
        }
    }


    /*
     * ================================
     * DELETE
     * ================================
     */

    async function handleDelete() {

        if (
            !deleteTarget ||
            deleting
        ) {
            return;
        }


        setDeleting(true);
        setPageError("");


        try {

            await deleteAlert(
                deleteTarget.id
            );


            setAlerts(
                (previous) =>
                    previous.filter(
                        (alert) =>
                            alert.id !==
                            deleteTarget.id
                    )
            );


            setDeleteTarget(null);

        } catch (error) {

            /*
             * If another tab/user already
             * deleted it, remove it locally
             * instead of leaving a ghost card.
             */

            if (
                error.response?.status ===
                404
            ) {

                setAlerts(
                    (previous) =>
                        previous.filter(
                            (alert) =>
                                alert.id !==
                                deleteTarget.id
                        )
                );

                setDeleteTarget(null);

            } else {

                setPageError(
                    getErrorMessage(error)
                );
            }

        } finally {

            setDeleting(false);
        }
    }


    /*
     * ================================
     * LOADING
     * ================================
     */

    if (loading) {

        return (
            <div className="alerts-page">

                <div className="alerts-loading">

                    <h1>
                        Alerts
                    </h1>

                    <p>
                        Loading your alerts...
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="alerts-page">

            {/* HEADER */}

            <header className="alerts-header">

                <div>

                    <h1>
                        Alerts
                    </h1>

                    <p>
                        Monitor your TraceForge
                        metrics and get notified
                        when thresholds are exceeded.
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={
                        openCreateModal
                    }
                >
                    Create Alert
                </button>

            </header>


            {/* ERROR */}

            {pageError && (

                <div className="alerts-error">

                    <strong>
                        Something went wrong
                    </strong>

                    <p>
                        {pageError}
                    </p>

                    <button
                        onClick={
                            loadAlerts
                        }
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* EMPTY STATE */}

            {!pageError &&
                alerts.length === 0 && (

                    <div className="alerts-empty">

                        <h2>
                            No alerts yet
                        </h2>

                        <p>
                            Create an alert to
                            start monitoring your
                            application.
                        </p>

                        <button
                            className="primary-button"
                            onClick={
                                openCreateModal
                            }
                        >
                            Create your first alert
                        </button>

                    </div>
                )}


            {/* ALERT LIST */}

            {alerts.length > 0 && (

                <div className="alerts-grid">

                    {alerts.map(
                        (alert) => (

                            <AlertCard
                                key={
                                    alert.id
                                }
                                alert={
                                    alert
                                }
                                onEdit={
                                    openEditModal
                                }
                                onDelete={
                                    setDeleteTarget
                                }
                                onToggle={
                                    handleToggle
                                }
                                toggling={
                                    togglingId ===
                                    alert.id
                                }
                            />

                        )
                    )}

                </div>
            )}


            {/* CREATE / EDIT MODAL */}

            {modalOpen && (

                <AlertModal
                    editingAlert={
                        editingAlert
                    }
                    form={
                        form
                    }
                    formError={
                        formError
                    }
                    saving={
                        saving
                    }
                    onChange={
                        updateForm
                    }
                    onSubmit={
                        handleSubmit
                    }
                    onClose={
                        closeModal
                    }
                />
            )}


            {/* DELETE CONFIRMATION */}

            {deleteTarget && (

                <DeleteModal
                    alert={
                        deleteTarget
                    }
                    deleting={
                        deleting
                    }
                    onCancel={
                        () =>
                            !deleting &&
                            setDeleteTarget(
                                null
                            )
                    }
                    onConfirm={
                        handleDelete
                    }
                />
            )}

        </div>
    );
}


/*
 * =====================================
 * ALERT CARD
 * =====================================
 */

function AlertCard({
    alert,
    onEdit,
    onDelete,
    onToggle,
    toggling,
}) {

    const metric =
        getMetric(
            alert.metric
        );


    const operator =
        getOperator(
            alert.operator
        );


    const windowLabel =
        getWindowLabel(
            alert.window_minutes
        );


    return (
        <article
            className={
                `alert-card ${
                    alert.enabled
                        ? ""
                        : "disabled"
                }`
            }
        >

            <div className="alert-card-top">

                <div>

                    <span
                        className={
                            `alert-status ${
                                alert.enabled
                                    ? "enabled"
                                    : "disabled"
                            }`
                        }
                    >
                        {alert.enabled
                            ? "Active"
                            : "Disabled"}
                    </span>

                    <h2>
                        {metric.label}
                    </h2>

                </div>


                <button
                    className="icon-button"
                    onClick={() =>
                        onDelete(alert)
                    }
                    title="Delete alert"
                >
                    Delete
                </button>

            </div>


            <div className="alert-condition">

                <span>
                    {metric.label}
                </span>

                <strong>
                    {operator}
                </strong>

                <strong>
                    {formatThreshold(
                        alert.threshold_value,
                        alert.metric
                    )}
                </strong>

            </div>


            <div className="alert-details">

                <div>

                    <span>
                        Window
                    </span>

                    <strong>
                        {windowLabel}
                    </strong>

                </div>


                <div>

                    <span>
                        Cooldown
                    </span>

                    <strong>
                        {alert.cooldown_minutes} min
                    </strong>

                </div>

            </div>


            <div className="alert-card-actions">

                <button
                    onClick={() =>
                        onToggle(alert)
                    }
                    disabled={toggling}
                >

                    {toggling
                        ? "Updating..."
                        : alert.enabled
                            ? "Disable"
                            : "Enable"}

                </button>


                <button
                    onClick={() =>
                        onEdit(alert)
                    }
                >
                    Edit
                </button>

            </div>

        </article>
    );
}


/*
 * =====================================
 * CREATE / EDIT MODAL
 * =====================================
 */

function AlertModal({
    editingAlert,
    form,
    formError,
    saving,
    onChange,
    onSubmit,
    onClose,
}) {

    const metric =
        getMetric(
            form.metric
        );


    return (
        <div
            className="modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget &&
                    !saving
                ) {

                    onClose();
                }
            }}
        >

            <div className="modal">

                <div className="modal-header">

                    <div>

                        <h2>
                            {editingAlert
                                ? "Edit Alert"
                                : "Create Alert"}
                        </h2>

                        <p>
                            Configure the condition
                            you want TraceForge to
                            monitor.
                        </p>

                    </div>


                    <button
                        className="modal-close"
                        onClick={
                            onClose
                        }
                        disabled={saving}
                    >
                        ×
                    </button>

                </div>


                {formError && (

                    <div className="form-error">

                        {formError}

                    </div>
                )}


                <form
                    onSubmit={
                        onSubmit
                    }
                >

                    {/* METRIC */}

                    <label>

                        Metric

                        <select
                            value={
                                form.metric
                            }
                            onChange={(event) =>
                                onChange(
                                    "metric",
                                    event.target.value
                                )
                            }
                            disabled={saving}
                        >

                            {METRICS.map(
                                (item) => (

                                    <option
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {
                                            item.label
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </label>


                    {/* OPERATOR */}

                    <label>

                        Operator

                        <select
                            value={
                                form.operator
                            }
                            onChange={(event) =>
                                onChange(
                                    "operator",
                                    event.target.value
                                )
                            }
                            disabled={saving}
                        >

                            {OPERATORS.map(
                                (item) => (

                                    <option
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {
                                            item.value
                                        }{" "}
                                        —{" "}
                                        {
                                            item.label
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </label>


                    {/* THRESHOLD */}

                    <label>

                        Threshold

                        <div className="threshold-input">

                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={
                                    form.threshold_value
                                }
                                onChange={(event) =>
                                    onChange(
                                        "threshold_value",
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    "Enter threshold"
                                }
                                disabled={saving}
                            />

                            <span>
                                {metric.unit}
                            </span>

                        </div>

                    </label>


                    {/* WINDOW */}

                    <label>

                        Evaluation window

                        <select
                            value={
                                form.window_minutes
                            }
                            onChange={(event) =>
                                onChange(
                                    "window_minutes",
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                            disabled={saving}
                        >

                            {WINDOWS.map(
                                (item) => (

                                    <option
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {
                                            item.label
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </label>


                    {/* COOLDOWN */}

                    <label>

                        Cooldown

                        <div className="threshold-input">

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    form.cooldown_minutes
                                }
                                onChange={(event) =>
                                    onChange(
                                        "cooldown_minutes",
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                            />

                            <span>
                                minutes
                            </span>

                        </div>

                    </label>


                    {/* ENABLED */}

                    <label className="checkbox-row">

                        <input
                            type="checkbox"
                            checked={
                                form.enabled
                            }
                            onChange={(event) =>
                                onChange(
                                    "enabled",
                                    event.target.checked
                                )
                            }
                            disabled={saving}
                        />

                        <span>
                            Enable this alert
                        </span>

                    </label>


                    <div className="modal-actions">

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingAlert
                                    ? "Save Changes"
                                    : "Create Alert"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


/*
 * =====================================
 * DELETE MODAL
 * =====================================
 */

function DeleteModal({
    alert,
    deleting,
    onCancel,
    onConfirm,
}) {

    return (
        <div
            className="modal-overlay"
        >

            <div className="modal small-modal">

                <h2>
                    Delete alert?
                </h2>

                <p>
                    This will permanently delete
                    the{" "}
                    <strong>
                        {
                            getMetric(
                                alert.metric
                            ).label
                        }
                    </strong>{" "}
                    alert.
                </p>

                <div className="modal-actions">

                    <button
                        onClick={
                            onCancel
                        }
                        disabled={
                            deleting
                        }
                    >
                        Cancel
                    </button>


                    <button
                        className="danger-button"
                        onClick={
                            onConfirm
                        }
                        disabled={
                            deleting
                        }
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                </div>

            </div>

        </div>
    );
}


/*
 * =====================================
 * HELPERS
 * =====================================
 */

function getMetric(metric) {

    return (
        METRICS.find(
            (item) =>
                item.value === metric
        ) || {
            label: "Unknown metric",
            unit: "",
        }
    );
}


function getOperator(operator) {

    return (
        OPERATORS.find(
            (item) =>
                item.value === operator
        )?.value ||
        operator ||
        "?"
    );
}


function getWindowLabel(value) {

    return (
        WINDOWS.find(
            (item) =>
                Number(item.value) ===
                Number(value)
        )?.label ||
        `${value} minutes`
    );
}


function formatThreshold(
    value,
    metric
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";
    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "—";
    }


    if (
        metric === "error_rate" ||
        metric === "timeout_rate"
    ) {

        return `${number}%`;
    }


    if (
        metric === "cost"
    ) {

        return `$${number.toFixed(2)}`;
    }


    return number.toLocaleString();
}





export default Alerts;