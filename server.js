/**
 * Rideau Canal Monitoring Dashboard - Backend Server (FINAL FIXED VERSION)
 */

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===================== Cosmos DB Setup =====================
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

// ===================== Helpers =====================
function mapCosmosRecord(item) {
    return {
        location: item.location,
        timestamp: item.timestamp,

        avgIceThickness: item.avgIceThickness,
        maxIceThickness: item.maxIceThickness,
        minIceThickness: item.minIceThickness,

        avgSurfaceTemperature: item.avgSurfaceTemp,
        maxSurfaceTemperature: item.maxSurfaceTemp,
        minSurfaceTemperature: item.minSurfaceTemp,

        avgSnowAccumulation: item.avgSnow,
        maxSnowAccumulation: item.maxSnow,
        minSnowAccumulation: item.minSnow,

        avgExternalTemperature: item.avgExternalTemp,
        maxExternalTemperature: item.maxExternalTemp,
        minExternalTemperature: item.minExternalTemp,
    };
}

// ===================== /api/latest =====================
app.get('/api/latest', async (req, res) => {
    console.log("🔍 /api/latest called...");

    try {
        console.log("📌 Using Cosmos endpoint:", process.env.COSMOS_ENDPOINT);
        console.log("📌 Database:", process.env.COSMOS_DATABASE);
        console.log("📌 Container:", process.env.COSMOS_CONTAINER);

        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const results = [];

        for (const location of locations) {
            console.log(`\n=============================`);
            console.log(`📍 FETCHING LATEST FOR: ${location}`);
            console.log("=============================\n");

            const querySpec = {
                query: "SELECT * FROM c WHERE c.location = @location",
                parameters: [{ name: "@location", value: location }]
            };

            console.log("📝 QUERY SPEC:", JSON.stringify(querySpec, null, 2));

            let queryResult;
            try {
                queryResult = await container.items.query(querySpec).fetchAll();
            } catch (err) {
                console.error(`❌ Cosmos query failed for ${location}:`, err);
                continue;
            }

            const resources = queryResult.resources;
            console.log(`📦 Returned items count for ${location}:`, resources.length);

            if (resources.length === 0) {
                console.log(`⚠ No records found for ${location}`);
                continue;
            }

            console.log("📄 First record structure:", Object.keys(resources[0]));

            // Sort newest → oldest
            resources.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const latest = resources[0];
            console.log("⏱ Latest timestamp:", latest.timestamp);

            results.push(mapCosmosRecord(latest));
        }

        console.log("\n✨ FINAL RESULT:", JSON.stringify(results, null, 2));

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: results
        });

    } catch (error) {
        console.error("🔥 CRITICAL ERROR in /api/latest:", error);
        res.status(500).json({ success: false, error: "Failed to fetch latest data" });
    }
});

// ===================== /api/history/:location =====================
app.get("/api/history/:location", async (req, res) => {
    try {
        const location = decodeURIComponent(req.params.location);

        const querySpec = {
            query: "SELECT * FROM c WHERE c.location = @location ORDER BY c.timestamp DESC",
            parameters: [{ name: "@location", value: location }],
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        const mapped = resources.map(mapCosmosRecord);

        res.json({ success: true, data: mapped });

    } catch (error) {
        console.error("🔥 ERROR /api/history:", error);
        res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
});

// ===================== Root + Health =====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

// ===================== Start Server =====================
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
