# Comprehensive description for dashboard 

This repository contains the lightweight JavaScript dashboard used to visualize processed canal data stored in Azure Cosmos DB. The dashboard fetches the latest measurements every few seconds and updates the charts automatically so users can see real-time conditions at each canal location.

### What the Dashboard Shows

- Average, minimum, and maximum ice thickness

- Average, minimum, and maximum surface temperature

- Maximum snow accumulation

- Average external temperature

- Total reading count per time window

##  Technology Stack

- HTML

- CSS

- JavaScript

- Chart.js (for real-time graphs)

- Node.js backend API (queries Cosmos DB)

# How does it work.

The dashboard continuously checks Cosmos DB through the backend API. When new data arrives, the page automatically updates the displayed values and redraws the charts so users can visually track how conditions change over time. It works both locally during development and as a deployed web app on Azure App Service, making it function like a small real-world monitoring dashboard.

# Setup Instructions
1. Install dependencies
npm install

2. Configure environment variables

Create a .env file based on .env.example and fill in your Cosmos DB settings:

COSMOS_ENDPOINT="https://your-db.documents.azure.com"
COSMOS_KEY="your-key"
COSMOS_DATABASE="RideauCanalDB"
COSMOS_CONTAINER="SensorAggregations"

3. Start the Dashboard
node server.js


Then open your browser:

http://localhost:3000

## Deployment to Azure App Service
1.  Prepare App

Ensure the project includes:

- server.js

- package.json

- .env file (locally only; Azure requires App Settings)

2. Deploy Steps

- Push the repo to GitHub

- Create a Node.js App Service in Azure

- Go to Deployment Center → connect GitHub repo

- Add the following App Settings in Azure:

COSMOS_ENDPOINT=your-endpoint
COSMOS_KEY=your-key
COSMOS_DATABASE=RideauCanalDB
COSMOS_CONTAINER=SensorAggregations
WEBSITE_NODE_DEFAULT_VERSION=~18


- Restart App Service

- Visit the deployed URL

## Dashboard Features Summary

- Updates live without refresh

- Real-time charts

- Color-coded values (optional)

- Works smoothly with Stream Analytics data