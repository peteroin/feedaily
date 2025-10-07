import db from "./database.js";
import { calculateDistance } from "./geocodeHelper.js";

// Constants based on IPCC and environmental guidelines
const CONSTANTS = {
  EMISSION_FACTOR_BIKE: 0.021, // kg CO₂/km
  EMISSION_FACTOR_CAR: 0.18, // kg CO₂/km
  EMISSION_FACTOR_WALKING: 0, // kg CO₂/km
  CO2E_PER_KG_FOOD_WASTE: 4.3, // kg CO₂e/kg food waste avoided
  CH4_PER_KG_FOOD_WASTE: 0.06, // kg CH₄/kg food waste
  WATER_FOOTPRINT_PER_KG: 1500, // L/kg food
  ENERGY_PER_KG_FOOD: 7, // MJ/kg food
  EMAIL_EMISSION: 0.004, // kg CO₂/email
};

// Helper function to convert quantity string to kg
function parseQuantityToKg(quantity) {
  if (!quantity) return 0;

  const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return 1; // Default to 1kg if no number found

  const num = parseFloat(numMatch[1]);
  const lowerQuantity = quantity.toLowerCase();

  if (lowerQuantity.includes("g") && !lowerQuantity.includes("kg")) {
    return num / 1000; // Convert grams to kg
  } else if (lowerQuantity.includes("lb") || lowerQuantity.includes("pound")) {
    return num * 0.453592; // Convert pounds to kg
  } else if (
    lowerQuantity.includes("serving") ||
    lowerQuantity.includes("portion")
  ) {
    return num * 0.5; // Assume 0.5kg per serving
  }

  return num; // Assume kg if no unit specified
}

// 1. Transport Carbon Emission
export function calculateTransportEmission(
  donorLat,
  donorLng,
  receiverLat,
  receiverLng,
  deliveryMethod
) {
  if (!donorLat || !donorLng || !receiverLat || !receiverLng) return 0;

  const distance = calculateDistance(
    donorLat,
    donorLng,
    receiverLat,
    receiverLng
  );

  switch (deliveryMethod?.toLowerCase()) {
    case "bike":
    case "bicycle":
      return distance * CONSTANTS.EMISSION_FACTOR_BIKE;
    case "car":
    case "van":
    case "vehicle":
      return distance * CONSTANTS.EMISSION_FACTOR_CAR;
    case "walking":
    case "walk":
      return 0;
    default:
      return distance * CONSTANTS.EMISSION_FACTOR_CAR; // Default to car
  }
}

// 2. Food Waste Avoided (kg)
export function calculateFoodWasteAvoided() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT SUM(
        CASE 
          WHEN quantity IS NOT NULL THEN 1
          ELSE 0
        END
      ) as totalQuantity
      FROM donations 
      WHERE status = 'Delivered'
    `;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      // Get detailed quantities for better calculation
      const detailQuery = `
        SELECT quantity 
        FROM donations 
        WHERE status = 'Delivered' AND quantity IS NOT NULL
      `;

      db.all(detailQuery, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const totalKg = rows.reduce((sum, row) => {
          return sum + parseQuantityToKg(row.quantity);
        }, 0);

        resolve(totalKg);
      });
    });
  });
}

// 3. Carbon Emission Avoided (from saved food)
export async function calculateCarbonEmissionAvoided() {
  const foodSaved = await calculateFoodWasteAvoided();
  return foodSaved * CONSTANTS.CO2E_PER_KG_FOOD_WASTE;
}

// 4. Methane Emissions Avoided
export async function calculateMethaneEmissionsAvoided() {
  const foodSaved = await calculateFoodWasteAvoided();
  return foodSaved * CONSTANTS.CH4_PER_KG_FOOD_WASTE;
}

// 5. Water Saved
export async function calculateWaterSaved() {
  const foodSaved = await calculateFoodWasteAvoided();
  return foodSaved * CONSTANTS.WATER_FOOTPRINT_PER_KG;
}

// 6. Energy Saved
export async function calculateEnergySaved() {
  const foodSaved = await calculateFoodWasteAvoided();
  return foodSaved * CONSTANTS.ENERGY_PER_KG_FOOD;
}

// 7. Delivery Efficiency
export function calculateDeliveryEfficiency() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as totalDeliveries,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as deliveredCount
      FROM deliveries
    `;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const efficiency =
        row.totalDeliveries > 0
          ? (row.deliveredCount / row.totalDeliveries) * 100
          : 0;

      resolve(efficiency);
    });
  });
}

// 8. Food Expiry Rate
export function calculateFoodExpiryRate() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as totalRelevant,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expiredCount
      FROM donations 
      WHERE status IN ('Delivered', 'Expired')
    `;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const expiryRate =
        row.totalRelevant > 0
          ? (row.expiredCount / row.totalRelevant) * 100
          : 0;

      resolve(expiryRate);
    });
  });
}

// 9. Average Delivery Distance
export function calculateAverageDeliveryDistance() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT locationLat, locationLng, requesterLat, requesterLng
      FROM donations 
      WHERE locationLat IS NOT NULL 
        AND locationLng IS NOT NULL 
        AND requesterLat IS NOT NULL 
        AND requesterLng IS NOT NULL
        AND status = 'Delivered'
    `;

    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        resolve(0);
        return;
      }

      const totalDistance = rows.reduce((sum, row) => {
        return (
          sum +
          calculateDistance(
            row.locationLat,
            row.locationLng,
            row.requesterLat,
            row.requesterLng
          )
        );
      }, 0);

      resolve(totalDistance / rows.length);
    });
  });
}

// 10. Delivery Time Efficiency
export function calculateDeliveryTimeEfficiency() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        estimatedDeliveryDate,
        deliveredAt
      FROM deliveries 
      WHERE deliveredAt IS NOT NULL 
        AND estimatedDeliveryDate IS NOT NULL
        AND status = 'delivered'
    `;

    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        resolve(0);
        return;
      }

      const timeDiffs = rows.map((row) => {
        const estimated = new Date(row.estimatedDeliveryDate);
        const actual = new Date(row.deliveredAt);
        return Math.abs(actual - estimated) / (1000 * 60 * 60); // Hours
      });

      const avgTimeDiff =
        timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
      resolve(avgTimeDiff);
    });
  });
}

// 11. Community Sustainability Index
export function calculateCommunityIndex() {
  return new Promise((resolve, reject) => {
    const userQuery = `SELECT COUNT(*) as totalUsers FROM users`;
    const donorQuery = `SELECT COUNT(DISTINCT userId) as activeDonors FROM donations WHERE createdAt > date('now', '-30 days')`;
    const receiverQuery = `SELECT COUNT(DISTINCT requesterId) as activeReceivers FROM donations WHERE requestedAt > date('now', '-30 days')`;

    Promise.all([
      new Promise((res, rej) =>
        db.get(userQuery, (err, row) => (err ? rej(err) : res(row.totalUsers)))
      ),
      new Promise((res, rej) =>
        db.get(donorQuery, (err, row) =>
          err ? rej(err) : res(row.activeDonors)
        )
      ),
      new Promise((res, rej) =>
        db.get(receiverQuery, (err, row) =>
          err ? rej(err) : res(row.activeReceivers)
        )
      ),
    ])
      .then(([totalUsers, activeDonors, activeReceivers]) => {
        const index =
          totalUsers > 0
            ? ((activeDonors + activeReceivers) / totalUsers) * 100
            : 0;
        resolve(index);
      })
      .catch(reject);
  });
}

// 12. Digital Carbon Footprint (Email)
export function calculateDigitalCarbonFootprint() {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(emailSent) as totalEmails FROM donations WHERE emailSent > 0`;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const totalEmails = row.totalEmails || 0;
      resolve(totalEmails * CONSTANTS.EMAIL_EMISSION);
    });
  });
}

// 13. Waste Diversion Rate
export function calculateWasteDiversionRate() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired
      FROM donations 
      WHERE status IN ('Delivered', 'Expired')
    `;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      const total = (row.delivered || 0) + (row.expired || 0);
      const diversionRate =
        total > 0 ? ((row.delivered || 0) / total) * 100 : 0;

      resolve(diversionRate);
    });
  });
}

// 14. Locality Optimization Score
export async function calculateLocalityOptimizationScore() {
  const avgDistance = await calculateAverageDeliveryDistance();
  return avgDistance > 0 ? 1 / (1 + avgDistance) : 1;
}

// 15. Freshness Efficiency
export function calculateFreshnessEfficiency() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT AVG(freshness) as avgFreshness
      FROM donations 
      WHERE status = 'Delivered' 
        AND freshness IS NOT NULL
    `;

    db.get(query, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row.avgFreshness || 0);
    });
  });
}

// Comprehensive impact report
export async function getComprehensiveImpactReport() {
  try {
    const [
      foodWasteAvoided,
      carbonAvoided,
      methaneAvoided,
      waterSaved,
      energySaved,
      deliveryEfficiency,
      expiryRate,
      avgDistance,
      timeEfficiency,
      communityIndex,
      digitalFootprint,
      diversionRate,
      localityScore,
      freshnessEfficiency,
    ] = await Promise.all([
      calculateFoodWasteAvoided(),
      calculateCarbonEmissionAvoided(),
      calculateMethaneEmissionsAvoided(),
      calculateWaterSaved(),
      calculateEnergySaved(),
      calculateDeliveryEfficiency(),
      calculateFoodExpiryRate(),
      calculateAverageDeliveryDistance(),
      calculateDeliveryTimeEfficiency(),
      calculateCommunityIndex(),
      calculateDigitalCarbonFootprint(),
      calculateWasteDiversionRate(),
      calculateLocalityOptimizationScore(),
      calculateFreshnessEfficiency(),
    ]);

    return {
      foodWaste: {
        wasteAvoided: foodWasteAvoided,
        unit: "kg",
      },
      carbonImpact: {
        emissionAvoided: carbonAvoided,
        digitalFootprint: digitalFootprint,
        netBenefit: carbonAvoided - digitalFootprint,
        unit: "kg CO₂e",
      },
      resourceSaving: {
        methaneAvoided: methaneAvoided,
        waterSaved: waterSaved,
        energySaved: energySaved,
        units: {
          methane: "kg CH₄",
          water: "L",
          energy: "MJ",
        },
      },
      efficiency: {
        delivery: deliveryEfficiency,
        freshness: freshnessEfficiency,
        timeEfficiency: timeEfficiency,
        localityScore: localityScore,
        unit: "%",
      },
      wasteManagement: {
        expiryRate: expiryRate,
        diversionRate: diversionRate,
        unit: "%",
      },
      community: {
        sustainabilityIndex: communityIndex,
        avgDeliveryDistance: avgDistance,
        units: {
          index: "%",
          distance: "km",
        },
      },
    };
  } catch (error) {
    throw new Error(`Error calculating impact report: ${error.message}`);
  }
}

// Get transport emissions for specific delivery
export async function getTransportEmissionsForDelivery(donationId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        d.locationLat, 
        d.locationLng, 
        d.requesterLat, 
        d.requesterLng, 
        d.deliveryMethod
      FROM donations d
      WHERE d.id = ?
    `;

    db.get(query, [donationId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        resolve(0);
        return;
      }

      const emission = calculateTransportEmission(
        row.locationLat,
        row.locationLng,
        row.requesterLat,
        row.requesterLng,
        row.deliveryMethod
      );

      resolve(emission);
    });
  });
}
