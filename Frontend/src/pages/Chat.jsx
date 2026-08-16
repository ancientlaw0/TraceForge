import { useState } from "react";
import { sendMessage } from "../api/chat";
import "../styles/chat.css";


function Chat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (event) => {

        event.preventDefault();

        const trimmedMessage =
            message.trim();


        if (!trimmedMessage) {

            setError(
                "Please enter a message."
            );

            return;
        }


        if (loading) {
            return;
        }


        setError("");


        // Immediately show user's message
        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: trimmedMessage,
            },
        ]);


        setMessage("");
        setLoading(true);


        try {

            const data =
                await sendMessage(
                    trimmedMessage
                );


            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        data.response,
                },
            ]);

        } catch (error) {

            if (error.response) {

                const status =
                    error.response.status;


                if (status === 401) {

                    setError(
                        "Your session has expired. Please log in again."
                    );

                } else if (status === 403) {

                    setError(
                        "You are not authorized to use the chatbot."
                    );

                } else if (status === 422) {

                    setError(
                        "Please enter a valid message."
                    );

                } else if (status >= 500) {

                    setError(
                        "The chatbot is currently unavailable. Please try again later."
                    );

                } else {

                    setError(
                        error.response.data?.detail ||
                        "Unable to send your message."
                    );
                }

            } else if (error.request) {

                setError(
                    "Unable to connect to the server."
                );

            } else {

                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSubmit(event);
        }
    };


    return (
        <div className="chat-page">

            <div className="chat-container">

                {/* Header */}

                <header className="chat-header">

                    <div>

                        <h1>
                            TraceForge Assistant
                        </h1>

                        <p>
                            Ask questions about your
                            traces and analytics.
                        </p>

                    </div>

                </header>


                {/* Messages */}

                <div className="chat-messages">

                    {messages.length === 0 && (

                        <div className="chat-empty">

                            <h2>
                                How can I help?
                            </h2>

                            <p>
                                Ask the TraceForge
                                assistant something.
                            </p>

                        </div>
                    )}


                    {messages.map(
                        (item, index) => (

                            <div
                                key={index}
                                className={
                                    `chat-message ${item.role}`
                                }
                            >

                                <div
                                    className="chat-bubble"
                                >
                                    {item.content}
                                </div>

                            </div>
                        )
                    )}


                    {loading && (

                        <div className="chat-message assistant">

                            <div className="chat-bubble">

                                Thinking...

                            </div>

                        </div>
                    )}

                </div>


                {/* Error */}

                {error && (

                    <div className="chat-error">

                        {error}

                    </div>
                )}


                {/* Input */}

                <form
                    className="chat-input-area"
                    onSubmit={handleSubmit}
                >

                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder="Ask something..."
                        disabled={loading}
                        rows={2}
                    />


                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !message.trim()
                        }
                    >

                        {loading
                            ? "Sending..."
                            : "Send"}

                    </button>

                </form>


                <p className="chat-hint">
                    Press Enter to send · Shift + Enter
                    for a new line
                </p>

            </div>

        </div>
    );
}


export default Chat;