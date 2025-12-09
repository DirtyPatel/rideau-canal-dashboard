### Dashboard 

A lightweight JavaScript dashboard that visualizes processed canal data stored in Cosmos DB.
The dashboard fetches the latest measurements every few seconds and updates charts showing:

- Ice thickness

- Surface temperature

- External temperature

- Snow accumulation

Built with:

- HTML

- CSS

- JavaScript

- Chart.js

- Node.js (backend API)

### Features

- The dashboard is designed to show what’s happening at each canal location in real time. As soon as new data lands in Cosmos DB, the dashboard fetches it through the backend API and updates the display automatically. 

- The page shows the most recent readings for every location, and it also generates live graph using Chart.js so you can visually track how the numbers change over time. Everything works locally during development, and then we deploy it to Azure App Service so the dashboard can run online just like a real production web app.

 ## Setup Instructions are as follows: 

1. Install dependencies
npm install

2. Configure environment variables

Copy .env.example → .env

Set Cosmos DB credentials:

COSMOS_ENDPOINT="https://your-db.documents.azure.com"
COSMOS_KEY="your-key"
COSMOS_DATABASE="RideauCanalDB"
COSMOS_CONTAINER="SensorAggregations"

3. Start dashboard
node server.js


Open your browser at:

http://localhost:3000