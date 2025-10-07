import express from "express";
import {
  calculateAverageDeliveryDistance,
  calculateCarbonEmissionAvoided,
  calculateCommunityIndex,
  calculateDeliveryEfficiency,
  calculateDeliveryTimeEfficiency,
  calculateDigitalCarbonFootprint,
  calculateEnergySaved,
  calculateFoodExpiryRate,
  calculateFoodWasteAvoided,
  calculateFreshnessEfficiency,
  calculateLocalityOptimizationScore,
  calculateMethaneEmissionsAvoided,
  calculateWasteDiversionRate,
  calculateWaterSaved,
  getComprehensiveImpactReport,
} from "./impactCalculations.js";

const router = express.Router();

// Available metrics mapping for selective queries
const AVAILABLE_METRICS = {
  foodWasteAvoided: calculateFoodWasteAvoided,
  carbonEmissionAvoided: calculateCarbonEmissionAvoided,
  methaneEmissionsAvoided: calculateMethaneEmissionsAvoided,
  waterSaved: calculateWaterSaved,
  energySaved: calculateEnergySaved,
  deliveryEfficiency: calculateDeliveryEfficiency,
  foodExpiryRate: calculateFoodExpiryRate,
  averageDeliveryDistance: calculateAverageDeliveryDistance,
  deliveryTimeEfficiency: calculateDeliveryTimeEfficiency,
  communityIndex: calculateCommunityIndex,
  digitalCarbonFootprint: calculateDigitalCarbonFootprint,
  wasteDiversionRate: calculateWasteDiversionRate,
  localityOptimizationScore: calculateLocalityOptimizationScore,
  freshnessEfficiency: calculateFreshnessEfficiency,
};

// Main environmental impact endpoint
// GET /api/environmental-impact
// Query parameters:
// - fields: comma-separated list of specific metrics (optional)
// - format: 'detailed' for comprehensive report structure, 'simple' for flat values (default: 'detailed')
//
// Examples:
// GET /api/environmental-impact (returns all metrics in detailed format)
// GET /api/environmental-impact?fields=foodWasteAvoided,carbonEmissionAvoided
// GET /api/environmental-impact?fields=deliveryEfficiency&format=simple
router.get("/environmental-impact", async (req, res) => {
  try {
    const { fields, format = "detailed" } = req.query;

    // If no specific fields requested, return comprehensive report
    if (!fields) {
      const comprehensiveReport = await getComprehensiveImpactReport();
      return res.json({
        success: true,
        message: "Comprehensive environmental impact report",
        data: comprehensiveReport,
        timestamp: new Date().toISOString(),
        metrics_count: 15,
      });
    }

    // Parse requested fields
    const requestedFields = fields
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);
    const invalidFields = requestedFields.filter(
      (field) => !AVAILABLE_METRICS[field]
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid field(s) requested",
        invalid_fields: invalidFields,
        available_fields: Object.keys(AVAILABLE_METRICS),
        example:
          "/api/environmental-impact?fields=foodWasteAvoided,carbonEmissionAvoided",
      });
    }

    // Calculate requested metrics
    const results = {};
    const calculations = [];

    for (const field of requestedFields) {
      calculations.push(
        AVAILABLE_METRICS[field]().then((value) => ({ field, value }))
      );
    }

    const calculatedValues = await Promise.all(calculations);

    // Build response based on format
    if (format === "simple") {
      // Simple format: flat key-value pairs
      calculatedValues.forEach(({ field, value }) => {
        results[field] = value;
      });

      return res.json({
        success: true,
        message: `Selected environmental metrics (${requestedFields.length} fields)`,
        data: results,
        timestamp: new Date().toISOString(),
        format: "simple",
      });
    } else {
      // Detailed format: organized with units and metadata
      calculatedValues.forEach(({ field, value }) => {
        results[field] = {
          value: value,
          unit: getUnitForMetric(field),
          description: getDescriptionForMetric(field),
          calculation_time: new Date().toISOString(),
        };
      });

      return res.json({
        success: true,
        message: `Selected environmental metrics (${requestedFields.length} fields)`,
        data: results,
        timestamp: new Date().toISOString(),
        format: "detailed",
        requested_fields: requestedFields,
      });
    }
  } catch (error) {
    console.error("Environmental impact calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating environmental impact metrics",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Helper functions for metric metadata
function getUnitForMetric(metric) {
  const units = {
    foodWasteAvoided: "kg",
    carbonEmissionAvoided: "kg CO₂e",
    methaneEmissionsAvoided: "kg CH₄",
    waterSaved: "L",
    energySaved: "MJ",
    deliveryEfficiency: "%",
    foodExpiryRate: "%",
    averageDeliveryDistance: "km",
    deliveryTimeEfficiency: "hours",
    communityIndex: "%",
    digitalCarbonFootprint: "kg CO₂",
    wasteDiversionRate: "%",
    localityOptimizationScore: "score (0-1)",
    freshnessEfficiency: "average rating",
  };
  return units[metric] || "unit";
}

function getDescriptionForMetric(metric) {
  const descriptions = {
    foodWasteAvoided: "Total weight of food saved from going to waste",
    carbonEmissionAvoided:
      "CO₂ equivalent emissions prevented by food redistribution",
    methaneEmissionsAvoided:
      "Methane emissions avoided from food waste decomposition",
    waterSaved: "Water footprint saved by preventing food waste",
    energySaved: "Energy conserved by not producing replacement food",
    deliveryEfficiency: "Percentage of successful deliveries",
    foodExpiryRate: "Percentage of donated food that expires before delivery",
    averageDeliveryDistance: "Average distance between donors and receivers",
    deliveryTimeEfficiency:
      "Average difference between estimated and actual delivery time",
    communityIndex: "Community engagement level in food redistribution",
    digitalCarbonFootprint: "CO₂ emissions from digital notifications (emails)",
    wasteDiversionRate: "Success rate in preventing food from going to waste",
    localityOptimizationScore: "Efficiency score based on delivery proximity",
    freshnessEfficiency:
      "Average freshness rating of successfully delivered food",
  };
  return descriptions[metric] || "Environmental impact metric";
}

export default router;
