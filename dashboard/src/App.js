import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

function App() {
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7260/metricshub")
            .withAutomaticReconnect()
            .build();

        connection.start().then(() => {
            console.log("Connected to SignalR");
        });

        connection.on("ReceiveMetric", (metric) => {
            setMetrics(prev => [metric, ...prev.slice(0, 49)]);
        });

    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>TechOps Live Dashboard</h1>

            {metrics.map((m, index) => (
                <div key={index}>
                    CPU: {m.cpuUsage.toFixed(2)}% |
                    Memory: {m.memoryUsage.toFixed(2)}% |
                    API: {m.apiResponseTime.toFixed(2)} ms
                </div>
            ))}

        </div>
    );
}

export default App;