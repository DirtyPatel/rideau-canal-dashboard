
Name: Dharti Patel

Student ID: 040775191

Course: CST8916 


## Repositories

- Dashboard Repo: 

- Sensor Simulation Repo:

- Monitoring Repo: 

## Project Summary

The idea was to create a basic cloud pipeline that collects sensor data from three canal locations (Dow’s Lake, Fifth Avenue, NAC). Because we don’t have actual sensors,A Python simulator was built that sends random readings to Azure.

Azure services process the data and the dashboard shows the latest numbers and charts.

This setup mimics a real monitoring system used for safety and winter maintenance.

## Architecture Overview

### Data Flow :

Python Simulator sends JSON messages to Azure IoT Hub.
Stream Analytics reads the messages and calculates averages every 30 seconds.
Cosmos DB stores the processed results.
Blob Storage saves archived results.

Web Dashboard (React) fetches data from Cosmos DB and updates the UI.
Dashboard is deployed to Azure App Service.

Azure Used: IoT Hub, Stream Analytics, Cosmos DB, Blob Storage and App Service.

### Components: 

1. Sensor Simulator (Python)

Sends random data every few seconds.

Uses Azure IoT Device SDK.

Example payload:

{
  "location": "DowsLake",
  "iceThickness": 34.2,
  "surfaceTemp": -6.1,
  "externalTemp": -12.4,
  "snowAccumulation": 9.8
}

2. Stream Analytics Job

It reads IoT Hub messages and outputs two things:

Aggregated data → Cosmos DB

Raw data → Blob Storage


3. Cosmos DB

Database name: RideauCanalDB

Container: SensorAggregations

Partition key: /location

Stores aggregated 30-second results that the dashboard reads.

4. Web Dashboard

Built with HTML, CSS , JavaScript and Chart.js

Shows the latest values for each location.
Displays charts for trends.
Polls data every few seconds.
Hosted on Azure App Service.

### Setup:

Run the Python simulator (sends data to IoT Hub).
Start Stream Analytics job.

Confirm documents appear in Cosmos DB.

Run the React dashboard locally or deploy to App Service.
