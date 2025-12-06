/**
 * Rideau Canal Dashboard - Frontend Application
 * Handles data fetching, UI updates, and chart rendering
 */

// Configuration
const API_BASE_URL = window.location.origin;
const REFRESH_INTERVAL = 30000; // 30 seconds

// Global state
let iceChart = null;
let tempChart = null;

/**
 * Initialize the dashboard
 */
async function initDashboard() {
    console.log('🚀 Initializing Rideau Canal Dashboard...');

    // Initial data fetch
    await updateDashboard();

    // Set up auto-refresh
    setInterval(updateDashboard, REFRESH_INTERVAL);

    console.log('✅ Dashboard initialized successfully');
}

/**
 * Update all dashboard data
 */
async function updateDashboard() {
    try {
        // Fetch latest data for all locations
        const latestResponse = await fetch(`${API_BASE_URL}/api/latest`);
        const latestData = await latestResponse.json();

        if (latestData.success) {
            updateLocationCards(latestData.data);
            updateLastUpdateTime();
        }

        // Fetch status
        const statusResponse = await fetch(`${API_BASE_URL}/api/status`);
        const statusData = await statusResponse.json();

        if (statusData.success) {
            updateOverallStatus(statusData.overallStatus);
        }

        // Update charts with historical data
        await updateCharts();

    } catch (error) {
        console.error('Error updating dashboard:', error);
        showError('Failed to fetch latest data. Retrying...');
    }
}

/**
 * Update location cards with latest data
 */
function updateLocationCards(locations) {
    locations.forEach(location => {
        const locationKey = getLocationKey(location.location);

        // Update metrics
        document.getElementById(`ice-${locationKey}`).textContent =
            location.avgIceThickness.toFixed(1);
        document.getElementById(`temp-${locationKey}`).textContent =
            location.avgSurfaceTemperature.toFixed(1);
        document.getElementById(`snow-${locationKey}`).textContent =
            location.maxSnowAccumulation.toFixed(1);

        // Update safety status
        const statusBadge = document.getElementById(`status-${locationKey}`);
        statusBadge.textContent = location.safetyStatus;
        statusBadge.className = `safety-badge ${location.safetyStatus.toLowerCase()}`;
    });
}

/**
 * Update overall status badge
 */
function updateOverallStatus(status) {
    const statusBadge = document.getElementById('overallStatus');
    statusBadge.className = `status-badge ${status.toLowerCase()}`;
    statusBadge.innerHTML = `<span class="status-text">Canal Status: ${status}</span>`;
}

/**
 * Update last update timestamp
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}

/**
 * Update charts with historical data
 */
async function updateCharts() {
    try {
        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const colors = {
            "Dow's Lake": 'rgb(75, 192, 192)',
            "Fifth Avenue": 'rgb(255, 99, 132)',
            "NAC": 'rgb(54, 162, 235)'
        };

        // Fetch historical data for all locations
        const historicalData = await Promise.all(
            locations.map(async (location) => {
                const response = await fetch(
                    `${API_BASE_URL}/api/history/${encodeURIComponent(location)}?limit=12`
                );
                const data = await response.json();
                return { location, data: data.data };
            })
        );

        // Prepare chart data
        const iceDatasets = historicalData.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgIceThickness),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        const tempDatasets = historicalData.map(({ location, data }) => ({
            label: location,
            data: data.map(d => d.avgSurfaceTemperature),
            borderColor: colors[location],
            backgroundColor: colors[location] + '33',
            tension: 0.4,
            fill: false
        }));

        // Get time labels from first location's data
        const labels = historicalData[0].data.map(d =>
            new Date(d.windowEndTime).toLocaleTimeString('en-CA', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        // Update or create ice thickness chart
        if (iceChart) {
            iceChart.data.labels = labels;
            iceChart.data.datasets = iceDatasets;
            iceChart.update();
        } else {
            const ctx = document.getElementById('iceThicknessChart').getContext('2d');
            iceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: iceDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Ice Thickness (cm)'
                            }
                        }
                    }
                }
            });
        }

        // Update or create temperature chart
        if (tempChart) {
            tempChart.data.labels = labels;
            tempChart.data.datasets = tempDatasets;
            tempChart.update();
        } else {
            const ctx = document.getElementById('temperatureChart').getContext('2d');
            tempChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: tempDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Surface Temperature (°C)'
                            }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

/**
 * Convert location name to key for DOM IDs
 */
function getLocationKey(location) {
    const keyMap = {
        "Dow's Lake": "dows",
        "Fifth Avenue": "fifth",
        "NAC": "nac"
    };
    return keyMap[location] || location.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Show error message (you can enhance this with a toast notification)
 */
function showError(message) {
    console.error(message);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initDashboard);