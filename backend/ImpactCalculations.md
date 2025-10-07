# 🌱 Environmental Impact Calculations Module

This module provides comprehensive environmental impact tracking for the Feedaily food redistribution platform. It calculates various sustainability metrics based on food donations, deliveries, and community engagement data.

## 📊 Overview

The impact calculations module measures 15 different environmental and efficiency metrics to provide a complete picture of the platform's positive environmental impact. All calculations are based on scientific standards from IPCC, WRAP, FAO, and other authoritative environmental organizations.

## 🌍 Impact Categories

### Carbon & Emissions
- **Transport Carbon Emission**: CO₂ emitted during delivery
- **Carbon Emission Avoided**: Greenhouse gases prevented by food redistribution
- **Methane Emissions Avoided**: CH₄ prevented from food waste decomposition
- **Digital Carbon Footprint**: Emissions from email notifications

### Resource Conservation
- **Food Waste Avoided**: Quantity of food saved from disposal
- **Water Saved**: Water footprint avoided
- **Energy Saved**: Energy conservation from prevented food production

### Efficiency Metrics
- **Delivery Efficiency**: Success rate of deliveries
- **Delivery Time Efficiency**: Actual vs estimated delivery time
- **Freshness Efficiency**: Average freshness of delivered food
- **Locality Optimization**: Proximity optimization score

### Community & Waste Management
- **Community Sustainability Index**: Community engagement level
- **Food Expiry Rate**: Percentage of food that expires
- **Waste Diversion Rate**: Success in preventing waste
- **Average Delivery Distance**: Geographic efficiency metric

## 📋 Detailed Impact Mapping

| Impact Type | Description | Formula / Estimation Logic | Data Source |
|-------------|-------------|----------------------------|-------------|
| **1. Transport Carbon Emission** | CO₂ emitted during delivery based on distance and transport type | `Emission = Distance (km) × Emission_Factor`<br/>• Bike: 0.021 kg CO₂/km<br/>• Car/Van: 0.18 kg CO₂/km<br/>• Walking: 0 kg CO₂/km | `deliveries` + `donations` (coordinates, deliveryMethod) |
| **2. Food Waste Avoided (kg)** | Measures food saved from disposal (reducing methane and CO₂) | `Food_Saved = Σ(quantity of delivered donations)` | `donations` (quantity, status = 'Delivered') |
| **3. Carbon Emission Avoided** | Estimates greenhouse gases prevented by redistributing food | `CO₂_Avoided = Food_Saved × 4.3`<br/>(1 kg food waste → ~4.3 kg CO₂e) | Derived from Food Waste Avoided |
| **4. Methane Emissions Avoided** | Avoided methane release from decomposing food waste | `CH₄_Avoided = Food_Saved × 0.06 kg CH₄/kg food` | Derived from Food Waste Avoided |
| **5. Water Saved** | Water footprint avoided by preventing food waste | `Water_Saved = Food_Saved × 1500 L`<br/>(average 1.5 m³ water/kg food) | Derived from Food Waste Avoided |
| **6. Energy Saved** | Energy saved by not producing replacement food | `Energy_Saved = Food_Saved × 7 MJ/kg` | Derived from Food Waste Avoided |
| **7. Delivery Efficiency** | Evaluates delivery success rate | `Efficiency = Delivered_Count / Total_Deliveries × 100` | `deliveries` (status, deliveredAt) |
| **8. Food Expiry Rate** | Shows % of food that expires before being used | `Expiry_Rate = Expired_Count / (Delivered + Expired) × 100` | `donations` (status = 'Expired' or 'Delivered') |
| **9. Average Delivery Distance** | Average transport distance → proxy for emission optimization | `AVG_Distance = mean(haversine(donorLat, donorLng, requesterLat, requesterLng))` | `donations` (locationLat, locationLng, requesterLat, requesterLng) |
| **10. Delivery Time Efficiency** | Measures delivery time accuracy | `Time_Diff = AVG(deliveredAt - estimatedDeliveryDate)` | `deliveries` (deliveredAt, estimatedDeliveryDate) |
| **11. Community Sustainability Index** | Community engagement in reducing food waste | `Index = (Active_Donors + Active_Receivers) / Total_Users × 100` | `users`, `donations` (userId, requesterId) |
| **12. Digital Carbon Footprint** | Tracks emissions from notification emails | `Digital_CO₂ = Email_Count × 0.004 kg CO₂` | `donations` (emailSent) |
| **13. Waste Diversion Rate** | Fraction of total food prevented from going to waste | `Waste_Diversion = Delivered / (Delivered + Expired) × 100` | `donations` (status) |
| **14. Locality Optimization Score** | Measures proximity optimization (lower distance = better) | `Score = 1 / (1 + AVG_Distance)` | Derived from Average Delivery Distance |
| **15. Freshness Efficiency** | Average freshness score across successful donations | `Efficiency = AVG(freshness WHERE status='Delivered')` | `donations` (freshness, status) |

## ⚙️ Constants and Sources

| Constant | Value | Unit | Source |
|----------|-------|------|---------|
| **Emission Factor - Bike** | 0.021 | kg CO₂/km | IPCC Transport Guidelines |
| **Emission Factor - Car/Van** | 0.18 | kg CO₂/km | IPCC 2019 |
| **CO₂e from Food Waste** | 4.3 | kg CO₂e/kg | WRAP (UK) |
| **CH₄ from Food Waste** | 0.06 | kg CH₄/kg | FAO |
| **Water Footprint** | 1500 | L/kg food | Water Footprint Network |
| **Energy Content** | 7 | MJ/kg food | UNEP Estimates |
| **Email Emission** | 0.004 | kg CO₂/email | BBC Earth Data |

## 🔍 Example Calculations

### Scenario 1: Bike Delivery
```
Distance: 5 km
Delivery Method: bike
Transport Emission = 5 × 0.021 = 0.105 kg CO₂
```

### Scenario 2: Food Saved
```
Food Quantity: 2 kg
Carbon Avoided = 2 × 4.3 = 8.6 kg CO₂e
Water Saved = 2 × 1500 = 3000 L
Methane Avoided = 2 × 0.06 = 0.12 kg CH₄
Energy Saved = 2 × 7 = 14 MJ
```

### Scenario 3: Net Environmental Benefit
```
Carbon Avoided: 8.6 kg CO₂e
Transport Emission: 0.105 kg CO₂
Net Benefit = 8.6 - 0.105 = 8.495 kg CO₂e saved
```
**🌍 Result: Positive Environmental Impact!**

## 🚀 Usage

### Import the Module
```javascript
import {
  calculateTransportEmission,
  calculateFoodWasteAvoided,
  getComprehensiveImpactReport,
  getTransportEmissionsForDelivery
} from './impactCalculations.js';
```

### Get Comprehensive Impact Report
```javascript
try {
  const impactReport = await getComprehensiveImpactReport();
  console.log('Environmental Impact:', impactReport);
} catch (error) {
  console.error('Error calculating impact:', error);
}
```

### Calculate Specific Metrics
```javascript
// Transport emissions for a delivery
const emission = calculateTransportEmission(
  donorLat, donorLng, 
  receiverLat, receiverLng, 
  'bike'
);

// Food waste avoided
const wasteAvoided = await calculateFoodWasteAvoided();

// Transport emissions for specific donation
const deliveryEmission = await getTransportEmissionsForDelivery(donationId);
```

## 📊 Report Structure

The comprehensive impact report returns data in the following structure:

```javascript
{
  foodWaste: {
    wasteAvoided: 15.5,  // kg
    unit: 'kg'
  },
  carbonImpact: {
    emissionAvoided: 66.65,    // kg CO₂e
    digitalFootprint: 0.024,   // kg CO₂e
    netBenefit: 66.626,        // kg CO₂e
    unit: 'kg CO₂e'
  },
  resourceSaving: {
    methaneAvoided: 0.93,      // kg CH₄
    waterSaved: 23250,         // L
    energySaved: 108.5,        // MJ
    units: {
      methane: 'kg CH₄',
      water: 'L',
      energy: 'MJ'
    }
  },
  efficiency: {
    delivery: 87.5,            // %
    freshness: 8.2,            // Average score
    timeEfficiency: 2.3,       // Hours difference
    localityScore: 0.82,       // Optimization score
    unit: '%'
  },
  wasteManagement: {
    expiryRate: 12.5,          // %
    diversionRate: 87.5,       // %
    unit: '%'
  },
  community: {
    sustainabilityIndex: 45.2, // %
    avgDeliveryDistance: 3.8,  // km
    units: {
      index: '%',
      distance: 'km'
    }
  }
}
```