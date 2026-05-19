import { useState } from "react";
import TechOpsDashboard from "./App";
import FinanceDashboard from "./FinanceDashboard";

export default function AppRoot() {
    const [activeTab, setActiveTab] = useState("techops");

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080b0f; --surface: #0e1318; --border: #1c2530;
          --muted: #3d5068; --text: #c8d8e8; --dim: #7a90a4;
          --green: #00e5a0; --amber: #f5a623; --red: #ff4757; --blue: #3d9bff;
        }
        body {
          background: var(--bg); color: var(--text);
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          min-height: 100vh;
        }
        body::before {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 999;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px);
        }
      `}</style>

            <nav style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "var(--bg)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                gap: 0,
                padding: "0 20px",
            }}>
                <button
                    onClick={() => setActiveTab("techops")}
                    style={{
                        flex: 1,
                        padding: "14px 20px",
                        background: activeTab === "techops" ? "var(--surface)" : "transparent",
                        border: "none",
                        borderBottom: activeTab === "techops" ? "2px solid var(--green)" : "none",
                        color: activeTab === "techops" ? "var(--green)" : "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: activeTab === "techops" ? 700 : 500,
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        transition: "all .2s ease",
                    }}
                >
                    📊 TechOps Dashboard
                </button>
                <button
                    onClick={() => setActiveTab("finance")}
                    style={{
                        flex: 1,
                        padding: "14px 20px",
                        background: activeTab === "finance" ? "var(--surface)" : "transparent",
                        border: "none",
                        borderBottom: activeTab === "finance" ? "2px solid var(--green)" : "none",
                        color: activeTab === "finance" ? "var(--green)" : "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: activeTab === "finance" ? 700 : 500,
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        transition: "all .2s ease",
                    }}
                >
                    💰 Finance Dashboard
                </button>
            </nav>

            {activeTab === "techops" && <TechOpsDashboard />}
            {activeTab === "finance" && <FinanceDashboard />}
        </>
    );
}
