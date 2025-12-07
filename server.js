/**
 * Rideau Canal Monitoring Dashboard - Backend Server (CORRECTED)
 * Serves the dashboard and provides API endpoints for real-time data
 */

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Cosmos DB Client
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

/**
 * API Endpoint: Get latest readings for all locations
 */
app.get('/api/latest', async (req, res) => {
    try {
        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const results = [];

        for (const location of locations) {
            // Query without subquery - get all records for location, sort client-side
            const querySpec = {
                query: "SELECT * FROM c WHERE c.location = @location",
                parameters: [
                    { name: "@location", value: location }
                ]
            };

            const { resources } = await container.items
                .query(querySpec)
                .fetchAll();

            if (resources.length > 0) {
                // Sort by timestamp descending and get the first one
                resources.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                results.push(resources[0]);
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: results
        });

    } catch (error) {
        console.error("🔥 ERROR in /api/latest:", error.message);
        console.error(error);   // full stack trace
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest data'
        });
    }
});

/**
 * API Endpoint: Get historical data for a specific location
 */
app.get('/api/history/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const limit = parseInt(req.query.limit) || 12; // Last hour (12 * 5 min)

        const querySpec = {
            query: "SELECT * FROM c WHERE c.location = @location",
            parameters: [
                { name: "@location", value: location }
            ]
        };

        const { resources } = await container.items
            .query(querySpec)
            .fetchAll();

        // Sort by timestamp descending and limit
        resources.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        const limitedResults = resources.slice(0, limit);

        res.json({
            success: true,
            location: location,
            data: limitedResults.reverse() // Oldest to newest for charting
        });

    } catch (error) {
        console.error("🔥 ERROR in /api/history:", error.message);
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch historical data'
        });
    }
});

/**
 * API Endpoint: Get overall system status
 */
app.get('/api/status', async (req, res) => {
    try {
        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const statuses = [];

        for (const location of locations) {
            // Simple query without subquery
            const querySpec = {
                query: "SELECT c.location, c.safetyStatus, c.timestamp FROM c WHERE c.location = @location",
                parameters: [
                    { name: "@location", value: location }
                ]
            };

            const { resources } = await container.items
                .query(querySpec)
                .fetchAll();

            if (resources.length > 0) {
                // Sort by timestamp descending and get the latest
                resources.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                statuses.push(resources[0]);
            }
        }

        // Determine overall status
        const overallStatus = statuses.every(s => s.safetyStatus === 'Safe') ? 'Safe' :
            statuses.some(s => s.safetyStatus === 'Unsafe') ? 'Unsafe' : 'Caution';

        res.json({
            success: true,
            overallStatus: overallStatus,
            locations: statuses
        });

    } catch (error) {
        console.error("🔥 ERROR in /api/history:", error.message);
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system status'
        });
    }
});

/**
 * API Endpoint: Get all data (for debugging)
 */
app.get('/api/all', async (req, res) => {
    try {
        const querySpec = {
            query: "SELECT * FROM c"
        };

        const { resources } = await container.items
            .query(querySpec)
            .fetchAll();

        // Sort by timestamp descending
        resources.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });

    } catch (error) {
        console.error("🔥 ERROR in /api/history:", error.message);
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch all data'
        });
    }
});

/**
 * Serve the dashboard
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cosmosdb: {
            endpoint: process.env.COSMOS_ENDPOINT ? 'configured' : 'missing',
            database: process.env.COSMOS_DATABASE,
            container: process.env.COSMOS_CONTAINER
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Rideau Canal Dashboard server running on http://localhost:${port}`);
    console.log(`📊 API endpoints available at http://localhost:${port}/api`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});

