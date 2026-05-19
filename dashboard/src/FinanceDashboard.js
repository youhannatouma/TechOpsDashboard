import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5086";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatPercent(value) {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
}

function formatNumber(value) {
    if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";
    return value.toFixed(0);
}

function PriceChange({ change, changePercent }) {
    const color = change >= 0 ? "var(--green)" : "var(--red)";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color, fontWeight: 600 }}>
                {change >= 0 ? "/" : "\\"} {formatCurrency(change)}
            </span>
            <span style={{ color, fontSize: 11, opacity: 0.8 }}>
                ({formatPercent(changePercent)})
            </span>
        </div>
    );
}

function StockCard({ quote }) {
    if (!quote) return null;

    return (
        <div
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 200,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                        {quote.symbol}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                        {quote.companyName}
                    </div>
                </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--blue)" }}>
                {formatCurrency(quote.price)}
            </div>

            <PriceChange change={quote.change} changePercent={quote.changePercent} />

            <div style={{ fontSize: 10, color: "var(--muted)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span>H: {formatCurrency(quote.high)}</span>
                <span>L: {formatCurrency(quote.low)}</span>
                <span>V: {formatNumber(quote.volume)}</span>
            </div>
        </div>
    );
}

function MarketIndicesSection({ indices }) {
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
        }}>
            <div style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--muted)",
                marginBottom: 12,
            }}>
                📊 Market Indices
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {indices.map((index) => (
                    <div key={index.symbol} style={{
                        background: "rgba(255,255,255,0.02)",
                        padding: 10,
                        borderRadius: 6,
                        borderLeft: "2px solid var(--blue)",
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 5 }}>
                            {index.name}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", marginBottom: 4 }}>
                            {formatCurrency(index.value)}
                        </div>
                        <PriceChange change={index.change} changePercent={index.changePercent} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PortfolioSection({ holdings, onRemove }) {
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.shares), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.costBasis * h.shares), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
        }}>
            <div style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--muted)",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <span>💼 Portfolio</span>
                <span style={{ color: "var(--green)" }}>
                    {formatCurrency(totalValue)} ({formatPercent(totalGainPercent)})
                </span>
            </div>

            {holdings.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 11, textAlign: "center", padding: "20px 0" }}>
                    No holdings yet. Add stocks to your portfolio!
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 10,
                }}>
                    {holdings.map((holding) => {
                        const value = holding.currentPrice * holding.shares;
                        const cost = holding.costBasis * holding.shares;
                        const gain = value - cost;
                        const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

                        return (
                            <div
                                key={holding.id}
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    padding: 10,
                                    borderRadius: 6,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600 }}>
                                        {holding.symbol} × {holding.shares}
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                                        {formatCurrency(holding.currentPrice)} per share
                                    </div>
                                    <div style={{ fontSize: 9, color: "var(--dim)", marginTop: 2 }}>
                                        Cost: {formatCurrency(cost)} | Gain: {formatCurrency(gain)} ({formatPercent(gainPercent)})
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(holding.id)}
                                    style={{
                                        background: "rgba(255, 71, 87, 0.2)",
                                        border: "1px solid rgba(255, 71, 87, 0.5)",
                                        color: "var(--red)",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        fontSize: 9,
                                        cursor: "pointer",
                                        marginLeft: 8,
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function WatchlistSection({ watchlist, onRemove }) {
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
        }}>
            <div style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--muted)",
                marginBottom: 12,
            }}>
                👁️ Watchlist
            </div>

            {watchlist.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 11, textAlign: "center", padding: "20px 0" }}>
                    Your watchlist is empty
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                    {watchlist.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                padding: 10,
                                borderRadius: 6,
                                fontSize: 10,
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                {item.symbol}
                            </div>
                            <div style={{ color: "var(--blue)", fontWeight: 600, marginBottom: 4 }}>
                                {formatCurrency(item.currentPrice)}
                            </div>
                            <PriceChange change={item.change} changePercent={item.changePercent} />
                            <button
                                onClick={() => onRemove(item.id)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--red)",
                                    fontSize: 9,
                                    cursor: "pointer",
                                    marginTop: 6,
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchBox({ onSearch }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        setQuery(e.target.value);

        if (e.target.value.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/stocks/search?q=${encodeURIComponent(e.target.value)}`);
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error("Search error:", err);
        }
        setLoading(false);
    };

    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
        }}>
            <div style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--muted)",
                marginBottom: 12,
            }}>
                🔍 Search Stocks
            </div>

            <input
                type="text"
                placeholder="Search by symbol or company name..."
                value={query}
                onChange={handleSearch}
                style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: 12,
                    marginBottom: 10,
                }}
            />

            {loading && <div style={{ color: "var(--muted)", fontSize: 10 }}>Searching...</div>}

            {results.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                    {results.map((result) => (
                        <div
                            key={result.symbol}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                padding: 8,
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 9,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                            onClick={() => onSearch(result.symbol)}
                        >
                            <strong>{result.symbol}</strong>
                            <span style={{ color: "var(--muted)" }}>{result.companyName}</span>
                            <span style={{ color: "var(--blue)" }}>{formatCurrency(result.price)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FinanceDashboard() {
    const [indices, setIndices] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [recentQuotes, setRecentQuotes] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [indicesRes, portfolioRes, watchlistRes] = await Promise.all([
                    fetch(`${API_URL}/api/stocks/indices`),
                    fetch(`${API_URL}/api/stocks/portfolio`),
                    fetch(`${API_URL}/api/stocks/watchlist`),
                ]);

                const [indicesData, portfolioData, watchlistData] = await Promise.all([
                    indicesRes.json(),
                    portfolioRes.json(),
                    watchlistRes.json(),
                ]);

                setIndices(indicesData);
                setPortfolio(portfolioData);
                setWatchlist(watchlistData);
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        }

        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleAddToWatchlist = async (symbol) => {
        try {
            const res = await fetch(`${API_URL}/api/stocks/watchlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    companyName: "",
                    currentPrice: 0,
                    change: 0,
                    changePercent: 0,
                }),
            });

            if (res.ok) {
                const item = await res.json();
                setWatchlist([...watchlist, item]);
                alert(`Added ${symbol} to watchlist!`);
            }
        } catch (err) {
            console.error("Error adding to watchlist:", err);
        }
    };

    const handleRemoveFromWatchlist = async (id) => {
        try {
            await fetch(`${API_URL}/api/stocks/watchlist/${id}`, { method: "DELETE" });
            setWatchlist(watchlist.filter((w) => w.id !== id));
        } catch (err) {
            console.error("Error removing from watchlist:", err);
        }
    };

    const handleRemoveFromPortfolio = async (id) => {
        try {
            await fetch(`${API_URL}/api/stocks/portfolio/${id}`, { method: "DELETE" });
            setPortfolio(portfolio.filter((h) => h.id !== id));
        } catch (err) {
            console.error("Error removing from portfolio:", err);
        }
    };

    return (
        <div className="shell">
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
        .shell { max-width: 1200px; margin: 0 auto; padding: 28px 20px 64px; }
      `}</style>

            <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 18, marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
                <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                        FINANCE <span style={{ color: "var(--green)" }}>DASHBOARD</span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 5 }}>
                        stock portfolio & market tracker
                    </div>
                </div>
            </header>

            <SearchBox onSearch={handleAddToWatchlist} />
            <MarketIndicesSection indices={indices} />
            <PortfolioSection holdings={portfolio} onRemove={handleRemoveFromPortfolio} />
            <WatchlistSection watchlist={watchlist} onRemove={handleRemoveFromWatchlist} />
        </div>
    );
}
