import { Link } from "react-router-dom";
import "../css/NotFound.css";

function NotFound() {
    return (
        <div className="not-found-page">

            <div className="not-found-card">

                <div className="not-found-code">
                    404
                </div>

                <h1>
                    Signal not found
                </h1>

                <p>
                    The page you're looking for doesn't exist.
                    if under doubt, check the URL or return to the dashboard.
                </p>

                <Link
                    to="/dashboard"
                    className="not-found-link"
                >
                    ← Back to dashboard
                </Link>

            </div>

        </div>
    );
}

export default NotFound;