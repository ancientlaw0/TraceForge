import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { logout } from "../api/auth"
import "../css/ProtectedLayout.css";

function ProtectedLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path;

    return (
        <div
            className={`protected-layout ${
                collapsed ? "sidebar-collapsed" : ""
            }`}
        >

            {/* SIDEBAR */}

            <aside className="dashboard-sidebar">

                <div className="sidebar-brand">
                    TraceForge
                </div>

                <button
                    className="sidebar-toggle"
                    onClick={() =>
                        setCollapsed((value) => !value)
                    }
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? "›" : "‹"}
                </button>


                <nav className="sidebar-nav">

                    <div className="nav-section">

                        <Link
                            to="/dashboard"
                            className={`nav-item ${
                                isActive("/dashboard")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon">
                                ⌂
                            </span>

                            <span className="nav-label">
                                Overview
                            </span>
                        </Link>

                    </div>


                    <div className="nav-section">

                        <p className="nav-section-label">
                            Observability
                        </p>

                        <Link
                            to="/analytics"
                            className={`nav-item ${
                                isActive("/analytics")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon">
                                ◫
                            </span>

                            <span className="nav-label">
                                Analytics
                            </span>
                        </Link>


                        <Link
                            to="/live"
                            className={`nav-item ${
                                isActive("/live")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon live-icon">
                                ●
                            </span>

                            <span className="nav-label">
                                Live
                            </span>
                        </Link>

                    </div>


                    <div className="nav-section">

                        <p className="nav-section-label">
                            Management
                        </p>

                        <Link
                            to="/alerts"
                            className={`nav-item ${
                                isActive("/alerts")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon">
                                ◇
                            </span>

                            <span className="nav-label">
                                Alerts
                            </span>
                        </Link>


                        <Link
                            to="/api-keys"
                            className={`nav-item ${
                                isActive("/api-keys")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon">
                                ⌘
                            </span>

                            <span className="nav-label">
                                API Keys
                            </span>
                        </Link>


                        <Link
                            to="/usage"
                            className={`nav-item ${
                                isActive("/usage")
                                    ? "nav-item-active"
                                    : ""
                            }`}
                        >
                            <span className="nav-icon">
                                ◌
                            </span>

                            <span className="nav-label">
                                Usage
                            </span>
                        </Link>

                    </div>
                    <div className="sidebar-bottom">
    <button
        type="button"
        className="nav-item logout-item"
        onClick={() => {
            logout();
            window.location.href = "/auth/login";
        }}
    >
        <span className="nav-icon">↪</span>
        <span className="nav-label">Logout</span>
    </button>
</div>

                </nav>

            </aside>


            {/* PAGE CONTENT */}

            <main className="protected-content">
                <Outlet />
            </main>

        </div>
    );
}

export default ProtectedLayout;