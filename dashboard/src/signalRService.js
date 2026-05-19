import * as signalR from '@microsoft/signalr';

// Use environment variable or fallback to localhost
const SIGNALR_URL = process.env.REACT_APP_SIGNALR_URL || "http://localhost:5086";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_URL}/metricshub`)
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();

export default connection;