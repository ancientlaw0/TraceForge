import { useEffect, useState } from "react";

import {
    getApiKeys,
    createApiKey,
    revokeApiKey,
} from "../api/apiKeys";


function APIKeys() {
    const [apiKeys, setApiKeys] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);

    const [keyName, setKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState("");

    const [selectedKey, setSelectedKey] = useState(null);

    const [creating, setCreating] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const [copied, setCopied] = useState(false);


    // --------------------------------------------------
    // LOAD API KEYS
    // --------------------------------------------------

    const loadApiKeys = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getApiKeys();

            setApiKeys(Array.isArray(data) ? data : []);

        } catch (error) {

            // 401 is handled globally by Axios.
            if (error.response?.status === 401) {
                return;
            }

            if (error.response?.status >= 500) {
                setError(
                    "The server is currently unavailable. Please try again later."
                );
            }
            else if (error.request) {
                setError(
                    "Unable to connect to TraceForge."
                );
            }
            else {
                setError(
                    "Unable to load API keys."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadApiKeys();
    }, []);


    // --------------------------------------------------
    // CREATE
    // --------------------------------------------------

    const handleCreate = async (event) => {
        event.preventDefault();

        const trimmedName = keyName.trim();

        if (!trimmedName) {
            setError("API key name cannot be empty.");
            return;
        }

        if (trimmedName.length > 100) {
            setError(
                "API key name must be 100 characters or less."
            );
            return;
        }

        setCreating(true);
        setError("");

        try {
            const data = await createApiKey(trimmedName);

            if (!data?.api_key) {
                setError(
                    "The server created the key but did not return the secret."
                );
                return;
            }

            // IMPORTANT:
            // This is only kept in React state temporarily.
            // We don't put the API secret into localStorage.
            setCreatedKey(data.api_key);

            setKeyName("");

            setShowCreateModal(false);
            setShowSecretModal(true);

            await loadApiKeys();

        } catch (error) {

            if (error.response?.status === 401) {
                return;
            }

            if (error.response?.status === 422) {
                setError(
                    "Invalid API key name."
                );
            }
            else if (error.response?.status === 409) {
                setError(
                    "An API key with this name already exists."
                );
            }
            else if (error.response?.status >= 500) {
                setError(
                    "Server error. Please try again later."
                );
            }
            else if (error.request) {
                setError(
                    "Unable to connect to TraceForge."
                );
            }
            else {
                setError(
                    "Unable to create API key."
                );
            }

        } finally {
            setCreating(false);
        }
    };


    // --------------------------------------------------
    // REVOKE
    // --------------------------------------------------

    const handleRevoke = async () => {
        if (!selectedKey) {
            return;
        }

        if (!selectedKey.is_active) {
            setShowRevokeModal(false);
            setSelectedKey(null);
            return;
        }

        setRevoking(true);
        setError("");

        try {
            await revokeApiKey(selectedKey.id);

            setShowRevokeModal(false);
            setSelectedKey(null);

            await loadApiKeys();

        } catch (error) {

            if (error.response?.status === 401) {
                return;
            }

            if (error.response?.status === 404) {
                setError(
                    "This API key no longer exists."
                );
            }
            else if (error.response?.status >= 500) {
                setError(
                    "Server error. Please try again later."
                );
            }
            else if (error.request) {
                setError(
                    "Unable to connect to TraceForge."
                );
            }
            else {
                setError(
                    "Unable to disable API key."
                );
            }

        } finally {
            setRevoking(false);
        }
    };


    // --------------------------------------------------
    // COPY SECRET
    // --------------------------------------------------

    const handleCopy = async () => {
        if (!createdKey) {
            return;
        }

        try {
            await navigator.clipboard.writeText(createdKey);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch {
            setError(
                "Unable to copy the API key. Please copy it manually."
            );
        }
    };


    // --------------------------------------------------
    // CLOSE SECRET
    // --------------------------------------------------

    const closeSecretModal = () => {
        setShowSecretModal(false);

        // Destroy plaintext secret from React state.
        setCreatedKey("");

        setCopied(false);
    };


    // --------------------------------------------------
    // OPEN DETAILS
    // --------------------------------------------------

    const openDetails = (apiKey) => {
        setSelectedKey(apiKey);
        setShowDetailsModal(true);
    };


    // --------------------------------------------------
    // OPEN REVOKE
    // --------------------------------------------------

    const openRevoke = (apiKey) => {
        if (!apiKey.is_active) {
            return;
        }

        setSelectedKey(apiKey);
        setShowRevokeModal(true);
    };


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div>

            <header>
                <h1>API Keys</h1>

                <button
                    type="button"
                    onClick={() => {
                        setError("");
                        setKeyName("");
                        setShowCreateModal(true);
                    }}
                >
                    + Create API Key
                </button>
            </header>


            {/* GLOBAL PAGE ERROR */}

            {error && (
                <div role="alert">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        Dismiss
                    </button>
                </div>
            )}


            {/* LOADING */}

            {loading && (
                <div>
                    <p>Loading API keys...</p>
                </div>
            )}


            {/* EMPTY */}

            {!loading && apiKeys.length === 0 && (
                <div>

                    <h2>No API keys yet</h2>

                    <p>
                        Create an API key to connect your
                        application to TraceForge.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowCreateModal(true);
                        }}
                    >
                        Create API Key
                    </button>

                </div>
            )}


            {/* KEY LIST */}

            {!loading && apiKeys.length > 0 && (
                <div>

                    {apiKeys.map((apiKey) => (

                        <div key={apiKey.id}>

                            <div>

                                <h2>
                                    {apiKey.name}
                                </h2>

                                <p>
                                    Key ID: {apiKey.id}
                                </p>

                                <p>
                                    Created:{" "}
                                    {apiKey.created_at
                                        ? new Date(
                                              apiKey.created_at
                                          ).toLocaleString()
                                        : "Unknown"}
                                </p>

                                <p>
                                    Last used:{" "}
                                    {apiKey.last_used_at
                                        ? new Date(
                                              apiKey.last_used_at
                                          ).toLocaleString()
                                        : "Never"}
                                </p>

                            </div>


                            <div>

                                <span>
                                    {apiKey.is_active
                                        ? "Active"
                                        : "Disabled"}
                                </span>


                                <button
                                    type="button"
                                    onClick={() =>
                                        openDetails(apiKey)
                                    }
                                >
                                    View
                                </button>


                                {apiKey.is_active && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openRevoke(apiKey)
                                        }
                                    >
                                        Disable
                                    </button>
                                )}

                            </div>

                        </div>

                    ))}

                </div>
            )}


            {/* ==========================================
                CREATE MODAL
            ========================================== */}

            {showCreateModal && (

                <div role="dialog">

                    <div>

                        <h2>
                            Create API Key
                        </h2>

                        <form
                            onSubmit={handleCreate}
                        >

                            <label>
                                Key name
                            </label>

                            <input
                                type="text"
                                value={keyName}
                                onChange={(event) =>
                                    setKeyName(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Production"
                                maxLength={100}
                                disabled={creating}
                                autoFocus
                            />


                            <p>
                                Give this key a name so you
                                know where it is being used.
                            </p>


                            <div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(false)
                                    }
                                    disabled={creating}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        creating ||
                                        !keyName.trim()
                                    }
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create API Key"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==========================================
                SECRET MODAL
            ========================================== */}

            {showSecretModal && (

                <div role="dialog">

                    <div>

                        <h2>
                            API Key Created
                        </h2>

                        <p>
                            Copy this key now.
                        </p>

                        <p>
                            <strong>
                                You will not be able to
                                view the secret again.
                            </strong>
                        </p>


                        <div>

                            <code>
                                {createdKey}
                            </code>

                            <button
                                type="button"
                                onClick={handleCopy}
                            >
                                {copied
                                    ? "Copied!"
                                    : "Copy"}
                            </button>

                        </div>


                        <button
                            type="button"
                            onClick={closeSecretModal}
                        >
                            Done
                        </button>

                    </div>

                </div>

            )}


            {/* ==========================================
                DETAILS MODAL
            ========================================== */}

            {showDetailsModal &&
                selectedKey && (

                    <div role="dialog">

                        <div>

                            <h2>
                                API Key Details
                            </h2>


                            <p>
                                <strong>
                                    Name:
                                </strong>{" "}
                                {selectedKey.name}
                            </p>


                            <p>
                                <strong>
                                    ID:
                                </strong>{" "}
                                {selectedKey.id}
                            </p>


                            <p>
                                <strong>
                                    Status:
                                </strong>{" "}
                                {selectedKey.is_active
                                    ? "Active"
                                    : "Disabled"}
                            </p>


                            <p>
                                <strong>
                                    Created:
                                </strong>{" "}
                                {selectedKey.created_at
                                    ? new Date(
                                          selectedKey.created_at
                                      ).toLocaleString()
                                    : "Unknown"}
                            </p>


                            <p>
                                <strong>
                                    Last used:
                                </strong>{" "}
                                {selectedKey.last_used_at
                                    ? new Date(
                                          selectedKey.last_used_at
                                      ).toLocaleString()
                                    : "Never"}
                            </p>


                            <p>
                                <strong>
                                    Secret:
                                </strong>{" "}
                                Hidden
                            </p>


                            <button
                                type="button"
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedKey(null);
                                }}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                )}


            {/* ==========================================
                REVOKE MODAL
            ========================================== */}

            {showRevokeModal &&
                selectedKey && (

                    <div role="dialog">

                        <div>

                            <h2>
                                Disable API Key?
                            </h2>


                            <p>
                                Are you sure you want to
                                disable{" "}
                                <strong>
                                    {selectedKey.name}
                                </strong>
                                ?
                            </p>


                            <p>
                                Applications using this key
                                will no longer be able to
                                authenticate with TraceForge.
                            </p>


                            <button
                                type="button"
                                onClick={() => {
                                    setShowRevokeModal(false);
                                    setSelectedKey(null);
                                }}
                                disabled={revoking}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleRevoke}
                                disabled={revoking}
                            >
                                {revoking
                                    ? "Disabling..."
                                    : "Disable API Key"}
                            </button>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default APIKeys;