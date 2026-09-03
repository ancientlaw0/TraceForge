import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

import "../css/ProtectedLayout.css";

function ProtectedLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`protected-layout ${
                collapsed
                    ? "sidebar-collapsed"
                    : ""
            }`}
        >
            <Sidebar
                collapsed={collapsed}
                onToggle={() =>
                    setCollapsed(
                        (value) => !value
                    )
                }
            />

            <main className="protected-content">
                <Outlet />
            </main>
        </div>
    );
}

export default ProtectedLayout;