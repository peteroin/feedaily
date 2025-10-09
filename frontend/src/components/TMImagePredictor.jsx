import React, { useRef, useEffect, useState } from "react";

// Assumes model files in /public/my_model/ for freshness and optional /public/my_model_food/ for food/not-food
const MODEL_URL = "/my_model/";
const FOOD_MODEL_URL = "/my_model_food/";

export default function TMImagePredictor({ imageSrc, onFoodCheck }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodCheck, setFoodCheck] = useState(null);
  const imgRef = useRef();

  // Predict whenever imageSrc changes
  useEffect(() => {
    setPredictions(null);
    if (imageSrc && imgRef.current) {
      imgRef.current.onload = () => loadAndPredict(imgRef.current);
      imgRef.current.src = imageSrc;
    }
    // eslint-disable-next-line
  }, [imageSrc]);

  const loadAndPredict = async (imgEl) => {
    setPredictions(null);
    setFoodCheck(null);
    // Ensure tmImage is available
    if (!window.tmImage) {
      await new Promise((resolve) => {
        const intv = setInterval(() => {
          if (window.tmImage && window.tmImage.load) {
            clearInterval(intv);
            resolve();
          }
        }, 100);
      });
    }

    // First: food/not-food pre-check if model exists
    let isFood = true;
    let foodConfidence = 1;
    try {
      setFoodLoading(true);
      if (typeof onFoodCheck === "function") onFoodCheck({ loading: true });

      const headResp = await fetch(FOOD_MODEL_URL + "model.json", { method: "HEAD" });
      if (headResp && headResp.ok) {
        const foodModel = await window.tmImage.load(
          FOOD_MODEL_URL + "model.json",
          FOOD_MODEL_URL + "metadata.json"
        );
        const foodResult = await foodModel.predict(imgEl, false);
        const top = foodResult.sort((a, b) => b.probability - a.probability)[0];
        const label = (top?.className || "").toLowerCase();
        const negativeHints = ["not", "non", "no ", "non-food", "not_food", "non food"];
        const isNegative = negativeHints.some((h) => label.includes(h));
        const positive = label.includes("food") && !isNegative;
        isFood = positive && !isNegative;
        foodConfidence = typeof top?.probability === "number" ? top.probability : 0;
        setFoodCheck({ isFood, confidence: foodConfidence, labels: foodResult });
        if (typeof onFoodCheck === "function") onFoodCheck({ loading: false, done: true, isFood, confidence: foodConfidence });
      } else {
        // No food model present, treat as food to preserve previous behavior
        isFood = true;
        foodConfidence = 1;
        setFoodCheck({ isFood: true, confidence: 1, labels: null, skipped: true });
        if (typeof onFoodCheck === "function") onFoodCheck({ loading: false, done: true, isFood: true, confidence: 1, skipped: true });
      }
    } catch (e) {
      // On any error, allow flow but indicate skipped
      isFood = true;
      foodConfidence = 1;
      setFoodCheck({ isFood: true, confidence: 1, error: true });
      if (typeof onFoodCheck === "function") onFoodCheck({ loading: false, done: true, isFood: true, confidence: 1, error: true });
    } finally {
      setFoodLoading(false);
    }

    // Second: run freshness model only if it is food
    if (isFood) {
      setLoading(true);
      const model = await window.tmImage.load(
        MODEL_URL + "model.json",
        MODEL_URL + "metadata.json"
      );
      const result = await model.predict(imgEl, false);
      setLoading(false);
      setPredictions(result);
    } else {
      setPredictions(null);
    }
  };

  // If no image, render nothing at all
  if (!imageSrc) return null;

  return (
    <div style={{ margin: "20px auto 10px auto", maxWidth: "340px" }}>
      {/* Hidden image, only for prediction */}
      <img ref={imgRef} src={imageSrc} alt="" style={{ display: "none" }} />

      {foodLoading && (
        <div className="text-blue-700 font-semibold mt-3">Checking if image is food...</div>
      )}

      {foodCheck && foodCheck.isFood === false && (
        <div className="ai-result-box" style={{
          background: "#fff4f4",
          border: "1px solid #ffd1d1",
          borderRadius: 12,
          padding: "12px 10px",
          boxShadow: "0 2px 18px #ffd7d7cc",
          fontSize: "1.02em",
          color: "#a12626",
          fontWeight: 600
        }}>
          This image doesn't look like food. Please retake a clearer food photo.
        </div>
      )}

      {loading && (
        <div className="text-blue-700 font-semibold mt-3">Analyzing freshness...</div>
      )}

      {predictions && (
        <div className="ai-result-box" style={{
          background: "#ecfff7",
          border: "1px solid #bbefd2",
          borderRadius: 12,
          padding: "16px 8px",
          boxShadow: "0 2px 18px #c4ede5cc",
          fontSize: "1.08em"
        }}>
          <div className="font-bold mb-2" style={{ color: "#087a52" }}>
            Food Freshness Prediction
          </div>
          {predictions
            .sort((a, b) => b.probability - a.probability)
            .map((p) => (
              <div
                key={p.className}
                className="result-predict"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontWeight: 600
                }}
              >
                <span>{p.className}</span>
                <span>{(p.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
