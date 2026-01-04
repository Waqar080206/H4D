/* ====================================
   MONSOON RISK DASHBOARD - WARD DATA
   Static data with real water-logging hotspots
   ==================================== */

// Real water-logging hotspots in Delhi with coordinates
const WATER_LOGGING_HOTSPOTS = [
    // Central Delhi (ITO, Kashmere Gate, Minto)
    { name: "ITO Bridge", coords: [28.6116, 77.2476], zone: "Central" },
    { name: "Kashmere Gate Metro", coords: [28.6510, 77.2376], zone: "Central" },
    { name: "Minto Bridge Underpass", coords: [28.6285, 77.2383], zone: "Central" },
    { name: "Chelmsford Club, Raisina Road", coords: [28.6133, 77.2000], zone: "Central" },
    
    // New Delhi Area (Lodi, Rajpath)
    { name: "Lodi Road", coords: [28.5934, 77.2200], zone: "South" },
    { name: "Niti Marg", coords: [28.5905, 77.2100], zone: "South" },
    { name: "Shanti Path", coords: [28.5800, 77.2050], zone: "South" },
    { name: "South Avenue", coords: [28.5920, 77.2150], zone: "South" },
    
    // Greater Kailash Area
    { name: "Greater Kailash 1", coords: [28.5244, 77.1855], zone: "South" },
    { name: "Greater Kailash 2", coords: [28.5220, 77.1900], zone: "South" },
    { name: "Panchsheel", coords: [28.5160, 77.1950], zone: "South" },
    
    // East Delhi (Yamuna Floodplain)
    { name: "Mathura Road", coords: [28.5550, 77.2600], zone: "East" },
    { name: "Kalindi Kunj Road", coords: [28.5300, 77.2800], zone: "East" },
    { name: "Sangam Vihar", coords: [28.5450, 77.2900], zone: "East" },
    { name: "Jangpura", coords: [28.5700, 77.2500], zone: "East" },
    { name: "Nizamuddin Flyover", coords: [28.5800, 77.2400], zone: "East" },
    
    // Airport Area / South Delhi
    { name: "Mahipalpur Road", coords: [28.5530, 77.1650], zone: "South" },
    { name: "Mehrauli Badarpur Road", coords: [28.5100, 77.1800], zone: "South" },
    { name: "Vasant Kunj", coords: [28.5280, 77.1960], zone: "South" },
    
    // West Delhi
    { name: "Modi Flyover", coords: [28.6400, 77.0900], zone: "West" },
    { name: "Defence Colony", coords: [28.5650, 77.2050], zone: "South" },
    
    // North Delhi
    { name: "Kashmere Gate", coords: [28.6510, 77.2376], zone: "North" },
    { name: "Maa Anandmai Marg", coords: [28.6800, 77.2400], zone: "North" },
    { name: "G.T Road", coords: [28.7000, 77.2300], zone: "North" },
    
    // Hospital Areas (High risk due to heavy usage)
    { name: "Indraprastha Apollo", coords: [28.6085, 77.2485], zone: "Central" },
    { name: "Moolchand Hospital", coords: [28.5920, 77.2100], zone: "South" },
    { name: "AIIMS Hospital", coords: [28.5820, 77.2100], zone: "South" },
    { name: "Safdarjung Hospital", coords: [28.5890, 77.1950], zone: "South" },
    { name: "Escorts Hospital", coords: [28.6700, 77.2100], zone: "West" },
    
    // Stadium Areas
    { name: "National Stadium", coords: [28.5880, 77.2050], zone: "South" },
    { name: "Ambedkar Stadium", coords: [28.5950, 77.1980], zone: "South" },
    { name: "Jawaharlal Nehru Stadium Marg", coords: [28.5750, 77.2450], zone: "South" },
    { name: "I.G. Indoor Stadium", coords: [28.6000, 77.1950], zone: "South" },
    
    // Market Areas
    { name: "Azad Market Chowk", coords: [28.6530, 77.2340], zone: "Central" },
    { name: "Chandni Chowk", coords: [28.6505, 77.2303], zone: "Central" },
    { name: "Malka Ganj", coords: [28.6600, 77.2250], zone: "North" },
    
    // Other major intersections
    { name: "August Kranti Chowk", coords: [28.6200, 77.2100], zone: "Central" },
    { name: "Civic Centre Chowk", coords: [28.6150, 77.2000], zone: "Central" },
    { name: "Ring Road", coords: [28.6500, 77.2500], zone: "North" },
    { name: "Outer Ring Road", coords: [28.6000, 77.3000], zone: "East" }
];

const WARDS_DATA = [    {
        id: 1,
        name: "North Delhi",
        zone: "North Zone",
        coords: [28.7595, 77.2273],
        elevation: 218,
        drainageQuality: "Moderate",
        baseRisk: 0.45,
        historicalFrequency: 8,
        hotspots: [
            "Kashmere Gate Metro",
            "Maa Anandmai Marg",
            "G.T Road",
            "Malka Ganj"
        ],
        historicalEvents: [
            { year: 2021, severity: "High", affectedAreas: "3 colonies", losses: "₹2.5 Cr" },
            { year: 2022, severity: "Medium", affectedAreas: "2 colonies", losses: "₹1.2 Cr" },
            { year: 2023, severity: "High", affectedAreas: "4 colonies", losses: "₹3.1 Cr" }
        ],
        lastEventDate: "Aug 2023",
        averageRecoveryTime: "5-7 days",
        preparednessScore: 55,
        preparednessLevel: "medium",
        causes: [
            "Poor drainage in low-lying areas",
            "Blocked sewers during monsoon",
            "Urban sprawl reducing green cover"
        ]
    },    {
        id: 2,
        name: "Central Delhi",
        zone: "Central Zone",
        coords: [28.6328, 77.2197],
        elevation: 205,
        drainageQuality: "Good",
        baseRisk: 0.35,
        historicalFrequency: 5,
        hotspots: [
            "ITO Bridge",
            "Kashmere Gate",
            "Azad Market Chowk",
            "Indraprastha Apollo",
            "August Kranti Chowk",
            "Civic Centre Chowk"
        ],
        historicalEvents: [
            { year: 2021, severity: "Medium", affectedAreas: "2 colonies", losses: "₹0.9 Cr" },
            { year: 2023, severity: "Low", affectedAreas: "1 colony", losses: "₹0.3 Cr" }
        ],
        lastEventDate: "Jul 2023",
        averageRecoveryTime: "2-3 days",
        preparednessScore: 65,
        preparednessLevel: "high",
        causes: [
            "Aging infrastructure",
            "Heavy traffic congestion in flood zones"
        ]
    },    {
        id: 3,
        name: "South Delhi",
        zone: "South Zone",
        coords: [28.5244, 77.1855],
        elevation: 220,
        drainageQuality: "Good",
        baseRisk: 0.25,
        historicalFrequency: 3,
        hotspots: [
            "Lodi Road",
            "Greater Kailash 1",
            "Greater Kailash 2",
            "Moolchand Hospital",
            "AIIMS Hospital",
            "National Stadium",
            "Ambedkar Stadium",
            "Safdarjung Hospital",
            "Panchsheel",
            "Defence Colony",
            "Mahipalpur Road",
            "Vasant Kunj"
        ],
        historicalEvents: [
            { year: 2022, severity: "Low", affectedAreas: "1 colony", losses: "₹0.2 Cr" },
            { year: 2023, severity: "Low", affectedAreas: "0-1 colonies", losses: "Minimal" }
        ],
        lastEventDate: "Aug 2022",
        averageRecoveryTime: "1-2 days",
        preparednessScore: 75,
        preparednessLevel: "high",
        causes: [
            "Elevated terrain reduces flooding",
            "Better maintained drainage systems"
        ]
    },    {
        id: 4,
        name: "East Delhi",
        zone: "East Zone",
        coords: [28.5921, 77.3092],
        elevation: 195,
        drainageQuality: "Poor",
        baseRisk: 0.55,
        historicalFrequency: 12,
        hotspots: [
            "Mathura Road",
            "Kalindi Kunj Road",
            "Sangam Vihar",
            "Jangpura",
            "Nizamuddin Flyover",
            "Outer Ring Road"
        ],
        historicalEvents: [
            { year: 2020, severity: "Severe", affectedAreas: "8 colonies", losses: "₹5.8 Cr" },
            { year: 2021, severity: "High", affectedAreas: "6 colonies", losses: "₹4.2 Cr" },
            { year: 2022, severity: "High", affectedAreas: "5 colonies", losses: "₹3.5 Cr" },
            { year: 2023, severity: "Very High", affectedAreas: "9 colonies", losses: "₹6.5 Cr" }
        ],
        lastEventDate: "Sep 2023",
        averageRecoveryTime: "10-15 days",
        preparednessScore: 45,
        preparednessLevel: "low",
        causes: [
            "Low-lying areas near Yamuna floodplain",
            "Proximity to river increases flood risk",
            "Inadequate pumping stations"
        ]
    },    {
        id: 5,
        name: "West Delhi",
        zone: "West Zone",
        coords: [28.6505, 77.0808],
        elevation: 215,
        drainageQuality: "Moderate",
        baseRisk: 0.40,
        historicalFrequency: 7,
        hotspots: [
            "Modi Flyover",
            "Escorts Hospital",
            "Ring Road"
        ],
        historicalEvents: [
            { year: 2021, severity: "Medium", affectedAreas: "2 colonies", losses: "₹1.1 Cr" },
            { year: 2022, severity: "Low", affectedAreas: "1 colony", losses: "₹0.5 Cr" },
            { year: 2023, severity: "Medium", affectedAreas: "3 colonies", losses: "₹1.8 Cr" }
        ],
        lastEventDate: "Aug 2023",
        averageRecoveryTime: "4-5 days",
        preparednessScore: 60,
        preparednessLevel: "medium",
        causes: [
            "Active construction sites block drains",
            "Temporary drainage blockages common"
        ]
    },    {
        id: 6,
        name: "Northeast Delhi",
        zone: "Northeast Zone",
        coords: [28.7041, 77.3194],
        elevation: 225,
        drainageQuality: "Moderate",
        baseRisk: 0.30,
        historicalFrequency: 4,
        hotspots: [
            "Jamia Millia Islamia University"
        ],
        historicalEvents: [
            { year: 2022, severity: "Low", affectedAreas: "1 colony", losses: "₹0.4 Cr" },
            { year: 2023, severity: "Low", affectedAreas: "1 colony", losses: "₹0.3 Cr" }
        ],
        lastEventDate: "Jul 2023",
        averageRecoveryTime: "2-3 days",
        preparednessScore: 70,
        preparednessLevel: "high",
        causes: [
            "Better elevation reduces water accumulation",
            "Improved drainage infrastructure"
        ]
    }
];

// ====================================
// RISK CALCULATION FUNCTIONS
// ====================================

/**
 * Calculate risk level based on rainfall intensity
 * Risk Score = baseRisk × (1 + rainfall/100)
 */
function calculateRisk(ward, rainfall) {
  const riskScore = ward.baseRisk * (1 + rainfall / 100);
  
  if (riskScore >= 0.6) return { level: "high", score: riskScore };
  if (riskScore >= 0.3) return { level: "medium", score: riskScore };
  return { level: "low", score: riskScore };
}

/**
 * Get color for risk level
 */
function getRiskColor(riskLevel) {
  const colors = {
    high: "#d32f2f",
    medium: "#f57c00",
    low: "#388e3c",
  };
  return colors[riskLevel] || "#999";
}

/**
 * Get preparedness score (inverse of risk)
 */
function getPreparednessScore(riskScore) {
  return Math.max(0, Math.min(100, Math.round((1 - riskScore) * 100)));
}

/**
 * Get preparedness level
 */
function getPreparednessLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Update all ward risks based on rainfall
 */
function updateAllWardRisks(rainfall) {
  WARDS_DATA.forEach((ward) => {
    const riskData = calculateRisk(ward, rainfall);
    ward.currentRisk = riskData.level;
    ward.riskScore = riskData.score;
    ward.preparednessScore = getPreparednessScore(riskData.score);
    ward.preparednessLevel = getPreparednessLevel(ward.preparednessScore);
  });
}

/**
 * Get risk distribution summary
 */
function getRiskDistribution() {
  const distribution = {
    high: 0,
    medium: 0,
    low: 0,
  };
  
  WARDS_DATA.forEach((ward) => {
    distribution[ward.currentRisk]++;
  });
  
  return distribution;
}

/**
 * Initialize ward risks (call once on page load)
 */
function initializeWards(rainfall = 0) {
  updateAllWardRisks(rainfall);
}

// Export for use in script.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    WARDS_DATA,
    DELHI_CENTER,
    LEAFLET_MAP_ZOOM,
    calculateRisk,
    getRiskColor,
    getPreparednessScore,
    getPreparednessLevel,
    updateAllWardRisks,
    getRiskDistribution,
    initializeWards,
  };
}
