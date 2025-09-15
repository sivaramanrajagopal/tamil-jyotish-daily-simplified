import React, { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const formatDateForInput = (date) => date.toISOString().split("T")[0];

  return (
    <div className="container">
      <Head>
        <title>TamilJyotish Daily Panchangam</title>
        <meta
          name="description"
          content="Daily panchangam information for auspicious timing"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <h1>✨ விஸ்வாவசு தமிழ் பஞ்சாங்கம் ✨</h1>

        <div className="date-selector">
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
          />
        </div>

        <button
          onClick={() => alert('Tamil Panchangam App is working!')}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            margin: "10px 0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease"
          }}
          disabled={loading}
        >
          <span role="img" aria-hidden="true">
            🔊
          </span>{" "}
          தமிழில் வாசிக்க (Read in Tamil)
        </button>
      </header>

      <main>
        <div className="panel">
          <h2>🎉 Tamil Panchangam App is Working!</h2>
          <p>Selected Date: {selectedDate.toLocaleDateString()}</p>
          <p>This is a simplified version to test if the JavaScript initialization error is resolved.</p>
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .header h1 {
          margin: 0 0 20px 0;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .date-selector {
          margin: 20px 0;
        }

        .date-selector input {
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          color: #333;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .panel {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .panel h2 {
          color: #333;
          margin-bottom: 15px;
        }

        .panel p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
