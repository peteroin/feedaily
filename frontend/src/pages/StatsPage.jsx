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

  // Fetch daily stats with better error handling
  useEffect(() => {
    fetch('http://localhost:5000/api/daily-donation-stats')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Raw API response:', data);
        
        const peopleData = [["Date", "People Fed", "Capacity to Feed"]];
        const donationsData = [["Date", "Donations (kg)"]];
        
        // Handle empty or invalid data
        if (!data || !Array.isArray(data) || data.length <= 1) {
          // Generate sample data for the past 7 days to maintain consistent dimensions
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            peopleData.push([date, 0, 0]);
            donationsData.push([date, 0]);
          }
        } else {
          // Ensure we have at least 7 days of data for consistent chart dimensions
          const processedData = [];
          const today = new Date();
          
          // Process existing data
          data.slice(1).forEach(row => {
            const [year, month, day] = row[0].split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const donated = Number(row[1]) || 0;
            
            const MEAL_KG = 0.4;
            let taken = 0;
            let peopleFed = 0;
            let capacity = Math.floor(donated / MEAL_KG);
            
            if (row.length > 2) {
              taken = Number(row[2]) || 0;
              peopleFed = taken > 0 ? Math.floor(taken / MEAL_KG) : (Number(row[3]) || 0);
            } else {
              taken = donated * 0.7;
              peopleFed = Math.floor(taken / MEAL_KG);
            }
            
            if (peopleFed === 0 && donated > 0) {
              peopleFed = Math.floor(donated / MEAL_KG);
            }
            
            processedData.push({
              date,
              donated,
              peopleFed,
              capacity
            });
          });
          
          // Fill in missing days to ensure consistent 7-day view
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const existingData = processedData.find(d => 
              d.date.toDateString() === date.toDateString()
            );
            
            if (existingData) {
              peopleData.push([date, existingData.peopleFed, existingData.capacity]);
              donationsData.push([date, existingData.donated]);
            } else {
              peopleData.push([date, 0, 0]);
              donationsData.push([date, 0]);
            }
          }
        }
        
        setDailyData(peopleData);
        setDailyDonations(donationsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching daily donation stats:", err);
        
        // Generate default 7-day data when API fails
        const peopleData = [["Date", "People Fed", "Capacity to Feed"]];
        const donationsData = [["Date", "Donations (kg)"]];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          peopleData.push([date, 0, 0]);
          donationsData.push([date, 0]);
        }
        
        setDailyData(peopleData);
        setDailyDonations(donationsData);
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

  // Enhanced Chart Options with Better Colors
  const columnOptions = {
    title: "",
    backgroundColor: 'transparent',
    colors: ['#4CAF50'], // Green color for donations
    chartArea: { width: '80%', height: '70%' },
    hAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#333', fontSize: 12, bold: true },
      format: 'MMM dd' // Better date formatting
    },
    vAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#333', fontSize: 12, bold: true },
      minValue: 0,
      format: '#.## kg' // Add kg unit to values
    },
    legend: { position: 'none' },
    bar: { groupWidth: '60%' }, // Slightly thinner bars for better spacing
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    }
  };

  const pieOptions = {
    title: "",
    backgroundColor: 'transparent',
    colors: ['#4CAF50', '#FF9800'], // Green for donated, Orange for taken
    chartArea: { width: '90%', height: '90%' },
    legend: {
      textStyle: { color: '#666', fontSize: 12 },
      position: 'bottom'
    },
    pieHole: 0.4,
    tooltip: { 
      text: 'value',
      textStyle: { fontSize: 12 }
    },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    }
  };

  const lineOptions = {
    title: "",
    backgroundColor: 'transparent',
    colors: ['#2196F3', '#9C27B0'], // Blue for people fed, Purple for capacity
    chartArea: { width: '85%', height: '75%' },
    hAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#333', fontSize: 12, bold: true },
      format: 'MMM dd'
    },
    vAxis: {
      textStyle: { color: '#666', fontSize: 11 },
      titleTextStyle: { color: '#333', fontSize: 12, bold: true },
      minValue: 0,
      format: '# people'
    },
    legend: {
      position: 'bottom',
      textStyle: { color: '#666', fontSize: 12 }
    },
    curveType: "function",
    lineWidth: 3,
    pointSize: 5,
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    }
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
          ) : dailyDonations.length <= 1 ? (
            <div className="no-data-container">
              <div className="no-data-icon">📊</div>
              <p className="no-data-text">No donation data available</p>
              <p className="no-data-subtext">Start donating to see your impact!</p>
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
          ) : (stats.totalDonated === 0 && stats.totalTaken === 0) ? (
            <div className="no-data-container">
              <div className="no-data-icon">🥧</div>
              <p className="no-data-text">No distribution data available</p>
              <p className="no-data-subtext">Data will appear once donations are made</p>
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
        ) : dailyData.length <= 1 ? (
          <div className="no-data-container">
            <div className="no-data-icon">📈</div>
            <p className="no-data-text">No feeding data available</p>
            <p className="no-data-subtext">Chart will show data as people are fed</p>
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