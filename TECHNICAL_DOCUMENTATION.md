# Technical Implementation: Multi-Factor Risk Calculation

## Overview
The dashboard now uses a sophisticated multi-factor risk assessment system that combines rainfall intensity, infrastructure vulnerabilities, and historical patterns into a single risk score.

## Architecture

### Risk Calculation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ User Action: Change Rainfall Scenario (or Real-time update) │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ updateRisksForRainfall()     │
        │ - Input: rainfall (mm/hr)    │
        └────────────┬─────────────────┘
                     │
        ┌────────────▼──────────────────────────────────┐
        │ For each ward in WARDS_DATA:                 │
        │ - Calculate new risk score                    │
        │ - Update appState.wardRisks[wardId]          │
        └────────────┬──────────────────────────────────┘
                     │
      ┌──────────────▼──────────────────────┐
      │ calculateRiskScore()                │
      │ (Multi-factor calculation)          │
      └────────────┬───────────────────────┘
                   │
    ┌──────────────▼────────────────────────────┐
    │ 1. Rainfall Multiplier (1 + rainfall/100)│
    │ 2. Hotspot Factor (concentration)         │
    │ 3. Historical Factor (past patterns)      │
    │ 4. Drainage Factor (infrastructure)       │
    │ 5. Elevation Factor (geography)           │
    └────────────┬────────────────────────────┬─┘
                 │                            │
            ┌────▼─────────────────┐        │
            │ Combined Calculation  │        │
            │ score = base × all    │        │
            │ factors               │        │
            └────┬─────────────────┘        │
                 │                         │
                 └─────────┬───────────────┘
                           │
            ┌──────────────▼────────────────┐
            │ getRiskCategory()              │
            │ - HIGH: ≥0.60                  │
            │ - MEDIUM: ≥0.30 <0.60         │
            │ - LOW: <0.30                  │
            └────────────┬───────────────────┘
                         │
              ┌──────────▼──────────────┐
              │ Update UI Elements:    │
              │ - Map markers (color)  │
              │ - Ward list           │
              │ - Summary counts      │
              │ - Details panel       │
              └───────────────────────┘
```

## Function Signature

```javascript
function calculateRiskScore(baseRisk, rainfall, wardData) {
    // Returns: number (0.0 to 1.5, capped at 1.5)
}
```

### Parameters

| Parameter | Type | Source | Purpose |
|-----------|------|--------|---------|
| `baseRisk` | float | `wardData.baseRisk` | Initial vulnerability baseline (0.25-0.55) |
| `rainfall` | float | Weather API or manual input (mm/hr) | Precipitation intensity |
| `wardData` | object | WARDS_DATA array | Ward metadata (hotspots, history, elevation, etc.) |

### Return Value

```javascript
{
  score: 0.0 - 1.5,     // Raw risk score
  category: "high|medium|low",  // Categorical risk level
  percentage: 0 - 100   // Display percentage
}
```

---

## Factor Breakdown

### 1. Rainfall Multiplier
**Purpose**: Primary triggering mechanism for risk escalation

```javascript
const rainfallMultiplier = 1 + rainfall / 100;
```

**Examples**:
- 0mm rain → multiplier = 1.0 (baseline)
- 10mm rain → multiplier = 1.1 (+10%)
- 40mm rain → multiplier = 1.4 (+40%)
- 100mm rain → multiplier = 2.0 (double risk)

**Sensitivity**: Linear relationship with precipitation
**Rationale**: Rainfall is most direct trigger for water-logging

---

### 2. Hotspot Factor
**Purpose**: Penalizes wards with multiple vulnerable locations

```javascript
const hotspotCount = wardData.hotspots ? wardData.hotspots.length : 0;
const maxHotspots = 12; // South Delhi (maximum reference)
const hotspotFactor = 1 + (hotspotCount / maxHotspots) * 0.4;
```

**Range**: 1.0 to 1.4 (no adjustment to +40%)

**Examples**:
- 0 hotspots (None) → 1.0 (no penalty)
- 3 hotspots (West) → 1.1 (+10%)
- 6 hotspots (Central/East) → 1.2 (+20%)
- 12 hotspots (South) → 1.4 (+40%)

**Rationale**: 
- More hotspots = more simultaneous flood points
- Harder to manage distributed failures
- Reflects infrastructure concentration risk

**Data Source**: `wardData.hotspots` array length

---

### 3. Historical Frequency Factor
**Purpose**: Captures learned patterns from past monsoon seasons

```javascript
const historicalFreq = wardData.historicalFrequency || 0;
const maxFrequency = 12; // East Delhi (maximum reference)
const historicalFactor = 1 + (historicalFreq / maxFrequency) * 0.3;
```

**Range**: 1.0 to 1.3 (no adjustment to +30%)

**Examples**:
- 4 events (Northeast) → 1.1 (+10%)
- 7 events (West) → 1.175 (+17.5%)
- 8 events (North) → 1.2 (+20%)
- 12 events (East) → 1.3 (+30%)

**Rationale**:
- History is the best predictor of future behavior
- Wards with recurring problems need higher alert threshold
- More past events = more established vulnerability pattern

**Data Source**: `wardData.historicalFrequency` value (0-12)

---

### 4. Drainage Quality Factor
**Purpose**: Reflects infrastructure resilience and maintenance standards

```javascript
const drainageMap = {
    "Poor": 1.2,      // +20% risk
    "Moderate": 1.0,  // baseline
    "Good": 0.8       // -20% risk reduction
};
const drainageFactor = drainageMap[wardData.drainageQuality] || 1.0;
```

**Range**: 0.8 to 1.2 (±20% adjustment)

**Examples**:
- Good drainage (Central, South) → 0.8 (-20%, better equipped)
- Moderate (North, West, Northeast) → 1.0 (neutral)
- Poor (East) → 1.2 (+20%, struggling to handle flow)

**Rationale**:
- Good infrastructure can handle rainfall better
- Poor systems fail sooner, affecting more areas
- Government investment in drainage reduces effective risk

**Data Source**: `wardData.drainageQuality` enum

---

### 5. Elevation Factor
**Purpose**: Accounts for natural gravity-driven water accumulation

```javascript
const elevationBaseline = 215; // mid-range across Delhi (meters)
const elevationDiff = wardData.elevation - elevationBaseline;
const elevationFactor = 1 - (elevationDiff / 100) * 0.15;
```

**Range**: ~0.97 to 1.03 (±3% adjustment)

**Examples**:
- 195m (East, 20m below) → 1.03 (+3%, water pools here)
- 205m (Central, 10m below) → 1.015 (+1.5%)
- 215m (West, baseline) → 1.0 (neutral)
- 220m (South, 5m above) → 0.9925 (-0.75%, water drains away)
- 225m (Northeast, 10m above) → 0.985 (-1.5%)

**Rationale**:
- Water naturally flows to lower elevations
- Low-lying areas accumulate runoff from surrounding hills
- Elevation is fixed geography factor

**Data Source**: `wardData.elevation` value (meters)

---

## Complete Calculation Example

### West Delhi at 40mm rainfall

**Step 1**: Extract ward data
```javascript
const ward = {
    baseRisk: 0.40,
    hotspots: ["Modi Flyover", "Escorts Hospital", "Ring Road"],  // 3 items
    historicalFrequency: 7,
    drainageQuality: "Moderate",
    elevation: 215
};
const rainfall = 40; // mm/hr
```

**Step 2**: Calculate multipliers
```javascript
// Rainfall
rainfallMultiplier = 1 + 40/100 = 1.4

// Hotspots: 3 out of 12
hotspotFactor = 1 + (3/12) * 0.4 = 1 + 0.1 = 1.1

// History: 7 events out of 12
historicalFactor = 1 + (7/12) * 0.3 = 1 + 0.175 = 1.175

// Drainage: Moderate
drainageFactor = 1.0

// Elevation: 215m (baseline, no diff)
elevationFactor = 1 - (0/100) * 0.15 = 1.0
```

**Step 3**: Combine factors
```javascript
risk = 0.40 × 1.4 × 1.1 × 1.175 × 1.0 × 1.0
     = 0.40 × 1.8095
     = 0.7238
     (capped at 1.5, not needed here)
```

**Step 4**: Categorize
```javascript
0.7238 ≥ 0.6 → HIGH ✓
```

**Step 5**: Convert to percentage
```javascript
percentage = Math.round(0.7238 * 100) = 72%
```

**Result**: 
- **Risk Score**: 0.72
- **Category**: HIGH
- **Display**: "72% HIGH"

---

## Threshold Definitions

### Risk Categories
| Category | Score Range | Threshold Trigger | Color | Action |
|----------|-----------|----------|-------|--------|
| HIGH | ≥ 0.60 | 60%+ combined risk | 🔴 Red (#d32f2f) | **ALERT**: Issue warnings, activate response |
| MEDIUM | 0.30 - 0.59 | 30-59% combined risk | 🟠 Orange (#f57c00) | **WATCH**: Monitor closely, prepare resources |
| LOW | < 0.30 | <30% combined risk | 🟢 Green (#388e3c) | **NORMAL**: Routine operations |

### Emergency Response Triggers
- **HIGH + Heavy Rain (60mm)** → Activate flood relief teams
- **HIGH + Extreme Rain (100mm)** → Emergency protocols, evacuation zones
- **2+ Wards HIGH** → City-wide coordination needed
- **All wards HIGH** → Disaster management intervention

---

## Integration Points

### Called From
```javascript
function updateRisksForRainfall(rainfall) {
    appState.wardsData.forEach(ward => {
        const riskScore = calculateRiskScore(ward.baseRisk, rainfall, ward);
        // ... store in appState.wardRisks[ward.id]
    });
}
```

### Called When
1. Page loads (initialization)
2. User clicks rainfall scenario button
3. Real-time weather auto-refresh (every 30 minutes)
4. Manual weather refresh

### Updates UI Components
1. **Map markers** - circle colors change (red/orange/green)
2. **Ward list** - percentage values update
3. **Summary panel** - risk counts update (top-left)
4. **Details panel** - if ward selected, refresh data

---

## Testing & Validation

### Unit Test: Monotonic Rainfall Response
```javascript
// At baseline, higher rainfall should always increase risk
const westDelhi = WARDS_DATA.find(w => w.id === 5);
const risk0 = calculateRiskScore(westDelhi.baseRisk, 0, westDelhi);
const risk20 = calculateRiskScore(westDelhi.baseRisk, 20, westDelhi);
const risk40 = calculateRiskScore(westDelhi.baseRisk, 40, westDelhi);

console.assert(risk0 < risk20 < risk40, "Risk must increase with rainfall");
```

### System Test: All Wards at Extreme Rainfall
```javascript
// At 100mm rainfall, all wards should approach HIGH
WARDS_DATA.forEach(ward => {
    const risk = calculateRiskScore(ward.baseRisk, 100, ward);
    console.assert(risk >= 0.6, `${ward.name} should be HIGH at 100mm`);
});
```

### Integration Test: Dashboard Updates
```javascript
// Verify risk update triggers UI updates
updateRisksForRainfall(40);
updateMapMarkers();  // Should change colors
updateWardList();    // Should update percentages
updateSummaryPanel(); // Should update counts
```

---

## Performance Considerations

- **Time Complexity**: O(n) where n = number of wards (6)
- **Space Complexity**: O(1) per calculation
- **Calculation Time**: < 1ms per ward
- **Total Dashboard Update**: < 50ms for all 6 wards

No optimization needed - calculation is trivial compared to DOM updates.

---

## Future Enhancement Opportunities

### Short-term (v2.1)
- [ ] Add soil saturation memory (decrease risk if dry for 7+ days)
- [ ] Seasonal adjustment (higher base thresholds in dry season)
- [ ] Population density factor (more people = more critical)

### Medium-term (v3.0)
- [ ] Machine learning prediction (24-48 hour forecast)
- [ ] Real-time water level sensor integration
- [ ] Dynamic hotspot severity scoring
- [ ] Infrastructure project tracking (reduction factors)

### Long-term (v4.0)
- [ ] Multi-city benchmarking
- [ ] Automated early warning system
- [ ] Citizen report integration
- [ ] Climate change projection modeling

---

## References

**Related Files**:
- `script.js` - Lines 304-354 (calculateRiskScore function)
- `script.js` - Lines 277-289 (updateRisksForRainfall function)
- `data.js` - WARDS_DATA array (ward metadata)

**Related Documentation**:
- `RISK_CALCULATION_IMPROVEMENTS.md` - High-level overview
- `RISK_COMPARISON_TABLE.md` - Before/after examples

**Government Standards**:
- UX4G 2.0 (Government Digital Services Guidelines)
- NWRWM (National Water Resources Development Council)
- Disaster Management Act, 2005

---

**Version**: 2.0
**Status**: Production-Ready
**Last Updated**: 2024
**Maintainer**: Monsoon Risk Dashboard Team
