## API documentation

This backend API is used by the Rideau Canal Dashboard to fetch data from Azure Cosmos DB.
All responses are in JSON.

## GET /api/latest

Returns the newest reading for each location:

    - Dow’s Lake

    - Fifth Avenue

    - NAC

The backend queries Cosmos DB, sorts the data by timestamp, and sends back only the most recent record per location.

Example:

{
  "success": true,
  "data": [
    {
      "location": "Dow's Lake",
      "timestamp": "2025-12-08T03:10:59Z",
      "avgIceThickness": 32.1,
      "avgSurfaceTemperature": -6.2,
      "avgSnowAccumulation": 8.3,
      "avgExternalTemperature": -12.3
    }
  ]
}

## GET /api/history/:location

Returns all past records for one location, newest first.

Accepted values:

"Dow's Lake"

"Fifth Avenue"

"NAC"



## GET /health

Simple health check to confirm:

Server is running

Cosmos DB settings are loaded

Example:

{
  "status": "healthy"
}

GET /

Serves the dashboard’s main index.html page.

- Data Format

- Every record includes:

- location

- timestamp

- Average, max, and min values for:

- Ice thickness

- Surface temp

- External temp

- Snow accumulation