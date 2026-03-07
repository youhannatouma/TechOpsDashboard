import React, { useEffect, useState } from 'react';
import connection from './signalRService';

function MetricsDashboard() {
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {
        connection.start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.error('Connection failed: ', err));

        connection.on('ReceiveMetric', (newMetric) => {
            setMetrics(prevMetrics => [...prevMetrics, newMetric]);
        });

        return () => {
            connection.off('ReceiveMetric');
        };
    }, []);

    return (
        <div>
            <h2>Tech Metrics Dashboard</h2>
            <ul>
                {metrics.map((metric, index) => (
                    <li key={index}>
                        Time: {new Date(metric.timestamp).toLocaleTimeString()} |
                        CPU: {metric.cpuUsage.toFixed(2)}% |
                        Memory: {metric.memoryUsage.toFixed(2)}% |
                        API Response: {metric.apiResponseTime.toFixed(2)} ms
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MetricsDashboard;