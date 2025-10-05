
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
        
        const peopleData = [["Date", "People Fed", "Capacity to Feed"]];
        const donationsData = [["Date", "Donations (kg)"]];
        
        if (!Array.isArray(data) || data.length <= 1) {
        setDailyData([["Date", "People Fed", "Capacity to Feed"], [new Date().toLocaleDateString(), 0, 0]]);
        setDailyDonations([["Date", "Donations (kg)"], [new Date().toLocaleDateString(), 0]]);
        setLoading(false);
        return;
      }
        // Calculate people fed dynamically
        const MEAL_KG = 0.4;
        data.slice(1).forEach((row) => {
          const [date, donated, taken, fedRaw] = row;
          const donatedKg = Number(donated) || 0;
          const takenKg = Number(taken) || 0;
          // If fed not provided, calculate it
          const fed = fedRaw ?? Math.floor(takenKg / MEAL_KG);
          peopleData.push([date, fed, fed + 10]);
          donationsData.push([date, donatedKg]);
        });

        setDailyData(peopleData);
        setDailyDonations(donationsData);
        setLoading(false);
      })
      .catch((err) => {
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
    ["Total Donated", stats.totalDonated || 0],
    ["Total Taken", stats.totalTaken || 0],
  ];

  // Minimal Chart Options
  const columnOptions = {
    title: "",
    backgroundColor: 'transparent',
    colors: ['#000'],
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
    colors: ['#000', '#666'],
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
    colors: ['#000', '#666'],
    chartArea: { width: '85%', height: '75%' },
    hAxis: {
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
      idx === 0 ? row : [new Date(row[0]), row[1], row[2]]
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
          ) : (
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
          <Chart
            chartType="LineChart"
            width="100%"
            height="300px"
            data={dailyData}
            options={lineOptions}
            className="minimal-chart"
            loader={<div className="loading-container"><div className="loading-spinner"></div></div>}
          />
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