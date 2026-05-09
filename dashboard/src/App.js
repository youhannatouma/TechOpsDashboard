import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

// ── Config ───────────────────────────────────────────────────────────────────
const SIGNALR_URL = process.env.REACT_APP_SIGNALR_URL || "http://localhost:5086";
const MAX_METRICS = 50;

// ── Formatters ───────────────────────────────────────────────────────────────
function fmtBytes(b) {
    if (b >= 1e9) return (b / 1e9).toFixed(1) + " GB/s";
    if (b >= 1e6) return (b / 1e6).toFixed(1) + " MB/s";
    if (b >= 1e3) return (b / 1e3).toFixed(1) + " KB/s";
    return b.toFixed(0) + " B/s";
}

function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString("en-US", {
        hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
}

function statusColor(value, warn = 70, crit = 90) {
    if (value >= crit) return "var(--red)";
    if (value >= warn) return "var(--amber)";
    return "var(--green)";
}

function statusLabel(value, warn = 70, crit = 90) {
    if (value >= crit) return "CRIT";
    if (value >= warn) return "WARN";
    return "OK";
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, max = 100, width = 100, height = 28 }) {
    const W = width, H = height;
    if (!data || data.length < 2) return <svg width={W} height={H} />;
    const pts = data.slice(-30);
    const dataMax = Math.max(...pts, max * 0.01);
    const effectiveMax = Math.max(dataMax, max * 0.1);
    const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
    const ys = pts.map(v => H - (v / effectiveMax) * H * 0.9 - 2);
    const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const fill = `${d} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;
    const gid = `sg-${color.replace(/[^a-z]/gi, "")}-${W}`;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fill} fill={`url(#${gid})`} />
            <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── Gauge ────────────────────────────────────────────────────────────────────
function Gauge({ value, label, unit = "%", warn = 70, crit = 90, max = 100 }) {
    const color = statusColor(value / max * 100, warn, crit);
    const pct = Math.min(value / max, 1);
    const r = 36, circ = 2 * Math.PI * r;
    const arc = pct * circ * 0.75;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="6"
                    strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"
                    transform="rotate(-225 50 50)" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
                    transform="rotate(-225 50 50)"
                    style={{ transition: "stroke-dasharray .4s ease, stroke .4s ease" }} />
                <text x="50" y="47" textAnchor="middle" fill={color} fontSize="12" fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace">
                    {value.toFixed(1)}
                </text>
                <text x="50" y="58" textAnchor="middle" fill="var(--muted)" fontSize="8"
                    fontFamily="'JetBrains Mono', monospace">{unit}</text>
            </svg>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>
                {label}
            </span>
        </div>
    );
}

// ── StatRow: label + value + sparkline in one horizontal line ────────────────
function StatRow({ label, value, unit, history, color, max, warn, crit, isBytes }) {
    const c = isBytes
        ? statusColor((value / max) * 100, warn ?? 70, crit ?? 90)
        : statusColor(value, warn ?? 70, crit ?? 90);
    const displayColor = color ?? c;
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 0", borderBottom: "1px solid rgba(28,37,48,.5)",
        }}>
            <span style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: ".08em", minWidth: 130 }}>
                {label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: displayColor, minWidth: 90 }}>
                {isBytes ? fmtBytes(value) : `${value.toFixed(1)}${unit ?? ""}`}
            </span>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <Sparkline data={history} color={displayColor} max={max} width={90} height={24} />
            </div>
        </div>
    );
}

// ── Section card ─────────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
    return (
        <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 0,
        }}>
            <div style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: ".14em",
                color: "var(--muted)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
            }}>
                <span>{icon}</span>{title}
            </div>
            {children}
        </div>
    );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
    const [metrics, setMetrics] = useState([]);
    const [status, setStatus] = useState("connecting");
    const connRef = useRef(null);

    useEffect(() => {
        async function loadHistory() {
            try {
                const res = await fetch("http://localhost:5086/api/metrics?count=50");
                const data = await res.json();

                setMetrics(data.reverse());
            } catch (err) {
                console.error("Failed loading metrics", err);
            }
        }

        loadHistory();

        const conn = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5086/metricshub')
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connRef.current = conn;
        conn.onreconnecting(() => setStatus("connecting"));
        conn.onreconnected(() => setStatus("live"));
        conn.onclose(() => setStatus("error"));

        conn.start()
            .then(() => setStatus("live"))
            .catch(() => setStatus("error"));

        const handleMetric = metric => {
            setMetrics(prev => [metric, ...prev.slice(0, MAX_METRICS - 1)]);
        };

        conn.onclose(err => {
            console.error("SignalR CLOSED:", err);
            setStatus("error");
        });

        conn.onreconnecting(err => {
            console.warn("SignalR reconnecting:", err);
            setStatus("connecting");
        });

        conn.onreconnected(id => {
            console.log("SignalR reconnected:", id);
            setStatus("live");
        });

        conn.on("ReceiveMetric", handleMetric);
        return () => {
            conn.off("ReceiveMetric", handleMetric);
            conn.stop();
        };
    }, []);

    const m = metrics[0] ?? null;

    // Build history arrays (oldest → newest for sparklines)
    const hist = key => metrics.map(x => x[key]).reverse();

    const statusMeta = {
        connecting: { label: "CONNECTING", cls: "pulse" },
        live: { label: "LIVE", cls: "live" },
        error: { label: "DISCONNECTED", cls: "error" },
    }[status];

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
        .shell { max-width: 1140px; margin: 0 auto; padding: 28px 20px 64px; }
        .header { display:flex; align-items:flex-end; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:18px; margin-bottom:28px; gap:12px; flex-wrap:wrap; }
        .h-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#fff; letter-spacing:-.5px; }
        .h-title span { color:var(--green); }
        .h-sub { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-top:5px; }
        .pill { display:flex; align-items:center; gap:6px; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:4px 10px; border-radius:4px; border:1px solid; }
        .pill.live  { color:var(--green); border-color:rgba(0,229,160,.3); background:rgba(0,229,160,.07); }
        .pill.pulse { color:var(--amber); border-color:rgba(245,166,35,.3); background:rgba(245,166,35,.07); }
        .pill.error { color:var(--red);   border-color:rgba(255,71,87,.3);  background:rgba(255,71,87,.07); }
        .dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .live  .dot { background:var(--green); animation:blink 2s infinite; }
        .pulse .dot { background:var(--amber); animation:blink .8s infinite; }
        .error .dot { background:var(--red); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .gauge-row { display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-bottom:20px; }
        .gauge-cell { flex:1; display:flex; flex-direction:column; align-items:center; padding:16px 8px 12px; background:var(--surface); position:relative; }
        .gauge-cell + .gauge-cell { border-left:1px solid var(--border); }
        .gauge-cell::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
        .gauge-cell.warn::before { background:var(--amber); }
        .gauge-cell.crit::before { background:var(--red); }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
        .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
        .feed-hdr { display:flex; justify-content:space-between; margin-bottom:8px; }
        .feed-label { font-size:9px; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); }
        table { width:100%; border-collapse:collapse; font-size:11px; }
        thead th { text-align:left; padding:0 8px 7px; font-size:9px; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); border-bottom:1px solid var(--border); font-weight:500; }
        tbody tr { border-bottom:1px solid rgba(28,37,48,.5); transition:background .15s; }
        tbody tr:first-child { animation:fadeIn .25s ease; }
        tbody tr:hover { background:rgba(255,255,255,.02); }
        td { padding:5px 8px; color:var(--text); }
        td.ts { color:var(--muted); font-size:10px; }
        td.num { font-weight:500; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:80px 0; color:var(--muted); }
        .empty-icon { font-size:28px; opacity:.35; }
        .empty-text { font-size:11px; text-transform:uppercase; letter-spacing:.1em; }
        @media(max-width:700px) {
          .grid2,.grid3 { grid-template-columns:1fr; }
          .gauge-row { flex-direction:column; }
          .gauge-cell+.gauge-cell { border-left:none; border-top:1px solid var(--border); }
        }
      `}</style>

            <div className="shell">

                {/* Header */}
                <header className="header">
                    <div>
                        <div className="h-title">TECH<span>OPS</span> DASHBOARD</div>
                        <div className="h-sub">real-time infrastructure telemetry · {metrics.length} samples</div>
                    </div>
                    <div className={`pill ${statusMeta.cls}`}>
                        <div className="dot" />
                        {statusMeta.label}
                    </div>
                </header>

                {m ? (
                    <>
                        {/* Core gauges */}
                        <div className="gauge-row">
                            {[
                                { label: "CPU", value: m.cpuUsage, unit: "%", warn: 70, crit: 90 },
                                { label: "Memory", value: m.memoryUsage, unit: "%", warn: 70, crit: 90 },
                                { label: "API Latency", value: m.apiResponseTime, unit: "ms", warn: 200, crit: 500, max: 1000 },
                                { label: "Error Rate", value: m.errorRate, unit: "%", warn: 2, crit: 10 },
                            ].map(({ label, value, unit, warn, crit, max = 100 }) => (
                                <div key={label}
                                    className={`gauge-cell ${value >= crit ? "crit" : value >= warn ? "warn" : ""}`}>
                                    <Gauge label={label} value={value} unit={unit} warn={warn} crit={crit} max={max} />
                                </div>
                            ))}
                        </div>

                        {/* Disk + Network */}
                        <div className="grid2">
                            <Section title="Disk" icon="◈">
                                <StatRow label="Disk Used" value={m.diskUsage} unit="%" history={hist("diskUsage")} max={100} warn={75} crit={90} />
                                <StatRow label="Read Speed" value={m.diskReadBytes} isBytes history={hist("diskReadBytes")} max={50e6} color="var(--blue)" />
                                <StatRow label="Write Speed" value={m.diskWriteBytes} isBytes history={hist("diskWriteBytes")} max={20e6} color="var(--blue)" />
                            </Section>

                            <Section title="Network" icon="⇅">
                                <StatRow label="Inbound" value={m.networkInBytes} isBytes history={hist("networkInBytes")} max={100e6} color="var(--green)" />
                                <StatRow label="Outbound" value={m.networkOutBytes} isBytes history={hist("networkOutBytes")} max={40e6} color="var(--amber)" />
                            </Section>
                        </div>

                        {/* HTTP + Processes */}
                        <div className="grid3">
                            <Section title="HTTP Traffic" icon="⬡">
                                <StatRow label="Req/sec" value={m.requestsPerSecond} unit="" history={hist("requestsPerSecond")} max={500} color="var(--blue)" />
                                <StatRow label="Active Req" value={m.activeRequests} unit="" history={hist("activeRequests")} max={200} warn={100} crit={180} />
                                <StatRow label="Error Rate" value={m.errorRate} unit="%" history={hist("errorRate")} max={25} warn={2} crit={10} />
                            </Section>

                            <Section title="Processes" icon="⬢">
                                <StatRow label="Processes" value={m.processCount} unit="" history={hist("processCount")} max={400} color="var(--blue)" />
                                <StatRow label="Threads" value={m.threadCount} unit="" history={hist("threadCount")} max={4000} color="var(--amber)" />
                            </Section>

                            <Section title="System" icon="◇">
                                <StatRow label="CPU" value={m.cpuUsage} unit="%" history={hist("cpuUsage")} max={100} warn={70} crit={90} />
                                <StatRow label="Memory" value={m.memoryUsage} unit="%" history={hist("memoryUsage")} max={100} warn={70} crit={90} />
                            </Section>
                        </div>

                        {/* Event feed */}
                        <div className="feed-hdr">
                            <span className="feed-label">Event Feed</span>
                            <span className="feed-label">{metrics.length} / {MAX_METRICS} records</span>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>CPU %</th>
                                    <th>Mem %</th>
                                    <th>API ms</th>
                                    <th>Err %</th>
                                    <th>Disk R</th>
                                    <th>Disk W</th>
                                    <th>Net In</th>
                                    <th>Net Out</th>
                                    <th>Req/s</th>
                                    <th>Procs</th>
                                    <th>Threads</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.slice(0, 15).map((r, i) => (
                                    <tr key={`${r.id}-${r.timestamp}`}>
                                        <td className="ts">{fmtTime(r.timestamp)}</td>
                                        <td className="num" style={{ color: statusColor(r.cpuUsage) }}>{r.cpuUsage.toFixed(1)}</td>
                                        <td className="num" style={{ color: statusColor(r.memoryUsage) }}>{r.memoryUsage.toFixed(1)}</td>
                                        <td className="num" style={{ color: statusColor(r.apiResponseTime, 200, 500) }}>{r.apiResponseTime.toFixed(0)}</td>
                                        <td className="num" style={{ color: statusColor(r.errorRate, 2, 10) }}>{r.errorRate.toFixed(1)}</td>
                                        <td className="num" style={{ color: "var(--blue)" }}>{fmtBytes(r.diskReadBytes)}</td>
                                        <td className="num" style={{ color: "var(--blue)" }}>{fmtBytes(r.diskWriteBytes)}</td>
                                        <td className="num" style={{ color: "var(--green)" }}>{fmtBytes(r.networkInBytes)}</td>
                                        <td className="num" style={{ color: "var(--amber)" }}>{fmtBytes(r.networkOutBytes)}</td>
                                        <td className="num">{r.requestsPerSecond}</td>
                                        <td className="num">{r.processCount}</td>
                                        <td className="num">{r.threadCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <div className="empty">
                        <div className="empty-icon">⬡</div>
                        <div className="empty-text">
                            {status === "error" ? "Connection failed — check backend" : "Awaiting telemetry stream..."}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}