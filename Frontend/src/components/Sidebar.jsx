import { NavLink } from "react-router-dom";

import "../css/Sidebar.css";

function Sidebar({ collapsed, onToggle }) {

    const navClass = ({ isActive }) =>
        `nav-item ${isActive ? "nav-item-active" : ""}`;


    return (
        <aside
            className={`dashboard-sidebar ${
                collapsed
                    ? "sidebar-collapsed"
                    : ""
            }`}
        >

            <div className="sidebar-header">

                <div className="sidebar-brand">

                    <span className="brand-mark">
                        TF
                    </span>

                    <span className="brand-text">
                        TraceForge
                    </span>

                </div>


                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={onToggle}
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {collapsed ? "›" : "‹"}
                </button>

            </div>


            <nav className="sidebar-nav">

                <div className="nav-section">

                    <NavLink
                        to="/dashboard"
                        className={navClass}
                        title="Overview"
                    >
                        <span className="nav-icon">
                            ⌂
                        </span>

                        <span className="nav-label">
                            Overview
                        </span>
                    </NavLink>

                </div>


                <div className="nav-section">

                    <p className="nav-section-label">
                        Observability
                    </p>


                    <NavLink
                        to="/analytics"
                        className={navClass}
                        title="Analytics"
                    >
                        <span className="nav-icon">
                            ◫
                        </span>

                        <span className="nav-label">
                            Analytics
                        </span>
                    </NavLink>


                    <NavLink
                        to="/live"
                        className={navClass}
                        title="Live"
                    >
                        <span className="nav-icon live-icon">
                            ●
                        </span>

                        <span className="nav-label">
                            Live
                        </span>
                    </NavLink>

                </div>


                <div className="nav-section">

                    <p className="nav-section-label">
                        Management
                    </p>


                    <NavLink
                        to="/alerts"
                        className={navClass}
                        title="Alerts"
                    >
                        <span className="nav-icon">
                            ◇
                        </span>

                        <span className="nav-label">
                            Alerts
                        </span>
                    </NavLink>


                    <NavLink
                        to="/api-keys"
                        className={navClass}
                        title="API Keys"
                    >
                        <span className="nav-icon">
                            ⌘
                        </span>

                        <span className="nav-label">
                            API Keys
                        </span>
                    </NavLink>


                    <NavLink
                        to="/usage"
                        className={navClass}
                        title="Usage"
                    >
                        <span className="nav-icon">
                            ◌
                        </span>

                        <span className="nav-label">
                            Usage
                        </span>
                    </NavLink>

                </div>

            </nav>


            <div className="sidebar-bottom">

                <NavLink
                    to="/settings"
                    className={navClass}
                    title="Settings"
                >
                    <span className="nav-icon">
                        ⚙
                    </span>

                    <span className="nav-label">
                        Settings
                    </span>
                </NavLink>

            </div>

        </aside>
    );
}

export default Sidebar;