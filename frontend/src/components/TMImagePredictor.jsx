import React, { useRef, useEffect, useState } from "react";

// Assumes model files in /public/my_model/
const MODEL_URL = "/my_model/";

export default function TMImagePredictor({ imageSrc }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setPredictions(null);
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
    const model = await window.tmImage.load(
      MODEL_URL + "model.json",
      MODEL_URL + "metadata.json"
    );
    const result = await model.predict(imgEl, false);
    setLoading(false);
    setPredictions(result);
  };

  // If no image, render nothing at all
  if (!imageSrc) return null;

  return (
    <div style={{ margin: "20px auto 10px auto", maxWidth: "340px" }}>
      {/* Hidden image, only for prediction */}
      <img ref={imgRef} src={imageSrc} alt="" style={{ display: "none" }} />
      {loading && (
        <div className="text-blue-700 font-semibold mt-3">Analyzing...</div>
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
