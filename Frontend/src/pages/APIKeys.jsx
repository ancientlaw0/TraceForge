import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getAPIKeys,
    createAPIKey,
    revokeAPIKey,
} from "../api/apiKeys";

import "../css/ApiKeys.css";


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}


function maskKey() {
    return "••••••••••••••••";
}


export default function APIKeys() {

    const [keys, setKeys] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showCreate, setShowCreate] =
        useState(false);

    const [name, setName] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [newKey, setNewKey] =
        useState(null);

    const [copied, setCopied] =
        useState(false);

    const [revoking, setRevoking] =
        useState(null);


    async function loadKeys() {

        setError("");

        try {

            const data =
                await getAPIKeys();

            setKeys(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            setError(
                error.message ||
                "Unable to load API keys."
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadKeys();

    }, []);


    async function handleCreate(event) {

        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        setCreating(true);
        setError("");

        try {

            const data =
                await createAPIKey(
                    name.trim()
                );

            /*
             * The plaintext key is returned
             * only during creation.
             *
             * Store it in state so the user
             * can copy it now.
             */

            setNewKey(
                data?.api_key || ""
            );

            setName("");
            setShowCreate(false);

            await loadKeys();

        } catch (error) {

            setError(
                error.message ||
                "Unable to create API key."
            );

        } finally {

            setCreating(false);

        }
    }


    async function handleRevoke(keyId) {

        const confirmed =
            window.confirm(
                "Revoke this API key? Applications using it will stop working."
            );

        if (!confirmed) {
            return;
        }

        setRevoking(keyId);
        setError("");

        try {

            await revokeAPIKey(keyId);

            setKeys((current) =>
                current.map((key) =>
                    key.id === keyId
                        ? {
                            ...key,
                            is_active: false,
                        }
                        : key
                )
            );

        } catch (error) {

            setError(
                error.message ||
                "Unable to revoke API key."
            );

        } finally {

            setRevoking(null);

        }
    }


    async function copyKey() {

        if (!newKey) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                newKey
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);

        } catch {

            setError(
                "Unable to copy the API key."
            );

        }
    }


    return (
        <div className="page api-keys-page">

            <main className="page-container">

                <div className="api-keys-header">

                    <div>

                        <p className="page-eyebrow">
                            Management
                        </p>

                        <h1 className="page-title">
                            API keys
                        </h1>

                        <p className="page-subtitle">
                            Manage the credentials your
                            applications use to send
                            traces to TraceForge.
                        </p>

                    </div>


                    <button
                        className="button button-primary"
                        onClick={() => {
                            setShowCreate(true);
                            setError("");
                        }}
                    >
                        + Create API key
                    </button>

                </div>


                {error && (
                    <div className="api-key-error">
                        {error}
                    </div>
                )}


                {newKey && (
                    <section className="new-key-banner">

                        <div className="new-key-heading">

                            <div>

                                <p className="new-key-eyebrow">
                                    API key created
                                </p>

                                <h2>
                                    Copy this key now
                                </h2>

                                <p>
                                    TraceForge does not store
                                    the plaintext key, so you
                                    won't be able to see it
                                    again.
                                </p>

                            </div>

                            <button
                                className="new-key-close"
                                onClick={() =>
                                    setNewKey(null)
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <div className="key-copy-row">

                            <code>
                                {newKey}
                            </code>

                            <button
                                className="button button-secondary"
                                onClick={copyKey}
                            >
                                {copied
                                    ? "Copied"
                                    : "Copy key"}
                            </button>

                        </div>

                    </section>
                )}


                {showCreate && (
                    <section className="create-key-card surface">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Create an API key
                                </h2>

                                <p>
                                    Give the key a name so
                                    you know where it is used.
                                </p>

                            </div>

                            <button
                                className="close-button"
                                onClick={() =>
                                    setShowCreate(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="create-key-form"
                            onSubmit={handleCreate}
                        >

                            <label className="field">

                                <span>
                                    Key name
                                </span>

                                <input
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Production"
                                    autoFocus
                                    required
                                />

                            </label>


                            <div className="create-key-actions">

                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={() =>
                                        setShowCreate(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={
                                        creating ||
                                        !name.trim()
                                    }
                                >
                                    {creating
                                        ? "Creating…"
                                        : "Create key"}
                                </button>

                            </div>

                        </form>

                    </section>
                )}


                <section className="keys-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Your API keys
                            </h2>

                            <p>
                                Credentials associated with
                                your account.
                            </p>

                        </div>

                        <span className="key-count">
                            {keys.length}{" "}
                            {keys.length === 1
                                ? "key"
                                : "keys"}
                        </span>

                    </div>


                    <div className="keys-list surface">

                        {loading ? (

                            <div className="keys-empty">
                                Loading API keys…
                            </div>

                        ) : keys.length === 0 ? (

                            <div className="keys-empty">

                                <div className="empty-icon">
                                    ◇
                                </div>

                                <h3>
                                    No API keys yet
                                </h3>

                                <p>
                                    Create your first key
                                    to start sending traces
                                    from an application.
                                </p>

                                <button
                                    className="button button-primary"
                                    onClick={() =>
                                        setShowCreate(true)
                                    }
                                >
                                    Create your first key
                                </button>

                            </div>

                        ) : (

                            <div className="key-table">

                               <div className="key-table-header">

    <span>Name</span>

    <span>Key</span>

    <span>Created</span>

    <span>Last used</span>

    <span>Status</span>

    <span></span>

</div>


                                {keys.map((key) => (

<div
    className="key-row"
    key={key.id}
>

    <div className="key-name">
        <strong>
            {key.name}
        </strong>
    </div>


    <code className="key-preview">
        {maskKey()}
    </code>


    <span className="key-date">
        {formatDate(key.created_at)}
    </span>


    <span className="key-date">
        {key.last_used_at
            ? formatDate(key.last_used_at)
            : "Never"}
    </span>


    <span
        className={
            key.is_active
                ? "status-pill status-active"
                : "status-pill status-revoked"
        }
    >
        {key.is_active
            ? "Active"
            : "Revoked"}
    </span>


    <div className="key-actions">

        {key.is_active && (
            <button
                className="revoke-button"
                disabled={revoking === key.id}
                onClick={() =>
                    handleRevoke(key.id)
                }
            >
                {revoking === key.id
                    ? "Revoking…"
                    : "Revoke"}
            </button>
        )}

    </div>

</div>

                                ))}

                            </div>

                        )}

                    </div>

                </section>


                <div className="api-key-note">

                    <span>
                        ◌
                    </span>

                    <p>
                        API keys are shown in plaintext only
                        once, immediately after creation.
                        Keep them private and never commit them
                        to source control.
                    </p>

                </div>


                <Link
                    to="/dashboard"
                    className="back-dashboard"
                >
                    ← Back to dashboard
                </Link>

            </main>

        </div>
    );
}