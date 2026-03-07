import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:3000/metricshub')
    .configureLogging(signalR.LogLevel.Information)
    .build();

export default connection;