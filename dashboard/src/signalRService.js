import * as signalR from '@microsoft/signalr';

const API_URL = "http://localhost:5086";
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5086/metricshub")    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();

export default connection;