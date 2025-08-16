import React, { useState, useEffect } from "react";

export default function SenderRankingPage() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/sender-rankings')
      .then(res => res.json())
      .then(data => {
        setSenders(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="profile-container">
      <h2>Top Food Senders (Requested Donations)</h2>
      {loading ? (
        <p>Loading...</p>
      ) : senders.length === 0 ? (
        <p>No requested donations found.</p>
      ) : (
        <table className="ranking-table" style={{width: "100%", borderCollapse: "collapse", marginTop: "20px"}}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Total Sent (kg)</th>
            </tr>
          </thead>
          <tbody>
            {senders.map((s, idx) => (
              <tr key={s.id || idx}>
                <td>{idx + 1}</td>
                <td>{s.name}</td>
                <td>{s.contact}</td>
                <td>{s.email}</td>
                <td>{Number(s.totalSent).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
