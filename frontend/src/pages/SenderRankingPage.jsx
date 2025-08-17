import React, { useEffect, useState } from "react";
import UserDonationStats from "../components/UserDonationStats";

export default function SenderRankingPage() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [rankType, setRankType] = useState("weekly"); // "weekly" or "overall"

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const url = rankType === "weekly"
      ? "http://localhost:5000/api/sender-weekly-rankings"
      : "http://localhost:5000/api/sender-rankings";

    setLoading(true);
    fetch(url)
  .then(res => res.json())
  .then(data => {
    setSenders(data || []);
    setLoading(false);
    if (storedUser && data) {
      const index = data.findIndex((s) => s.id === storedUser.id);
      setUserRank(index !== -1 ? index + 1 : null);
    } else {
      setUserRank(null);
    }
  })
  .catch(error => {
    console.error("Fetch failed:", error);
    setSenders([]);
    setUserRank(null);
    setLoading(false);
  });
  }, [rankType]);

  return (
    <div className="profile-container" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginTop: 24 }}>
        Top Food Senders (
        {rankType === "weekly" ? "Weekly Global Top 20" : "All-Time Global Top 20"}
        )
      </h2>

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setRankType("weekly")}
          style={{
            marginRight: 12,
            background: rankType === "weekly" ? "#5724FF" : "#f3f3fa",
            color: rankType === "weekly" ? "#fff" : "#5724FF",
            padding: "8px 22px",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >Weekly</button>
        <button
          onClick={() => setRankType("overall")}
          style={{
            background: rankType === "overall" ? "#5724FF" : "#f3f3fa",
            color: rankType === "overall" ? "#fff" : "#5724FF",
            padding: "8px 22px",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >Overall</button>
      </div>

      <UserDonationStats period={rankType} />

      {user && (
        userRank ? (
          <div style={{ margin: "24px 0" }}>
            <strong>
              Your {rankType === "weekly" ? "Weekly" : "All-Time"} Rank:
            </strong>{" "}
            <span style={{ color: "#5724FF", fontSize: "1.2rem" }}>#{userRank}</span>
          </div>
        ) : (
          <div style={{ margin: "24px 0", color: "#ce3030" }}>
            You are not in the top 20 {rankType === "weekly" ? "weekly" : "all-time"} senders yet.
          </div>
        )
      )}

      {loading ? (
        <p>Loading...</p>
      ) : senders.length === 0 ? (
        <p>
          {rankType === "weekly"
            ? "No donations found this week."
            : "No requested donations found."}
        </p>
      ) : (
        <table
          className="ranking-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            border: "1px solid #eee",
            background: "#fafaff",
          }}
        >
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>
                {rankType === "weekly" ? "Sent This Week (kg)" : "Total Sent (kg)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {senders.map((s, idx) => (
              <tr
                key={s.id || idx}
                style={
                  user && s.id === user.id
                    ? { background: "#eeecff", fontWeight: "bold" }
                    : {}
                }
              >
                <td>{idx + 1}</td>
                <td>{s.name}</td>
                <td>{s.contact}</td>
                <td>{s.email}</td>
                <td>
                  {rankType === "weekly"
                    ? Number(s.weeklyTotalSent).toFixed(2)
                    : Number(s.totalSent).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
