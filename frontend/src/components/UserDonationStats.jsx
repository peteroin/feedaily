import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import CertificateGenerator from "./CertificateGenerator";

const BADGE_LEVELS = [
  { minKg: 1, label: "Starter", color: "#7f8c8d", img: "💧", description: "Donated your first kg!" },
  { minKg: 5, label: "Bronze Donor", color: "#cd7f32", img: "🥉", description: "Donated at least 5 kg" },
  { minKg: 10, label: "Silver Donor", color: "#aaa", img: "🥈", description: "Donated at least 10 kg" },
  { minKg: 20, label: "Gold Donor", color: "#ffd700", img: "🥇", description: "Donated at least 20 kg" },
  { minKg: 40, label: "Platinum Donor", color: "#62a9e5", img: "🏅", description: "Donated at least 40 kg" },
  { minKg: 75, label: "Super Sharer", color: "#7d5cf5", img: "🚀", description: "Donated at least 75 kg" },
  { minKg: 150, label: "Mega Giver", color: "#00b894", img: "🌟", description: "Donated at least 150 kg!" },
  { minKg: 300, label: "Community Hero", color: "#e17055", img: "🏆", description: "Donated at least 300 kg!" },
];

const SWAG_ITEMS = [
  { badgeLabel: "Bronze Donor", name: "Bronze Pin", icon: "📌", redeemable: true },
  { badgeLabel: "Silver Donor", name: "Eco Sticker", icon: "🌱", redeemable: true },
  { badgeLabel: "Gold Donor", name: "Canvas Tote", icon: "👜", redeemable: true },
  { badgeLabel: "Platinum Donor", name: "Thank-You Card", icon: "✉️", redeemable: true },
  { badgeLabel: "Super Sharer", name: "Custom Badge", icon: "🎖️", redeemable: false },
  { badgeLabel: "Mega Giver", name: "Shoutout on Website", icon: "🔊", redeemable: false },
  { badgeLabel: "Community Hero", name: "VIP Invite", icon: "🎟️", redeemable: false },
];

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function UserDonationStats() {
  const [user, setUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [userReceived, setUserReceived] = useState([]);

  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemingSwag, setRedeemingSwag] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [redeemedSwags, setRedeemedSwags] = useState(() => {
    const stored = localStorage.getItem("redeemedSwags");
    return stored ? JSON.parse(stored) : {};
  });
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser) {
      fetch(`http://localhost:5000/api/donations?userId=${storedUser.id}`)
        .then((res) => res.json())
        .then((data) => setUserDonations(data || []));

      fetch(`http://localhost:5000/api/donations/requested?requesterId=${storedUser.id}`)
        .then((res) => res.json())
        .then((data) => setUserReceived(data || []));
    }
  }, []);

  const today = stripTime(new Date());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  let week = 0;
  let overall = 0;
  userDonations.forEach((d) => {
    if (!d.createdAt) return;
    const dt = stripTime(new Date(d.createdAt));
    const qty = Number(d.quantity) || 0;
    overall += qty;
    if (dt >= weekStart && dt <= today) week += qty;
  });

  let totalReceived = 0;
  userReceived.forEach((d) => {
    if (d.status === "Delivered") {
      totalReceived += Number(d.quantity) || 0;
    }
  });

  const totalData = [
    ["Type", "KG"],
    ["Current Week", week],
    ["Previous Weeks", overall - week > 0 ? overall - week : 0],
  ];

  const weekData = [
    ["Type", "KG"],
    ["Current Week", week],
    ["Rest of Week", Math.max(0, 7 - week)],
  ];

  const receivedData = [
    ["Type", "KG"],
    ["Delivered to You", totalReceived],
    ["Other", totalReceived > 0 ? 0 : 1],
  ];

  const unlockedBadges = BADGE_LEVELS.filter(
    (b) => overall >= b.minKg || totalReceived >= b.minKg
  );
  const lastAchievedIdx = unlockedBadges.length
    ? BADGE_LEVELS.findIndex(
        (b) => b.label === unlockedBadges[unlockedBadges.length - 1].label
      )
    : -1;
  const nextBadge = BADGE_LEVELS.find(
    (b) => overall < b.minKg && totalReceived < b.minKg
  );
  const donated = Math.max(overall, totalReceived);
  const toNext = nextBadge ? Math.max(0, nextBadge.minKg - donated) : 0;


  const handleRedeemClick = (swag) => {
    setRedeemingSwag(swag);
    setDeliveryAddress("");
    setShowRedeem(true);
  };

  const handleRedeemSubmit = (e) => {
    e.preventDefault();
    const newRedeemed = { ...redeemedSwags, [redeemingSwag.badgeLabel]: deliveryAddress };
    setRedeemedSwags(newRedeemed);
    localStorage.setItem("redeemedSwags", JSON.stringify(newRedeemed));
    setShowRedeem(false);
    setConfirmation({
      swag: redeemingSwag,
      address: deliveryAddress,
    });
    setRedeemingSwag(null);
    setDeliveryAddress("");
  };

  return (
    <div>
      {/* Donation Charts */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "28px",
          margin: "24px 0 10px 0",
        }}
      >
        {/* Total Donated */}
        <div>
          <h4 style={{ textAlign: "center", margin: "0 0 16px 0", fontWeight: "normal" }}>
            Total Donated
          </h4>
          <Chart
            chartType="PieChart"
            width="210px"
            height="165px"
            data={totalData}
            options={{
              pieHole: 0.45,
              pieSliceBorderWidth: 0,
              slices: { 0: { color: "#5636d3" }, 1: { color: "#28b363" } },
              chartArea: { width: "100%", height: "85%" },
              legend: { position: "none" },
              backgroundColor: "transparent",
              enableInteractivity: false,
              tooltip: { trigger: "none" },
            }}
          />
          <div
            style={{
              textAlign: "center",
              fontWeight: 500,
              color: "#5636d3",
              fontSize: "1.07rem",
              marginTop: "8px",
            }}
          >
            {overall.toFixed(2)} kg overall
          </div>
        </div>
        {/* Donated This Week */}
        <div>
          <h4 style={{ textAlign: "center", margin: "0 0 16px 0", fontWeight: "normal" }}>
            Donated This Week
          </h4>
          <Chart
            chartType="PieChart"
            width="210px"
            height="165px"
            data={weekData}
            options={{
              pieHole: 0.45,
              pieSliceBorderWidth: 0,
              slices: { 0: { color: "#ffb600" }, 1: { color: "#f5f5f5" } },
              chartArea: { width: "100%", height: "85%" },
              legend: { position: "none" },
              backgroundColor: "transparent",
              enableInteractivity: false,
              tooltip: { trigger: "none" },
            }}
          />
          <div
            style={{
              textAlign: "center",
              fontWeight: 500,
              color: "#ffb600",
              fontSize: "1.07rem",
              marginTop: "8px",
            }}
          >
            {week.toFixed(2)} kg this week
          </div>
        </div>
        {/* Total Received */}
        <div>
          <h4 style={{ textAlign: "center", margin: "0 0 16px 0", fontWeight: "normal" }}>
            Total Received (Delivered)
          </h4>
          <Chart
            chartType="PieChart"
            width="210px"
            height="165px"
            data={receivedData}
            options={{
              pieHole: 0.45,
              pieSliceBorderWidth: 0,
              slices: { 0: { color: "#4FB7DD" }, 1: { color: "#f5f5f5" } },
              chartArea: { width: "100%", height: "85%" },
              legend: { position: "none" },
              backgroundColor: "transparent",
              enableInteractivity: false,
              tooltip: { trigger: "none" },
            }}
          />
          <div
            style={{
              textAlign: "center",
              fontWeight: 500,
              color: "#4FB7DD",
              fontSize: "1.07rem",
              marginTop: "8px",
            }}
          >
            {totalReceived.toFixed(2)} kg received
          </div>
        </div>
      </div>
      {/* Achievements/Badges Section */}
      <div style={{ width: "100%", marginTop: 36, textAlign: "center" }}>
        <h3 style={{ fontWeight: 500, marginBottom: 16, color: "#5636d3" }}>
          {unlockedBadges.length === 0
            ? "Start Donating or Receiving to Earn Badges 🌱"
            : "🎉 Your Milestone Achievements"}
        </h3>
        {/* Badges Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 22,
            marginBottom: 16,
          }}
        >
          {BADGE_LEVELS.map((badge, idx) => {
            const isUnlocked = overall >= badge.minKg || totalReceived >= badge.minKg;
            return (
              <div
                key={badge.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {/* Medal (circle) */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    background: isUnlocked ? "#fff" : "#f4f4f4",
                    border: `3px solid ${badge.color}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    boxShadow: isUnlocked ? `0 2px 12px ${badge.color}33` : "none",
                    opacity: isUnlocked ? 1 : 0.44,
                    position: "relative",
                    transition: "opacity 0.2s",
                  }}
                  title={badge.description}
                >
                  <span>{badge.img}</span>
                  {/* Checkmark for achieved */}
                  {isUnlocked && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        fontSize: 16,
                        background: "#fff",
                        borderRadius: "50%",
                        border: `1.5px solid ${badge.color}`,
                        padding: "0 4.5px",
                        color: badge.color,
                        fontWeight: 700,
                        boxShadow: `0 1px 6px #0001`,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                {/* Badge label  */}
                <div
                  style={{
                    marginTop: 7,
                    fontWeight: isUnlocked ? 700 : 400,
                    color: isUnlocked ? badge.color : "#999",
                    fontSize: 13.8,
                    letterSpacing: 0.1,
                  }}
                >
                  {badge.label}
                </div>
                {/* Show description for last unlocked/next-to-unlock */}
                {isUnlocked && lastAchievedIdx === idx && (
                  <div style={{ color: badge.color, fontSize: 11.5, marginTop: 2 }}>
                    {badge.description}
                  </div>
                )}
                {!isUnlocked && nextBadge === badge && (
                  <div style={{ color: badge.color, fontSize: 11.5, marginTop: 2 }}>
                    {badge.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Swag Section */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h4 style={{ color: "#5636d3", marginBottom: 10 }}>🎁 Your Swag Rewards</h4>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {SWAG_ITEMS.map((swag) => {
              const unlocked = unlockedBadges.some((b) => b.label === swag.badgeLabel);
              const redeemed = !!redeemedSwags[swag.badgeLabel];
              return (
                <div
                  key={swag.name}
                  style={{
                    padding: "16px 14px",
                    borderRadius: 14,
                    border: `2.5px solid ${unlocked ? "#67b26f" : "#bbb"}`,
                    backgroundColor: unlocked ? "#dbf3d6" : "#fafafa",
                    color: unlocked ? "#2d6b28" : "#888",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 130,
                    fontWeight: "600",
                  }}
                  title={`${swag.name} (for ${swag.badgeLabel})`}
                >
                  <div style={{ fontSize: 38, marginBottom: 8 }}>{swag.icon}</div>
                  {swag.name}
                  {/* REDEEMABLE logic */}
                  {unlocked && swag.redeemable && !redeemed && (
                    <button
                      onClick={() => handleRedeemClick(swag)}
                      style={{
                        background: "#67b26f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontWeight: 700,
                        marginTop: 7,
                        fontSize: 14,
                      }}
                    >
                      Redeem
                    </button>
                  )}
                  {redeemed && swag.redeemable && (
                    <div style={{ color: "#259925", fontSize: 14, marginTop: 8 }}>Redeemed ✓</div>
                  )}
                  {unlocked && !swag.redeemable && (
                    <div style={{ color: "#2262b3", fontSize: 14, marginTop: 8 }}>Collectible ✓</div>
                  )}
                  {!unlocked && (
                    <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>Locked</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Redemption Modal */}
        {showRedeem && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.20)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 13,
                boxShadow: "0 4px 14px #0002",
                padding: 22,
                minWidth: 310,
                maxWidth: "95vw",
              }}
            >
              <h3 style={{ marginBottom: 10 }}>Redeem: {redeemingSwag?.name}</h3>
              <form onSubmit={handleRedeemSubmit}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Delivery Address:
                </label>
                <textarea
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    border: "1px solid #bbb",
                    marginBottom: 14,
                    padding: 8,
                    fontSize: 14,
                  }}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedeem(false);
                      setRedeemingSwag(null);
                    }}
                    style={{
                      background: "#eee",
                      color: "#333",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 14px",
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "#67b26f",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 18px",
                      fontWeight: 600,
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Confirmation */}
        {confirmation && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.07)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 13,
                boxShadow: "0 4px 14px #0002",
                padding: 26,
                minWidth: 308,
              }}
            >
              <h2 style={{ color: "#67b26f" }}>🎉 Swag Redeemed!</h2>
              <p style={{ marginTop: 9, marginBottom: 16 }}>
                <b>{confirmation.swag.name}</b> will be delivered to:
                <br />
                <span style={{ color: "#444" }}>{confirmation.address}</span>
              </p>
              <button
                onClick={() => setConfirmation(null)}
                style={{
                  background: "#67b26f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 18px",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
        {/* Progress Bar and Certificate */}
        {nextBadge && (
          <div
            style={{
              margin: "18px auto 0 auto",
              maxWidth: 350,
              background: "#f5f6ff",
              padding: "11px 18px",
              borderRadius: 13,
              color: "#7d5cf5",
              fontWeight: 500,
              fontSize: "1.01rem",
            }}
          >
            <span>
              <span style={{ fontWeight: 600 }}>{toNext.toFixed(2)} kg</span> to unlock{" "}
              <span style={{ color: nextBadge.color, fontWeight: 600 }}>{nextBadge.label}</span>!
            </span>
            <div
              style={{
                width: "88%",
                margin: "7px auto 0 auto",
                height: 8,
                borderRadius: 6,
                background: "#e7e5f9",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, ((donated / nextBadge.minKg) * 100))}%`,
                  background: nextBadge.color,
                  height: 8,
                  borderRadius: 6,
                  transition: "width .4s",
                }}
              />
            </div>
          </div>
        )}
        {unlockedBadges.length > 0 && (
          <CertificateGenerator
            user={user}
            overall={overall}
            totalReceived={totalReceived}
            unlockedBadges={unlockedBadges}
          />
        )}
      </div>
    </div>
  );
}

export default UserDonationStats;
