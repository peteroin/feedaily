import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
        
        data.slice(1).forEach(row => {
          const [year, month, day] = row[0].split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const donated = Number(row[1]) || 0;
          
          // Calculate from the data we have
          const MEAL_KG = 0.4;
          let taken = 0;
          let peopleFed = 0;
          let capacity = Math.floor(donated / MEAL_KG);
          
          // If backend provides taken amount (row[2]) and people fed (row[3])
          if (row.length > 2) {
            taken = Number(row[2]) || 0;
            peopleFed = taken > 0 ? Math.floor(taken / MEAL_KG) : (Number(row[3]) || 0);
          } else {
            // Fallback: assume some food was taken (you can adjust this logic)
            taken = donated * 0.7; // Assume 70% of donated food is taken
            peopleFed = Math.floor(taken / MEAL_KG);
          }
          
          // If still no people fed but we have donations, calculate from donations as fallback
          if (peopleFed === 0 && donated > 0) {
            peopleFed = Math.floor(donated / MEAL_KG);
          }
          
          peopleData.push([date, peopleFed, capacity]);
          donationsData.push([date, donated]);
        });
        
        console.log('People data:', peopleData);
        console.log('Donations data:', donationsData);
        
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
        
        // Calculate people fed from taken food
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

  // CHART OPTIONS - Pen-drawn style in black and blue
  const columnOptions = {
    title: "Daily Food Donations (kg)",
    titleTextStyle: { 
      fontName: 'Permanent Marker, cursive',
      fontSize: 18,
      color: '#1a1a1a'
    },
    hAxis: { 
      title: "Date", 
      format: "MMM dd", 
      slantedText: true, 
      slantedTextAngle: 30,
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' },
      titleTextStyle: { fontName: 'Permanent Marker, cursive', fontSize: 14, color: '#1a1a1a' }
    },
    vAxis: { 
      title: "Kilograms", 
      minValue: 0,
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' },
      titleTextStyle: { fontName: 'Permanent Marker, cursive', fontSize: 14, color: '#1a1a1a' }
    },
    legend: { position: "none" },
    chartArea: { width: "75%", height: "70%" },
    backgroundColor: '#fafafa',
    colors: ['#1e3a8a'],
    bar: { groupWidth: '65%' }
  };

  const pieOptions = {
    title: "Food Distribution",
    titleTextStyle: { 
      fontName: 'Permanent Marker, cursive',
      fontSize: 18,
      color: '#1a1a1a'
    },
    pieHole: 0.4,
    slices: { 
      0: { color: "#1e3a8a" }, 
      1: { color: "#0f172a" } 
    },
    backgroundColor: '#fafafa',
    legend: { 
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' }
    }
  };

  const lineOptions = {
    title: "People Fed vs Feeding Capacity",
    titleTextStyle: { 
      fontName: 'Permanent Marker, cursive',
      fontSize: 18,
      color: '#1a1a1a'
    },
    hAxis: { 
      title: "Date", 
      format: "MMM dd",
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' },
      titleTextStyle: { fontName: 'Permanent Marker, cursive', fontSize: 14, color: '#1a1a1a' }
    },
    vAxis: { 
      title: "Number of People", 
      minValue: 0,
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' },
      titleTextStyle: { fontName: 'Permanent Marker, cursive', fontSize: 14, color: '#1a1a1a' }
    },
    legend: { 
      position: "bottom",
      textStyle: { fontName: 'Kalam, cursive', fontSize: 12, color: '#333' }
    },
    curveType: "function",
    chartArea: { width: "75%", height: "65%" },
    backgroundColor: '#fafafa',
    series: {
      0: { color: "#1e3a8a", lineWidth: 4 }, // People Fed - Blue
      1: { color: "#0f172a", lineWidth: 3, lineDashStyle: [8, 4] } // Capacity - Black Dashed
    }
  };

  const handleExport = () => {
  const summarySheet = [
    ["Total Food Donated (kg)", stats.totalDonated],
    ["Total Food Taken (kg)", stats.totalTaken],
    ["Total People Fed", stats.totalPeopleFed]
  ];

  // Map with real Date objects
  const donationsSheet = dailyDonations.map((row, idx) =>
    idx === 0
      ? row
      : [
          row[0] instanceof Date
            ? row
            : new Date(row),
          row[1]
        ]
  );

  const peopleSheet = dailyData.map((row, idx) =>
    idx === 0
      ? row
      : [
          row instanceof Date
            ? row
            : new Date(row),
          row[1],
          row[2]
        ]
  );

  // Create worksheets and set the date format (first column)
  const wsDonations = XLSX.utils.aoa_to_sheet(donationsSheet);
  const wsPeople = XLSX.utils.aoa_to_sheet(peopleSheet);

  // For all rows in sheet, force first column as "dd-mm-yyyy"
  const dateColLetter = 'A';
  for (let i = 2; i <= (donationsSheet.length); ++i) {
    const cell = wsDonations[`${dateColLetter}${i}`];
    if (cell && cell.t === 'd') cell.z = 'dd-mm-yyyy';
  }
  for (let i = 2; i <= (peopleSheet.length); ++i) {
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
      
    <div style={{ 
      padding: '30px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '"Kalam", cursive, sans-serif',
      backgroundImage: `
        linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
        linear-gradient(180deg, #e5e7eb 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      position: 'relative'
    }}>
      
      {/* Notebook margin line */}
      <div style={{
        position: 'absolute',
        left: '80px',
        top: '0',
        bottom: '0',
        width: '2px',
        background: '#ef4444',
        opacity: 0.6
      }}></div>

      {/* Hand-drawn title */}
      <div style={{ 
        textAlign: 'left', 
        marginBottom: '40px',
        marginLeft: '100px',
        position: 'relative'
      }}>
        <h1 style={{ 
          fontSize: '2.8rem',
          color: '#1a1a1a',
          fontFamily: '"Permanent Marker", cursive',
          transform: 'rotate(-1.5deg)',
          margin: '0 0 15px 0',
          textShadow: '2px 2px 0px #1e3a8a'
        }}>
          Donation Statistics
        </h1>
        
        {/* Hand-drawn underline */}
        <svg width="350" height="15" style={{ transform: 'rotate(-1deg)' }}>
          <path 
            d="M10,8 Q50,12 100,7 T200,9 T320,6" 
            stroke="#1e3a8a" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M15,11 Q60,14 110,9 T210,12 T325,8" 
            stroke="#1e3a8a" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Pen doodle */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '50px',
          fontSize: '1.5rem',
          transform: 'rotate(25deg)'
        }}>✒️</div>
      </div>

      {/* Stat Summary Cards - Hand-drawn notebook style */}
      <div style={{ 
        display: "flex", 
        gap: 25, 
        margin: "30px 0 30px 100px",
        flexWrap: 'wrap'
      }}>
        
        {/* Food Donated Card */}
        <div style={{ 
          flex: 1,
          minWidth: '250px',
          background: "#fafafa",
          borderRadius: '0px',
          padding: '25px',
          border: '2px solid #1a1a1a',
          position: 'relative',
          transform: 'rotate(-1deg)',
          boxShadow: '4px 4px 0px #1e3a8a'
        }}>
          {/* Torn paper effect */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: '20px',
            width: '30px',
            height: '10px',
            background: '#f8f9fa',
            clipPath: 'polygon(0% 0%, 70% 100%, 100% 0%)'
          }}></div>
          
          <div style={{
            borderBottom: '2px dashed #1e3a8a',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <h3 style={{ 
              margin: '0',
              fontSize: '1.2rem',
              color: '#1a1a1a',
              fontFamily: '"Permanent Marker", cursive',
              transform: 'rotate(0.5deg)'
            }}>
              Total Food Donated
            </h3>
          </div>
          
          <div style={{ 
            fontSize: '2.8rem',
            fontWeight: "bold",
            color: '#1e3a8a',
            fontFamily: '"Permanent Marker", cursive',
            textAlign: 'center',
            transform: 'rotate(-0.5deg)'
          }}>
            {stats.totalDonated} kg
          </div>
          
        </div>

        {/* Food Taken Card */}
        <div style={{ 
          flex: 1,
          minWidth: '250px',
          background: "#fafafa",
          borderRadius: '0px',
          padding: '25px',
          border: '2px solid #1a1a1a',
          position: 'relative',
          transform: 'rotate(1deg)',
          boxShadow: '4px 4px 0px #1e3a8a'
        }}>
          <div style={{
            borderBottom: '2px dashed #1e3a8a',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <h3 style={{ 
              margin: '0',
              fontSize: '1.2rem',
              color: '#1a1a1a',
              fontFamily: '"Permanent Marker", cursive',
              transform: 'rotate(-0.5deg)'
            }}>
              Total Food Taken
            </h3>
          </div>
          
          <div style={{ 
            fontSize: '2.8rem',
            fontWeight: "bold",
            color: '#0f172a',
            fontFamily: '"Permanent Marker", cursive',
            textAlign: 'center',
            transform: 'rotate(0.8deg)'
          }}>
            {stats.totalTaken} kg
          </div>
        </div>

        {/* People Fed Card */}
        <div style={{ 
          flex: 1,
          minWidth: '250px',
          background: "#fafafa",
          borderRadius: '0px',
          padding: '25px',
          border: '2px solid #1a1a1a',
          position: 'relative',
          transform: 'rotate(-0.5deg)',
          boxShadow: '4px 4px 0px #1e3a8a'
        }}>
          <div style={{
            borderBottom: '2px dashed #1e3a8a',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <h3 style={{ 
              margin: '0',
              fontSize: '1.2rem',
              color: '#1a1a1a',
              fontFamily: '"Permanent Marker", cursive',
              transform: 'rotate(0.3deg)'
            }}>
              Total People Fed
            </h3>
          </div>
          
          <div style={{ 
            fontSize: '2.8rem',
            fontWeight: "bold",
            color: '#1e3a8a',
            fontFamily: '"Permanent Marker", cursive',
            textAlign: 'center',
            transform: 'rotate(-0.3deg)'
          }}>
            {stats.totalPeopleFed}
          </div>
          
          <div style={{ 
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'center',
            marginTop: '8px',
            fontStyle: 'italic',
            fontFamily: '"Kalam", cursive'
          }}>
            * Based on food taken
          </div>
          
        </div>
      </div>

      {/* Main Graphs Container */}
      <div style={{ 
        display: "flex", 
        gap: 30, 
        flexWrap: "wrap",
        margin: '40px 0 40px 100px'
      }}>
        
        {/* Donations Chart */}
        <div style={{ 
          flex: 2, 
          minWidth: 400,
          background: '#fafafa',
          padding: '25px',
          border: '3px solid #1a1a1a',
          position: 'relative',
          transform: 'rotate(0.5deg)',
          boxShadow: '6px 6px 0px #1e3a8a'
        }}>
          {/* Spiral notebook holes */}
          <div style={{ position: 'absolute', left: '-15px', top: '20px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '2px solid #1a1a1a',
                background: '#f8f9fa',
                marginBottom: '30px'
              }}></div>
            ))}
          </div>
          
          <div style={{
            position: 'absolute',
            top: '-15px',
            right: '20px',
            background: '#1e3a8a',
            color: 'white',
            padding: '5px 15px',
            fontSize: '0.8rem',
            transform: 'rotate(-8deg)',
            fontFamily: '"Permanent Marker", cursive'
          }}>
            CHART #1
          </div>
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px',
              color: '#666',
              fontSize: '1.2rem',
              fontFamily: '"Kalam", cursive'
            }}>
              Drawing with pen...
            </div>
          ) : (
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="350px"
              data={dailyDonations}
              options={columnOptions}
              loader={<div style={{ textAlign: 'center', padding: '20px', fontFamily: '"Kalam", cursive' }}>Sketching bars...</div>}
            />
          )}
        </div>

        {/* Pie Chart */}
        <div style={{ 
          flex: 1, 
          minWidth: 300,
          background: '#fafafa',
          padding: '25px',
          border: '3px solid #1a1a1a',
          transform: 'rotate(-1deg)',
          boxShadow: '6px 6px 0px #1e3a8a',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '20px',
            background: '#0f172a',
            color: 'white',
            padding: '5px 15px',
            fontSize: '0.8rem',
            transform: 'rotate(5deg)',
            fontFamily: '"Permanent Marker", cursive'
          }}>
            PIE CHART
          </div>
          
          <Chart
            chartType="PieChart"
            width="100%"
            height="350px"
            data={pieData}
            options={pieOptions}
            loader={<div style={{ textAlign: 'center', padding: '20px', fontFamily: '"Kalam", cursive' }}>Drawing pie slices...</div>}
          />
        </div>
      </div>

      {/* Line chart */}
      <div style={{ 
        margin: '40px 0 40px 100px',
        background: '#fafafa',
        padding: '30px',
        border: '3px solid #1a1a1a',
        transform: 'rotate(-0.3deg)',
        position: 'relative',
        boxShadow: '8px 8px 0px #1e3a8a'
      }}>
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '30px',
          background: '#1e3a8a',
          color: 'white',
          padding: '8px 20px',
          fontSize: '0.9rem',
          transform: 'rotate(-3deg)',
          fontFamily: '"Permanent Marker", cursive'
        }}>
          TREND ANALYSIS
        </div>
        
        {/* Paper clip */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '50px',
          width: '20px',
          height: '40px',
          border: '3px solid #666',
          borderRadius: '10px 10px 0 0',
          transform: 'rotate(15deg)'
        }}></div>
        
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px',
            color: '#666',
            fontSize: '1.2rem',
            fontFamily: '"Kalam", cursive'
          }}>
            Connecting the dots by hand...
          </div>
        ) : (
          <Chart
            chartType="LineChart"
            width="100%"
            height="300px"
            data={dailyData}
            options={lineOptions}
            loader={<div style={{ textAlign: 'center', padding: '20px', fontFamily: '"Kalam", cursive' }}>Drawing trend lines...</div>}
          />
        )}
      </div>

      {/* Hand-drawn footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '50px',
        padding: '20px',
        marginLeft: '100px'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#1a1a1a',
          fontFamily: '"Permanent Marker", cursive',
          transform: 'rotate(-1deg)',
          margin: '20px 0'
        }}>
          Hand-drawn with care ✒️
        </div>
        
        {/* Scribbled line */}
        <svg width="200" height="20">
          <path 
            d="M10,10 Q30,5 50,12 T90,8 T130,11 T170,7 T190,10" 
            stroke="#1e3a8a" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>

      </div>

      <div style={{ display: 'flex', margin: '0 0 30px 100px', gap: 16 }}>
  <button
    onClick={handleExport}
    style={{
      background: "#1e3a8a",
      color: "#fff",
      fontFamily: '"Permanent Marker", cursive',
      fontSize: "1.1rem",
      border: "none",
      borderRadius: "6px",
      padding: "12px 28px",
      cursor: "pointer",
      boxShadow: "2px 2px 0px #0f172a",
      outline: "none",
      transition: "background 0.2s"
    }}
    disabled={loading}
    title="Download table data as Excel"
  >
    ⬇️ Download Data (Excel)
  </button>
</div>
    </div>
  );
}