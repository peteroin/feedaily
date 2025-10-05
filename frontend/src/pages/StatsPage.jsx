import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiDownload, FiPackage, FiUsers, FiTrendingUp } from "react-icons/fi";
import './StatsPage.css';

export default function StatsPage() {
  const [dailyData, setDailyData] = useState([["Date", "People Fed", "Capacity to Feed"]]);
  const [dailyDonations, setDailyDonations] = useState([["Date", "Donations (kg)"]]);
  const [stats, setStats] = useState({ totalDonated: 0, totalTaken: 0, totalPeopleFed: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch daily stats
  useEffect(() => {
    fetch('http://localhost:5000/api/daily-donation-stats')
      .then(res => res.json())
      .then(data => {
        console.log('Raw API response:', data);
     

      // Normalize rows
      const rows = data.data ? data.data.slice(1) : data.slice(1);

      const peopleData = [["Date", "People Fed", "Capacity to Feed"]];
      const donationsData = [["Date", "Donations (kg)"]];

      rows.forEach(row => {
        // row[0] is like "2025-10-05"
        const [year, month, day] = row[0].split("-").map(Number);
        const date = new Date(year, month - 1, day); // ✅ Date object
        if (isNaN(date.getTime())) return; // skip invalid date

        const donated = Number(row[1]) || 0;
        const taken = Number(row[2]) || 0;
        const MEAL_KG = 0.4;

        const peopleFed =
          taken > 0 ? Math.floor(taken / MEAL_KG) : Math.floor(donated / MEAL_KG);
        const capacity = Math.floor(donated / MEAL_KG);

        peopleData.push([date, peopleFed, capacity]);
        donationsData.push([date, donated]);
      });
        // Ensure always 7 days are shown (even if no donations)
const today = new Date();
for (let i = 6; i >= 0; i--) {
  const day = new Date(today);
  day.setDate(today.getDate() - i);

  // check if this date already exists
  const exists = donationsData.find(
    r => r[0] instanceof Date && r[0].toDateString() === day.toDateString()
  );

  if (!exists) {
    donationsData.push([day, 0]);
    peopleData.push([day, 0, 0]);
  }
}

// sort by date
donationsData.sort((a, b) => new Date(a[0]) - new Date(b[0]));
peopleData.sort((a, b) => new Date(a[0]) - new Date(b[0]));

        setDailyData(peopleData);
        setDailyDonations(donationsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching daily donation stats:", err);
        setLoading(false);
      });
  }, []);

  // Fetch summary stats
  useEffect(() => {
    fetch('http://localhost:5000/api/donation-stats')
      .then(res => res.json())
      .then(data => {
        console.log('Stats data:', data);
        
        const MEAL_KG = 0.4;
        const calculatedPeopleFed = Math.floor((data.totalTaken || 0) / MEAL_KG);
        
        setStats({
          ...data,
          totalPeopleFed: calculatedPeopleFed
        });
      })
      .catch(err => console.error("Error fetching global stats:", err));
  }, []);

  const pieData = [
    ["Type", "KG"],
    ["Total Donated", stats.totalDonated],
    ["Total Taken", stats.totalTaken],
  ];

  // Minimal Chart Options
  const columnOptions = {
    title: "",
    backgroundColor: 'transparent',
colors: ['#22C55E', '#3B82F6'],
    chartArea: { width: '80%', height: '70%' },
    hAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#000', fontSize: 12, bold: true }
    },
    vAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#000', fontSize: 12, bold: true },
      minValue: 0
    },
    legend: { position: 'none' },
    bar: { groupWidth: '70%' }
  };

  const pieOptions = {
    title: "",
    backgroundColor: 'transparent',
colors: ['#22C55E', '#3B82F6'],
    chartArea: { width: '90%', height: '90%' },
    legend: {
      textStyle: { color: '#666', fontSize: 12 }
    },
    pieHole: 0.4,
    tooltip: { text: 'value' }
  };

  const lineOptions = {
    title: "",
    backgroundColor: 'transparent',
      colors: ['#22C55E', '#3B82F6'], // People Fed, Capacity
    chartArea: { width: '85%', height: '75%' },
    hAxis: {
          format: "MMM d",  // 👈 shows "Oct 5"

      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#000', fontSize: 12, bold: true }
    },
    vAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#000', fontSize: 12, bold: true },
      minValue: 0
    },
    legend: {
      position: 'bottom',
      textStyle: { color: '#666', fontSize: 12 }
    },
    curveType: "function",
    lineWidth: 3
  };

  const handleExport = () => {
    const summarySheet = [
      ["Total Food Donated (kg)", stats.totalDonated],
      ["Total Food Taken (kg)", stats.totalTaken],
      ["Total People Fed", stats.totalPeopleFed]
    ];

    const donationsSheet = dailyDonations.map((row, idx) =>
      idx === 0 ? row : [new Date(row[0]), row[1]]
    );

    const peopleSheet = dailyData.map((row, idx) =>
  idx === 0 ? row : [row[0] instanceof Date ? row[0] : new Date(row[0]), row[1], row[2]]
    );

    const wsDonations = XLSX.utils.aoa_to_sheet(donationsSheet);
    const wsPeople = XLSX.utils.aoa_to_sheet(peopleSheet);

    const dateColLetter = 'A';
    for (let i = 2; i <= donationsSheet.length; ++i) {
      const cell = wsDonations[`${dateColLetter}${i}`];
      if (cell && cell.t === 'd') cell.z = 'dd-mm-yyyy';
    }
    for (let i = 2; i <= peopleSheet.length; ++i) {
      const cell = wsPeople[`${dateColLetter}${i}`];
      if (cell && cell.t === 'd') cell.z = 'dd-mm-yyyy';
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDonations, 'Donations');
    XLSX.utils.book_append_sheet(wb, wsPeople, 'PeopleFedCapacity');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), "Summary");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "DonationStats.xlsx");
  };

  return (
    <div className="stats-container">
      {/* Header */}
      <div className="stats-header">
        <h1 className="stats-title">Donation Statistics</h1>
        <p className="stats-subtitle">Overview of food donations and impact metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card-minimal">
          <div className="stat-card-header">
            <div className="stat-icon">
              <FiPackage />
            </div>
            <h3 className="stat-card-title">Total Food Donated</h3>
          </div>
          <div className="stat-card-value">{stats.totalDonated} kg</div>
        </div>

        <div className="stat-card-minimal">
          <div className="stat-card-header">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <h3 className="stat-card-title">Total Food Taken</h3>
          </div>
          <div className="stat-card-value">{stats.totalTaken} kg</div>
        </div>

        <div className="stat-card-minimal">
          <div className="stat-card-header">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <h3 className="stat-card-title">Total People Fed</h3>
          </div>
          <div className="stat-card-value">{stats.totalPeopleFed}</div>
          <p className="stat-card-note">Based on food taken</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Donations Chart */}
        <div className="chart-container-minimal">
          <div className="chart-header">
            <h3 className="chart-title">Daily Food Donations</h3>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading chart data...</p>
            </div>
          ): !loading && dailyDonations.length <= 1 ? (
    <p className="text-gray-500 text-center">No donation data available</p>
  )  : (
    
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="300px"
              data={dailyDonations}
              options={columnOptions}
              className="minimal-chart"
              loader={<div className="loading-container"><div className="loading-spinner"></div></div>}
            />
          )}
        </div>

        {/* Pie Chart */}
        <div className="chart-container-minimal">
          <div className="chart-header">
            <h3 className="chart-title">Food Distribution</h3>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading chart data...</p>
            </div>
          ) : (
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={pieData}
              options={pieOptions}
              className="minimal-chart"
              loader={<div className="loading-container"><div className="loading-spinner"></div></div>}
            />
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="line-chart-full">
        <div className="chart-header">
          <h3 className="chart-title">People Fed vs Feeding Capacity</h3>
        </div>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading chart data...</p>
          </div>
        ) : (
           (() => {
      // 👇 put safeDailyData here
      const safeDailyData = dailyData.map((row, idx) =>
  idx === 0 ? row : [row[0] instanceof Date ? row[0] : new Date(row[0]), row[1], row[2]]
      );
        return safeDailyData.length <= 1 ? (
        <p className="text-gray-500 text-center">No people/capacity data available</p>
      ): (
          <Chart
            chartType="LineChart"
            width="100%"
            height="300px"
            data={safeDailyData}
            options={lineOptions}
            className="minimal-chart"
            loader={<div className="loading-container"><div className="loading-spinner"></div></div>}
          />
       );
    })()
  )}
      </div>

      {/* Export Button */}
      <div className="export-section">
        <button
          onClick={handleExport}
          className="btn-minimal btn-primary"
          disabled={loading}
        >
          <FiDownload />
          Export Data (Excel)
        </button>
      </div>
    </div>
  );
}