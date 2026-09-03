import { useEffect, useState } from "react";

import {
    getUsageLimits,
    updateUsageLimits,
    deleteUsageLimits,
} from "../api/usage";

import "../css/usage.css";

import { getErrorMessage } from "../utils/errors";


const DEFAULT_FORM = {
    enabled: true,

    max_requests_per_minute: "",
    max_requests_per_hour: "",
    max_requests_per_day: "",

    max_input_tokens_per_day: "",
    max_output_tokens_per_day: "",

    max_cost_per_day: "",

    block_on_limit: true,
};


function UsageLimits() {

    const [limits, setLimits] =
        useState(null);

    const [form, setForm] =
        useState(DEFAULT_FORM);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [editing, setEditing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const [deleteModal, setDeleteModal] =
        useState(false);


    /*
     * =================================
     * LOAD
     * =================================
     */

    useEffect(() => {

        loadLimits();

    }, []);


    async function loadLimits() {

        setLoading(true);
        setError("");

        try {

            const data =
                await getUsageLimits();

            setLimits(data);

            setForm(
                convertToForm(data)
            );

        } catch (error) {

            /*
             * If your backend uses 404 to mean
             * "user has no limits configured yet",
             * treat it as an empty state.
             */

            if (
                error?.response?.status ===
                404
            ) {

                setLimits(null);

                setForm({
                    ...DEFAULT_FORM,
                });

            } else {

                setError(
                    getErrorMessage(error)
                );
            }

        } finally {

            setLoading(false);
        }
    }


    /*
     * =================================
     * FORM
     * =================================
     */

    function handleChange(
        field,
        value
    ) {

        setForm(
            (previous) => ({
                ...previous,
                [field]: value,
            })
        );
    }


    /*
     * =================================
     * VALIDATION
     * =================================
     */

    function validateForm() {

        const integerFields = [
            "max_requests_per_minute",
            "max_requests_per_hour",
            "max_requests_per_day",
            "max_input_tokens_per_day",
            "max_output_tokens_per_day",
        ];


        for (
            const field of integerFields
        ) {

            const value =
                form[field];


            /*
             * Empty means unlimited.
             */

            if (
                value === "" ||
                value === null ||
                value === undefined
            ) {

                continue;
            }


            const number =
                Number(value);


            if (
                !Number.isInteger(number)
            ) {

                return (
                    `${getFieldLabel(field)} must be a whole number.`
                );
            }


            if (number < 0) {

                return (
                    `${getFieldLabel(field)} cannot be negative.`
                );
            }
        }


        /*
         * Cost
         */

        if (
            form.max_cost_per_day !== "" &&
            form.max_cost_per_day !== null &&
            form.max_cost_per_day !== undefined
        ) {

            const cost =
                Number(
                    form.max_cost_per_day
                );


            if (
                !Number.isFinite(cost)
            ) {

                return (
                    "Daily cost limit must be a valid number."
                );
            }


            if (cost < 0) {

                return (
                    "Daily cost limit cannot be negative."
                );
            }
        }


        /*
         * Logical request hierarchy.
         *
         * If all three are supplied:
         *
         * minute <= hour <= day
         *
         * This prevents an obviously broken
         * configuration.
         */

        const minute =
            toNumberOrNull(
                form.max_requests_per_minute
            );

        const hour =
            toNumberOrNull(
                form.max_requests_per_hour
            );

        const day =
            toNumberOrNull(
                form.max_requests_per_day
            );


        if (
            minute !== null &&
            hour !== null &&
            minute > hour
        ) {

            return (
                "Requests per minute cannot be greater than requests per hour."
            );
        }


        if (
            hour !== null &&
            day !== null &&
            hour > day
        ) {

            return (
                "Requests per hour cannot be greater than requests per day."
            );
        }


        return "";
    }


    /*
     * =================================
     * SAVE
     * =================================
     */

    async function handleSave(
        event
    ) {

        event.preventDefault();


        if (saving) {
            return;
        }


        setFormError("");


        const validationError =
            validateForm();


        if (validationError) {

            setFormError(
                validationError
            );

            return;
        }


        setSaving(true);


        const payload = {
            enabled:
                Boolean(
                    form.enabled
                ),

            max_requests_per_minute:
                nullableInteger(
                    form.max_requests_per_minute
                ),

            max_requests_per_hour:
                nullableInteger(
                    form.max_requests_per_hour
                ),

            max_requests_per_day:
                nullableInteger(
                    form.max_requests_per_day
                ),

            max_input_tokens_per_day:
                nullableInteger(
                    form.max_input_tokens_per_day
                ),

            max_output_tokens_per_day:
                nullableInteger(
                    form.max_output_tokens_per_day
                ),

            max_cost_per_day:
                nullableDecimal(
                    form.max_cost_per_day
                ),

            block_on_limit:
                Boolean(
                    form.block_on_limit
                ),
        };


        try {

            const updated =
                await updateUsageLimits(
                    payload
                );


            setLimits(updated);

            setForm(
                convertToForm(updated)
            );

            setEditing(false);
            setFormError("");

        } catch (error) {

            setFormError(
                getErrorMessage(error)
            );

        } finally {

            setSaving(false);
        }
    }


    /*
     * =================================
     * DELETE
     * =================================
     */

    async function handleDelete() {

        if (deleting) {
            return;
        }


        setDeleting(true);
        setError("");


        try {

            await deleteUsageLimits();

            setLimits(null);

            setForm({
                ...DEFAULT_FORM,
            });

            setEditing(false);
            setDeleteModal(false);

        } catch (error) {

            if (
                error?.response?.status ===
                404
            ) {

                /*
                 * Already deleted.
                 */

                setLimits(null);

                setDeleteModal(false);

            } else {

                setError(
                    getErrorMessage(error)
                );
            }

        } finally {

            setDeleting(false);
        }
    }


    /*
     * =================================
     * LOADING
     * =================================
     */

    if (loading) {

        return (
            <div className="usage-page">

                <div className="usage-loading">

                    <h1>
                        Usage Limits
                    </h1>

                    <p>
                        Loading usage limits...
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="usage-page">

            {/* HEADER */}

            <header className="usage-header">

                <div>

                    <h1>
                        Usage Limits
                    </h1>

                    <p>
                        Control how much your
                        application can consume
                        within defined limits.
                    </p>

                </div>


                {limits && !editing && (

                    <button
                        className="primary-button"
                        onClick={() =>
                            setEditing(true)
                        }
                    >
                        Edit Limits
                    </button>

                )}

            </header>


            {/* ERROR */}

            {error && (

                <div className="usage-error">

                    <strong>
                        Something went wrong
                    </strong>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={
                            loadLimits
                        }
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* NO CONFIGURATION */}

            {!limits && !error && (

                <div className="usage-empty">

                    <div>

                        <h2>
                            No usage limits configured
                        </h2>

                        <p>
                            Configure request,
                            token and cost limits
                            for your account.
                        </p>

                    </div>


                    <button
                        className="primary-button"
                        onClick={() => {

                            setForm({
                                ...DEFAULT_FORM,
                            });

                            setFormError("");

                            setEditing(true);
                        }}
                    >
                        Configure Limits
                    </button>

                </div>
            )}


            {/* EXISTING LIMITS */}

            {limits && !editing && (

                <UsageOverview
                    limits={limits}
                    onEdit={() =>
                        setEditing(true)
                    }
                    onDelete={() =>
                        setDeleteModal(true)
                    }
                />
            )}


            {/* EDIT FORM */}

            {editing && (

                <UsageForm
                    form={form}
                    saving={saving}
                    formError={formError}
                    onChange={
                        handleChange
                    }
                    onSubmit={
                        handleSave
                    }
                    onCancel={() => {

                        if (saving) {
                            return;
                        }

                        if (limits) {

                            setForm(
                                convertToForm(
                                    limits
                                )
                            );

                        } else {

                            setForm({
                                ...DEFAULT_FORM,
                            });
                        }

                        setFormError("");
                        setEditing(false);
                    }}
                />
            )}


            {/* DELETE MODAL */}

            {deleteModal && (

                <DeleteModal
                    deleting={deleting}
                    onCancel={() => {

                        if (!deleting) {

                            setDeleteModal(
                                false
                            );
                        }
                    }}
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
 * OVERVIEW
 * =====================================
 */

function UsageOverview({
    limits,
    onEdit,
    onDelete,
}) {

    return (
        <div>

            <div className="usage-status-card">

                <div>

                    <span>
                        Status
                    </span>

                    <strong
                        className={
                            limits.enabled
                                ? "status-enabled"
                                : "status-disabled"
                        }
                    >
                        {limits.enabled
                            ? "Enabled"
                            : "Disabled"}
                    </strong>

                </div>


                <div>

                    <span>
                        Enforcement
                    </span>

                    <strong>
                        {limits.block_on_limit
                            ? "Block on limit"
                            : "Allow on limit"}
                    </strong>

                </div>

            </div>


            <div className="limits-grid">

                <LimitCard
                    title="Request Limits"
                    items={[
                        [
                            "Per minute",
                            formatLimit(
                                limits.max_requests_per_minute
                            ),
                        ],
                        [
                            "Per hour",
                            formatLimit(
                                limits.max_requests_per_hour
                            ),
                        ],
                        [
                            "Per day",
                            formatLimit(
                                limits.max_requests_per_day
                            ),
                        ],
                    ]}
                />


                <LimitCard
                    title="Token Limits"
                    items={[
                        [
                            "Input tokens / day",
                            formatLimit(
                                limits.max_input_tokens_per_day
                            ),
                        ],
                        [
                            "Output tokens / day",
                            formatLimit(
                                limits.max_output_tokens_per_day
                            ),
                        ],
                    ]}
                />


                <LimitCard
                    title="Cost Limit"
                    items={[
                        [
                            "Cost / day",
                            formatCost(
                                limits.max_cost_per_day
                            ),
                        ],
                    ]}
                />

            </div>


            <div className="usage-meta">

                <span>
                    Created:{" "}
                    {formatDate(
                        limits.created_at
                    )}
                </span>

                <span>
                    Updated:{" "}
                    {formatDate(
                        limits.updated_at
                    )}
                </span>

            </div>


            <div className="usage-actions">

                <button
                    onClick={onEdit}
                >
                    Edit limits
                </button>

                <button
                    className="danger-button"
                    onClick={onDelete}
                >
                    Delete limits
                </button>

            </div>

        </div>
    );
}


/*
 * =====================================
 * LIMIT CARD
 * =====================================
 */

function LimitCard({
    title,
    items,
}) {

    return (
        <section className="limit-card">

            <h2>
                {title}
            </h2>

            <div className="limit-card-list">

                {items.map(
                    ([label, value]) => (

                        <div
                            key={label}
                            className="limit-row"
                        >

                            <span>
                                {label}
                            </span>

                            <strong>
                                {value}
                            </strong>

                        </div>
                    )
                )}

            </div>

        </section>
    );
}


/*
 * =====================================
 * FORM
 * =====================================
 */

function UsageForm({
    form,
    saving,
    formError,
    onChange,
    onSubmit,
    onCancel,
}) {

    return (
        <form
            className="usage-form"
            onSubmit={
                onSubmit
            }
        >

            {formError && (

                <div className="form-error">
                    {formError}
                </div>
            )}


            {/* GENERAL */}

            <section>

                <h2>
                    General
                </h2>


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
                        Enable usage limits
                    </span>

                </label>


                <label className="checkbox-row">

                    <input
                        type="checkbox"
                        checked={
                            form.block_on_limit
                        }
                        onChange={(event) =>
                            onChange(
                                "block_on_limit",
                                event.target.checked
                            )
                        }
                        disabled={saving}
                    />

                    <span>
                        Block requests when a
                        limit is reached
                    </span>

                </label>

            </section>


            {/* REQUESTS */}

            <section>

                <h2>
                    Request Limits
                </h2>

                <p className="section-description">
                    Leave a field empty for no
                    limit.
                </p>


                <NumberInput
                    label="Requests per minute"
                    value={
                        form.max_requests_per_minute
                    }
                    onChange={(value) =>
                        onChange(
                            "max_requests_per_minute",
                            value
                        )
                    }
                    disabled={saving}
                />


                <NumberInput
                    label="Requests per hour"
                    value={
                        form.max_requests_per_hour
                    }
                    onChange={(value) =>
                        onChange(
                            "max_requests_per_hour",
                            value
                        )
                    }
                    disabled={saving}
                />


                <NumberInput
                    label="Requests per day"
                    value={
                        form.max_requests_per_day
                    }
                    onChange={(value) =>
                        onChange(
                            "max_requests_per_day",
                            value
                        )
                    }
                    disabled={saving}
                />

            </section>


            {/* TOKENS */}

            <section>

                <h2>
                    Token Limits
                </h2>


                <NumberInput
                    label="Input tokens per day"
                    value={
                        form.max_input_tokens_per_day
                    }
                    onChange={(value) =>
                        onChange(
                            "max_input_tokens_per_day",
                            value
                        )
                    }
                    disabled={saving}
                />


                <NumberInput
                    label="Output tokens per day"
                    value={
                        form.max_output_tokens_per_day
                    }
                    onChange={(value) =>
                        onChange(
                            "max_output_tokens_per_day",
                            value
                        )
                    }
                    disabled={saving}
                />

            </section>


            {/* COST */}

            <section>

                <h2>
                    Cost Limit
                </h2>


                <NumberInput
                    label="Maximum cost per day"
                    value={
                        form.max_cost_per_day
                    }
                    onChange={(value) =>
                        onChange(
                            "max_cost_per_day",
                            value
                        )
                    }
                    step="any"
                    disabled={saving}
                />

            </section>


            {/* ACTIONS */}

            <div className="usage-form-actions">

                <button
                    type="button"
                    onClick={
                        onCancel
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
                        : "Save Limits"}
                </button>

            </div>

        </form>
    );
}


/*
 * =====================================
 * NUMBER INPUT
 * =====================================
 */

function NumberInput({
    label,
    value,
    onChange,
    step = "1",
    disabled,
}) {

    return (
        <label className="number-field">

            <span>
                {label}
            </span>

            <input
                type="number"
                min="0"
                step={step}
                value={value}
                placeholder="No limit"
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                disabled={disabled}
            />

        </label>
    );
}


/*
 * =====================================
 * DELETE MODAL
 * =====================================
 */

function DeleteModal({
    deleting,
    onCancel,
    onConfirm,
}) {

    return (
        <div className="modal-overlay">

            <div className="delete-modal">

                <h2>
                    Delete usage limits?
                </h2>

                <p>
                    This will remove all configured
                    request, token and cost limits.
                </p>

                <div className="modal-actions">

                    <button
                        onClick={
                            onCancel
                        }
                        disabled={deleting}
                    >
                        Cancel
                    </button>


                    <button
                        className="danger-button"
                        onClick={
                            onConfirm
                        }
                        disabled={deleting}
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete limits"}
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

function convertToForm(data) {

    return {
        enabled:
            Boolean(
                data?.enabled
            ),

        max_requests_per_minute:
            data?.max_requests_per_minute ??
            "",

        max_requests_per_hour:
            data?.max_requests_per_hour ??
            "",

        max_requests_per_day:
            data?.max_requests_per_day ??
            "",

        max_input_tokens_per_day:
            data?.max_input_tokens_per_day ??
            "",

        max_output_tokens_per_day:
            data?.max_output_tokens_per_day ??
            "",

        max_cost_per_day:
            data?.max_cost_per_day ??
            "",

        block_on_limit:
            data?.block_on_limit ??
            true,
    };
}


function nullableInteger(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {

        return null;
    }

    return Number(value);
}


function nullableDecimal(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {

        return null;
    }

    return value;
}


function toNumberOrNull(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {

        return null;
    }

    return Number(value);
}


function formatLimit(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "Unlimited";
    }

    return Number(value).toLocaleString();
}


function formatCost(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "Unlimited";
    }

    return `$${Number(value).toFixed(2)} / day`;
}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";
    }

    return date.toLocaleString();
}


function getFieldLabel(field) {

    const labels = {
        max_requests_per_minute:
            "Requests per minute",

        max_requests_per_hour:
            "Requests per hour",

        max_requests_per_day:
            "Requests per day",

        max_input_tokens_per_day:
            "Input tokens per day",

        max_output_tokens_per_day:
            "Output tokens per day",
    };

    return (
        labels[field] ||
        field
    );
}


export default UsageLimits;