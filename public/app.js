/**
 * Rideau Canal Dashboard - Frontend Application (FULLY FIXED)
 * Works with your current Cosmos DB + backend
 */

// API config
const API_BASE_URL = window.location.origin;
const REFRESH_INTERVAL = 30000;

// Chart references
let iceChart = null;
let tempChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
    console.log('🚀 Initializing Rideau Canal Dashboard...');
    await updateDashboard();
    setInterval(updateDashboard, REFRESH_INTERVAL);
}

/**
 * Fetch + update the dashboard
 */
async function updateDashboard() {
    try {
        // Fetch latest
        const latestResponse = await fetch(`${API_BASE_URL}/api/latest`);
        const latestData = await latestResponse.json();

        if (latestData.success) {
            updateLocationCards(latestData.data);
            updateLastUpdateTime();
        }

        // Update charts
        await updateCharts();

    } catch (error) {
        console.error("🔥 Dashboard update error:", error);
    }
}

/**
 * Update the location cards
 */
function updateLocationCards(locations) {
    locations.forEach(loc => {
        const key = getLocationKey(loc.location);

        // Update values
        document.getElementById(`ice-${key}`).textContent =
            loc.avgIceThickness.toFixed(1);

        document.getElementById(`temp-${key}`).textContent =
            loc.avgSurfaceTemperature.toFixed(1);

        document.getElementById(`snow-${key}`).textContent =
            loc.maxSnowAccumulation.toFixed(1);

        // No safetyStatus available in DB → default display
        const badge = document.getElementById(`status-${key}`);
        badge.textContent = "Active";
        badge.className = "safety-badge active";
    });
}

/**
 * Update timestamp footer
 */
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent =
        now.toLocaleTimeString('en-CA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
}

/**
 * Fetch historical data and update charts
 */
async function updateCharts() {
    try {
        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const colors = {
            "Dow's Lake": 'rgb(75, 192, 192)',
            "Fifth Avenue": 'rgb(255, 99, 132)',
            "NAC": 'rgb(54, 162, 235)'
        };

        // Fetch history for each location
        const history = await Promise.all(
            locations.map(async loc => {
                const resp = await fetch(
                    `${API_BASE_URL}/api/history/${encodeURIComponent(loc)}`
                );
                const json = await resp.json();
                return { location: loc, data: json.data };
            })
        );

        // Build datasets
        const iceDatasets = history.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgIceThickness),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        const tempDatasets = history.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgSurfaceTemperature),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        // **Fix: timestamps come from d.timestamp, NOT windowEndTime**
        const labels = history[0].data.map(d =>
            new Date(d.timestamp).toLocaleTimeString('en-CA', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        // Build charts
        renderIceChart(labels, iceDatasets);
        renderTempChart(labels, tempDatasets);

    } catch (err) {
        console.error("🔥 Chart update error:", err);
    }
}

/**
 * Render ice thickness chart
 */
function renderIceChart(labels, datasets) {
    if (iceChart) {
        iceChart.data.labels = labels;
        iceChart.data.datasets = datasets;
        iceChart.update();
        return;
    }

    const ctx = document.getElementById('iceThicknessChart').getContext('2d');
    iceChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: { display: true, text: 'Ice Thickness (cm)' }
                }
            }
        }
    });
}

/**
 * Render temperature chart
 */
function renderTempChart(labels, datasets) {
    if (tempChart) {
        tempChart.data.labels = labels;
        tempChart.data.datasets = datasets;
        tempChart.update();
        return;
    }

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    tempChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: { display: true, text: 'Surface Temperature (°C)' }
                }
            }
        }
    });
}

/**
 * Map location names to DOM element keys
 */
function getLocationKey(location) {
    return {
        "Dow's Lake": "dows",
        "Fifth Avenue": "fifth",
        "NAC": "nac"
    }[location] || location.toLowerCase().replace(/[^a-z]/g, '');
}
