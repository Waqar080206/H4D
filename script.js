/* ====================================
   MONSOON RISK DASHBOARD - MAIN SCRIPT
   Unified Application Logic with Leaflet Map
   ==================================== */

// ====================================
// STATE MANAGEMENT
// ====================================
let appState = {
    currentRainfall: 0,
    selectedWardId: null,
    wardRisks: {},
    wardsData: [],
    weatherData: null,
    isUsingRealWeather: false,
    manualRainfallMode: false,
    map: null,
    wardMarkers: {}
};

// API CONFIGURATION
const WEATHER_API = {
    endpoint: 'https://api.openweathermap.org/data/2.5/weather',
    lat: 28.6139,
    lon: 77.2090,
    appid: '91bc6964310326323a961f4737b885bb'
};

const DELHI_CENTER = [28.6139, 77.2090];
const LEAFLET_MAP_ZOOM = 11;

// ====================================
// DOM SELECTORS
// ====================================
const elements = {
    map: document.getElementById('map'),
    rainfallValue: document.getElementById('rainfallValue'),
    weatherStatus: document.getElementById('weatherStatus'),
    lastUpdated: document.getElementById('lastUpdated'),
    highRiskCount: document.getElementById('highRiskCount'),
    mediumRiskCount: document.getElementById('mediumRiskCount'),
    lowRiskCount: document.getElementById('lowRiskCount'),
    wardList: document.getElementById('wardList'),
    detailsPanel: document.getElementById('detailsPanel'),
    wardName: document.getElementById('wardName'),
    detailsContent: document.getElementById('detailsContent'),
    closeDetails: document.getElementById('closeDetails'),
    realTimeBtn: document.getElementById('realTimeBtn'),
    rainfallBtns: document.querySelectorAll('.rainfall-btn[data-rainfall]')
};

// ====================================
// WEATHER API FUNCTIONS
// ====================================

/**
 * Fetch real-time weather data for Delhi
 */
async function fetchDelhiWeather() {
    try {
        const url = `${WEATHER_API.endpoint}?lat=${WEATHER_API.lat}&lon=${WEATHER_API.lon}&appid=${WEATHER_API.appid}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        appState.weatherData = data;
        
        // Extract rainfall data (in mm)
        let rainfallMm = 0;
        if (data.rain && data.rain['1h']) {
            rainfallMm = data.rain['1h'];
        }
        
        // Use actual rainfall if available, otherwise 0
        appState.currentRainfall = rainfallMm;
        appState.isUsingRealWeather = true;
        
        console.log('Weather data fetched:', {
            temp: data.main.temp,
            description: data.weather[0].description,
            rainfall: rainfallMm
        });
        
        return true;
    } catch (error) {
        console.warn('Failed to fetch real-time weather:', error.message);
        appState.isUsingRealWeather = false;
        appState.currentRainfall = 0;
        return false;
    }
}

/**
 * Refresh weather data and update dashboard (Real-time sync)
 */
function refreshWeatherData() {
    if (!appState.manualRainfallMode) {
        fetchDelhiWeather().then((success) => {
            if (success) {
                // Update all risk calculations based on new rainfall
                updateRisksForRainfall(appState.currentRainfall);
                
                // Update all UI components in sync
                updateHeaderInfo();
                updateMapMarkers();      // Real-time map updates
                updateSummaryPanel();
                updateWardList();        // Added for complete real-time sync
                
                // Update selected ward details if any
                if (appState.selectedWardId) {
                    const ward = appState.wardsData.find(w => w.id === appState.selectedWardId);
                    if (ward) showWardDetails(ward);
                }
                
                // Show real-time indicator
                showRealtimeIndicator();
            }
        });
    }
}

// ====================================
// LEAFLET MAP FUNCTIONS
// ====================================

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    if (!elements.map) {
        console.error("Map container #map not found");
        return;
    }

    console.log("Creating Leaflet map centered on Delhi...");
    
    // Create map
    appState.map = L.map("map", {
        center: DELHI_CENTER,
        zoom: LEAFLET_MAP_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 9,
    }).addTo(appState.map);

    console.log("Leaflet map created successfully");    // Add ward markers
    appState.wardsData.forEach((ward) => {
        addWardMarker(ward);
    });

    // Add hotspot markers
    WATER_LOGGING_HOTSPOTS.forEach((hotspot) => {
        addHotspotMarker(hotspot);
    });

    console.log(`${appState.wardsData.length} ward markers added to map`);
}

/**
 * Add individual ward marker to map
 */
function addWardMarker(ward) {
    if (!appState.map) {
        console.error("Map not initialized");
        return;
    }

    const risk = appState.wardRisks[ward.id];
    if (!risk) {
        console.warn(`Risk data not found for ward ${ward.id}`);
        return;
    }

    const color = getRiskColor(risk.category);
    
    // Create circle marker
    const marker = L.circleMarker(ward.coords, {
        radius: 20,
        fillColor: color,
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.85,
        className: "ward-marker",
    })
        .addTo(appState.map)
        .on("click", () => {
            appState.selectedWardId = ward.id;
            showWardDetails(ward);
            updateMapSelection();
            updateWardListSelection();
        });

    // Bind popup
    marker.bindPopup(createPopupHTML(ward), {
        maxWidth: 250,
        className: "ward-popup",
    });

    appState.wardMarkers[ward.id] = marker;
}

/**
 * Add hotspot marker to map
 */
function addHotspotMarker(hotspot) {
    if (!appState.map) return;

    // Create a small marker for hotspots
    const marker = L.circleMarker(hotspot.coords, {
        radius: 8,
        fillColor: "#ff6b6b",
        color: "#c41e3a",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7,
        className: "hotspot-marker",
    })
        .addTo(appState.map)
        .bindPopup(`<div style="font-weight: 700; color: #c41e3a;">${hotspot.name}</div><div style="font-size: 0.8rem; color: #666;">Water-Logging Hotspot</div>`, {
            maxWidth: 200,
            className: "hotspot-popup",
        });
}

/**
 * Create popup HTML for ward marker
 */
function createPopupHTML(ward) {
    const risk = appState.wardRisks[ward.id];
    if (!risk) return `<div>${ward.name}</div>`;
    
    return `
        <div style="padding: 0.5rem 0;">
            <div style="font-weight: 700; color: #212121; margin-bottom: 0.5rem;">
                ${ward.name}
            </div>
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">
                <strong>Risk:</strong> ${risk.category.toUpperCase()}
            </div>
            <div style="font-size: 0.85rem; color: #1565c0; font-weight: 600;">
                <strong>Score:</strong> ${risk.percentage}%
            </div>
        </div>
    `;
}

/**
 * Update marker colors on map
 */
function updateMapMarkers() {
    appState.wardsData.forEach((ward) => {
        if (appState.wardMarkers[ward.id]) {
            const risk = appState.wardRisks[ward.id];
            const color = getRiskColor(risk.category);
            
            appState.wardMarkers[ward.id].setStyle({
                fillColor: color,
            });
            appState.wardMarkers[ward.id].setPopupContent(createPopupHTML(ward));
        }
    });
}

/**
 * Update selection highlight on map
 */
function updateMapSelection() {
    const mapMarkers = document.querySelectorAll('.leaflet-marker-icon');
    mapMarkers.forEach(el => {
        if (el.closest('.leaflet-marker-pane')) {
            // Leaflet markers - just use visual feedback via hover
        }
    });
}

// ====================================
// RISK CALCULATION FUNCTIONS
// ====================================

/**
 * Calculate risks for all wards at given rainfall
 */
function updateRisksForRainfall(rainfall) {
    appState.wardRisks = {};
    
    appState.wardsData.forEach(ward => {
        const riskScore = calculateRiskScore(ward.baseRisk, rainfall, ward);
        appState.wardRisks[ward.id] = {
            score: riskScore,
            category: getRiskCategory(riskScore),
            percentage: getRiskPercentage(riskScore)
        };
    });
}

/**
 * Get risk color based on category
 */
function getRiskColor(category) {
    const colors = {
        high: "#d32f2f",
        medium: "#f57c00",
        low: "#388e3c",
    };
    return colors[category] || "#999";
}

// ====================================
// MISSING HELPER FUNCTIONS
// ====================================

/**
 * Calculate risk score based on multiple factors:
 * - Base risk from vulnerability assessment
 * - Rainfall intensity (trigger)
 * - Number of hotspots (concentration of vulnerable areas)
 * - Historical frequency (past occurrence patterns)
 * - Drainage quality (infrastructure resilience)
 * 
 * Improved Formula: baseRisk × (1 + rainfall/100) × hotspotFactor × historicalFactor × drainageFactor
 */
function calculateRiskScore(baseRisk, rainfall, wardData) {
    // Rainfall multiplier (primary trigger)
    const rainfallMultiplier = 1 + rainfall / 100;
    
    // Hotspot factor: penalize wards with more vulnerable locations
    // Normalize by ward with most hotspots (South Delhi has 12)
    const hotspotCount = wardData.hotspots ? wardData.hotspots.length : 0;
    const maxHotspots = 12; // South Delhi reference
    const hotspotFactor = 1 + (hotspotCount / maxHotspots) * 0.4; // 0-40% increase
    
    // Historical frequency factor: wards with more past events get higher multiplier
    // Normalize by max frequency (East Delhi: 12 events)
    const historicalFreq = wardData.historicalFrequency || 0;
    const maxFrequency = 12; // East Delhi reference
    const historicalFactor = 1 + (historicalFreq / maxFrequency) * 0.3; // 0-30% increase
    
    // Drainage quality factor: poor drainage increases risk
    const drainageMap = {
        "Poor": 1.2,
        "Moderate": 1.0,
        "Good": 0.8
    };
    const drainageFactor = drainageMap[wardData.drainageQuality] || 1.0;
    
    // Elevation factor: lower elevation = higher water accumulation risk
    // Normalize around 215m (mid-range)
    const elevationBaseline = 215;
    const elevationDiff = wardData.elevation - elevationBaseline;
    const elevationFactor = 1 - (elevationDiff / 100) * 0.15; // Lower areas get +15% risk
    
    // Combined calculation with weighted factors
    const adjustedRisk = baseRisk * rainfallMultiplier * hotspotFactor * historicalFactor * drainageFactor * elevationFactor;
    
    // Cap at reasonable maximum
    return Math.min(adjustedRisk, 1.5);
}

/**
 * Get risk category based on score
 */
function getRiskCategory(score) {
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
}

/**
 * Get risk percentage (0-100)
 */
function getRiskPercentage(score) {
    return Math.round(Math.min(score * 100, 100));
}

// ====================================
// UI UPDATE FUNCTIONS
// ====================================

/**
 * Update header information
 */
function updateHeaderInfo() {
    elements.rainfallValue.textContent = appState.currentRainfall.toFixed(1);
    elements.lastUpdated.textContent = new Date().toLocaleTimeString();
    
    if (appState.isUsingRealWeather && appState.weatherData) {
        const weatherDesc = appState.weatherData.weather[0].main;
        const temp = appState.weatherData.main.temp;
        if (elements.weatherStatus) {
            elements.weatherStatus.textContent = `${weatherDesc} • ${temp.toFixed(1)}°C`;
        }
    }
}

/**
 * Update risk summary counts
 */
function updateSummaryPanel() {
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    Object.values(appState.wardRisks).forEach(risk => {
        if (risk.category === 'high') highCount++;
        else if (risk.category === 'medium') mediumCount++;
        else lowCount++;
    });
    
    elements.highRiskCount.textContent = highCount;
    elements.mediumRiskCount.textContent = mediumCount;
    elements.lowRiskCount.textContent = lowCount;
}

/**
 * Render ward list in sidebar
 */
function updateWardList() {
    elements.wardList.innerHTML = '';
    
    appState.wardsData.forEach(ward => {
        const risk = appState.wardRisks[ward.id];
        if (!risk) return;
        
        const wardItemEl = document.createElement('div');
        wardItemEl.className = 'ward-item';
        wardItemEl.dataset.wardId = ward.id;
        wardItemEl.setAttribute('role', 'button');
        wardItemEl.setAttribute('tabindex', '0');
        
        wardItemEl.innerHTML = `
            <div>
                <div class="ward-item-name">${ward.name}</div>
                <div class="ward-item-zone">${ward.zone}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: ${getRiskColor(risk.category)}; font-size: 0.9rem;">
                    ${risk.percentage}%
                </div>
            </div>
        `;
        
        wardItemEl.addEventListener('click', () => {
            appState.selectedWardId = ward.id;
            updateWardListSelection();
            showWardDetails(ward);
        });
        
        wardItemEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                wardItemEl.click();
            }
        });
        
        elements.wardList.appendChild(wardItemEl);
    });
}

/**
 * Update selection highlight in ward list
 */
function updateWardListSelection() {
    const wardItems = document.querySelectorAll('.ward-item');
    wardItems.forEach(item => {
        const wardId = parseInt(item.dataset.wardId);
        if (wardId === appState.selectedWardId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Update entire dashboard
 */
function updateDashboard() {
    updateMapMarkers();
    updateRiskCounts();
    updateWardList();
}

/**
 * Update risk distribution counts
 */
function updateRiskCounts() {
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    Object.values(appState.wardRisks).forEach(risk => {
        if (risk.category === 'high') highCount++;
        else if (risk.category === 'medium') mediumCount++;
        else lowCount++;
    });
    
    elements.highRiskCount.textContent = highCount;
    elements.mediumRiskCount.textContent = mediumCount;
    elements.lowRiskCount.textContent = lowCount;
}

// ====================================
// WARD DETAILS PANEL
// ====================================

/**
 * Show detailed information for selected ward
 */
function showWardDetails(ward) {
    const risk = appState.wardRisks[ward.id];
    if (!risk) {
        console.warn(`Risk data not found for ward ${ward.id}`);
        return;
    }

    elements.wardName.textContent = ward.name;

    elements.detailsContent.innerHTML = `
        <div class="ward-detail">
            <div class="detail-section">
                <div class="detail-section-title">Risk Assessment</div>
                <div class="detail-row">
                    <span class="detail-label">Risk Level</span>
                    <span class="risk-badge ${risk.category}">
                        ${risk.category.toUpperCase()}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Risk Score</span>
                    <span class="detail-value">${risk.percentage}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Current Rainfall</span>
                    <span class="detail-value">${appState.currentRainfall.toFixed(1)} mm/hr</span>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Ward Information</div>
                <div class="detail-row">
                    <span class="detail-label">Zone</span>
                    <span class="detail-value">${ward.zone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Elevation</span>
                    <span class="detail-value">${ward.elevation} m</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Drainage Quality</span>
                    <span class="detail-value">${ward.drainageQuality}</span>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Preparedness Score</div>
                <div class="score-container">
                    <div class="score-circle ${ward.preparednessLevel}">
                        ${ward.preparednessScore}
                    </div>
                    <div class="score-text">
                        <div class="score-label">Overall Preparedness</div>
                        <div class="score-description">
                            ${ward.preparednessLevel === "high" ? "Well Prepared" : ward.preparednessLevel === "medium" ? "Moderate" : "Needs Improvement"}
                        </div>
                    </div>
                </div>
            </div>            <div class="detail-section">
                <div class="detail-section-title">Historical Data</div>
                <div class="detail-row">
                    <span class="detail-label">Total Events (5y)</span>
                    <span class="detail-value">${ward.historicalFrequency}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Last Event</span>
                    <span class="detail-value">${ward.lastEventDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Avg Recovery Time</span>
                    <span class="detail-value">${ward.averageRecoveryTime}</span>
                </div>
                ${ward.historicalEvents && ward.historicalEvents.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 0.75rem;">Recent Events</div>
                        ${ward.historicalEvents.map((event, idx) => `
                            <div style="padding: 0.75rem; background-color: #f9f9f9; border-left: 3px solid ${event.severity === 'Severe' || event.severity === 'Very High' ? '#d32f2f' : event.severity === 'High' ? '#f57c00' : '#388e3c'}; margin-bottom: 0.75rem; border-radius: 2px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                    <span style="font-weight: 700; font-size: 0.9rem; color: #212121;">${event.year}</span>
                                    <span style="font-size: 0.75rem; font-weight: 700; color: #fff; background-color: ${event.severity === 'Severe' || event.severity === 'Very High' ? '#d32f2f' : event.severity === 'High' ? '#f57c00' : '#388e3c'}; padding: 0.25rem 0.5rem; border-radius: 2px;">${event.severity}</span>
                                </div>
                                <div style="font-size: 0.8rem; color: #666; margin-bottom: 0.25rem;"><strong>Areas:</strong> ${event.affectedAreas}</div>
                                <div style="font-size: 0.8rem; color: #666;"><strong>Economic Loss:</strong> ${event.losses}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>            <div class="detail-section">
                <div class="detail-section-title">Probable Causes</div>
                <ul class="cause-list">
                    ${ward.causes.map((cause) => `<li>${cause}</li>`).join("")}
                </ul>
            </div>

            ${ward.hotspots && ward.hotspots.length > 0 ? `
            <div class="detail-section">
                <div class="detail-section-title">Water-Logging Hotspots in Ward</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${ward.hotspots.map((hotspot) => `
                        <div style="padding: 0.75rem; background-color: #fff3e0; border-left: 3px solid #ff6b6b; border-radius: 2px; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: #c41e3a; font-weight: 700;">⚠</span>
                                <span style="color: #333; font-weight: 600;">${hotspot}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="detail-section">
                <div class="detail-section-title">Recommended Actions</div>
                <div class="action-checklist">
                    <label class="checklist-item">
                        <input type="checkbox" class="checklist-checkbox" />
                        <span class="checklist-label">Pre-monsoon desilting of drains</span>
                    </label>
                    <label class="checklist-item">
                        <input type="checkbox" class="checklist-checkbox" />
                        <span class="checklist-label">Deploy temporary pump units</span>
                    </label>
                    <label class="checklist-item">
                        <input type="checkbox" class="checklist-checkbox" />
                        <span class="checklist-label">Plan traffic diversions</span>
                    </label>
                    ${risk.category === 'high' ? `
                        <label class="checklist-item">
                            <input type="checkbox" class="checklist-checkbox" />
                            <span class="checklist-label">Activate emergency response team</span>
                        </label>
                        <label class="checklist-item">
                            <input type="checkbox" class="checklist-checkbox" />
                            <span class="checklist-label">Issue public flood warnings</span>
                        </label>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
    
    elements.detailsPanel.classList.add("active");
}

/**
 * Close the details panel
 */
function closeDetailsPanel() {
    elements.detailsPanel.classList.remove("active");
    elements.wardName.textContent = "Select a Ward";
    elements.detailsContent.innerHTML = `
        <p class="placeholder-text">Click on a ward marker to view details</p>
    `;
    appState.selectedWardId = null;
    updateWardListSelection();
}

// ====================================
// EVENT LISTENERS
// ====================================

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    // Real-time button
    if (elements.realTimeBtn) {
        elements.realTimeBtn.addEventListener('click', resetToRealWeather);
    }

    // Rainfall scenario buttons
    elements.rainfallBtns.forEach(btn => {
        btn.addEventListener('click', handleRainfallChange);
    });

    // Close details panel
    if (elements.closeDetails) {
        elements.closeDetails.addEventListener('click', closeDetailsPanel);
    }

    // Keyboard escape to close details
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDetailsPanel();
    });
}

/**
 * Handle rainfall scenario change
 */
function handleRainfallChange(event) {
    const rainfall = parseFloat(event.currentTarget.dataset.rainfall);
    
    // Update button states
    elements.realTimeBtn.classList.remove('active');
    elements.rainfallBtns.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Set manual mode
    appState.manualRainfallMode = true;
    appState.currentRainfall = rainfall;
    
    // Update UI
    updateRisksForRainfall(rainfall);
    updateHeaderInfo();
    updateMapMarkers();
    updateSummaryPanel();
    updateWardList();
    
    // Update selected ward details if any
    if (appState.selectedWardId) {
        const ward = appState.wardsData.find(w => w.id === appState.selectedWardId);
        if (ward) showWardDetails(ward);
    }
}

/**
 * Reset to real-time weather mode
 */
function resetToRealWeather() {
    appState.manualRainfallMode = false;
    
    // Update button states
    elements.realTimeBtn.classList.add('active');
    elements.rainfallBtns.forEach(btn => btn.classList.remove('active'));
    
    // Fetch latest weather
    fetchDelhiWeather().then(() => {
        updateRisksForRainfall(appState.currentRainfall);
        updateHeaderInfo();
        updateMapMarkers();
        updateSummaryPanel();
        updateWardList();
        
        // Update selected ward if any
        if (appState.selectedWardId) {
            const ward = appState.wardsData.find(w => w.id === appState.selectedWardId);
            if (ward) showWardDetails(ward);
        }
    });
}

/**
 * Show visual real-time update indicator
 */
function showRealtimeIndicator() {
    const realTimeBtn = document.getElementById('realTimeBtn');
    if (realTimeBtn && appState.isUsingRealWeather) {
        // Add a pulse effect to show real-time active
        realTimeBtn.classList.add('pulse-active');
        
        // Remove after animation completes
        setTimeout(() => {
            realTimeBtn.classList.remove('pulse-active');
        }, 600);
    }
}

// ====================================
// APPLICATION INITIALIZATION
// ====================================

/**
 * Main initialization function
 */
function initializeApp() {
    console.log("Initializing Monsoon Risk Dashboard...");
    
    // Copy wards data from global WARDS_DATA
    if (typeof WARDS_DATA !== "undefined") {
        appState.wardsData = JSON.parse(JSON.stringify(WARDS_DATA));
        console.log(`Loaded ${appState.wardsData.length} wards`);
    } else {
        console.error("WARDS_DATA not found - make sure data.js is loaded");
        return;
    }

    // Initial risk calculations
    updateRisksForRainfall(0);

    // Check if Leaflet is available
    if (typeof L !== "undefined") {
        // Initialize map
        initializeMap();
    } else {
        console.error("Leaflet library not loaded");
    }

    // Fetch real-time weather
    fetchDelhiWeather().then(() => {
        updateRisksForRainfall(appState.currentRainfall);
        updateHeaderInfo();
        updateMapMarkers();
        updateSummaryPanel();
        updateWardList();
    });    // Attach event listeners
    attachEventListeners();

    // Refresh weather every 2 minutes for real-time updates
    // This ensures map and all ward risk levels update automatically
    setInterval(refreshWeatherData, 2 * 60 * 1000);
    
    // Optional: Also refresh on browser tab visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !appState.manualRainfallMode) {
            // User returned to tab - fetch fresh data immediately
            refreshWeatherData();
        }
    });

    console.log("Dashboard initialized successfully - Real-time sync enabled");
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
