export function getErrorMessage(error) {
    if (!error) {
        return "Unknown error.";
    }

    if (error.response) {
        const status =
            error.response.status;

        if (status === 401) {
            return "Authentication expired.";
        }

        if (status === 403) {
            return "You are not allowed to view this analytics data.";
        }

        if (status === 422) {
            return "Invalid analytics filters.";
        }

        if (status >= 500) {
            return "Server error. Please try again later.";
        }

        return (
            error.response.data?.detail ||
            "Unable to load this section."
        );
    }

    if (error.request) {
        return "Unable to connect to the server.";
    }

    return "Something went wrong.";
}