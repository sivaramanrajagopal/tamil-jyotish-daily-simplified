import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import { getRSNakshatraInfo } from "../lib/nakshatraUtils";
import CalendarSync from "../components/CalendarSync";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panchangamData, setPanchangamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rsNakshatraInfo, setRsNakshatraInfo] = useState(null);

  const fetchPanchangamData = useCallback(async (date) => {
    setLoading(true);
    const formattedDate = date.toISOString().split("T")[0];
    
    try {
      const { data, error } = await supabase
        .from("daily_panchangam")
        .select("*")
        .eq("date", formattedDate)
        .single();

      if (error) {
        console.error("Error fetching panchangam:", error);
        setPanchangamData(null);
        setRsNakshatraInfo(null);
      } else {
        // Fetch nakshatra yogam data
        try {
          const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
          const { data: yogamData, error: yogamError } = await supabase.rpc(
            "get_nakshatra_yogam",
            {
              nakshatra_name: data.main_nakshatra,
              day_name: dayOfWeek,
            },
          );

          if (yogamError) {
            console.error("Error fetching nakshatra yogam:", yogamError);
          }

          // Check moon phase from tithi
          let moonPhase = {
            is_valar_pirai: false,
            is_thei_pirai: false,
          };

          // Parse tithi data to determine moon phase
          if (data.tithi) {
            let tithiData;
            if (typeof data.tithi === "string") {
              try {
                tithiData = JSON.parse(data.tithi);
              } catch (e) {
                console.error("Error parsing tithi JSON:", e);
              }
            } else {
              tithiData = data.tithi;
            }

            if (Array.isArray(tithiData)) {
              // Check for Shukla Paksha (growing moon)
              moonPhase.is_valar_pirai = tithiData.some(
                (t) => t.paksha === "சுக்ல பக்ஷ",
              );

              // Check for Krishna Paksha (waning moon)
              moonPhase.is_thei_pirai = tithiData.some(
                (t) => t.paksha === "கிருஷ்ண பக்ஷ",
              );
            }
          }

          setPanchangamData({
            ...data,
            nakshatra_yogam: yogamData,
            is_valar_pirai: moonPhase.is_valar_pirai,
            is_thei_pirai: moonPhase.is_thei_pirai,
          });
        } catch (e) {
          console.error("Error fetching additional data:", e);
          setPanchangamData(data);
        }
        
        // Check for RS Nakshatra
        if (data && data.main_nakshatra) {
          const rsInfo = getRSNakshatraInfo(data.main_nakshatra);
          setRsNakshatraInfo(rsInfo);
          
          if (rsInfo) {
            console.log("RS Nakshatra detected:", data.main_nakshatra);
          }
        } else {
          setRsNakshatraInfo(null);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setPanchangamData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPanchangamData(selectedDate);
  }, [selectedDate, fetchPanchangamData]);

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

        {/* Calendar Sync Component */}
        <CalendarSync />
      </header>

        <main>
          {/* RS Nakshatra Warning Section */}
          {rsNakshatraInfo && (
            <div className="rs-nakshatra-warning">
              <div className="warning-header">
                <span role="img" aria-label="Warning" className="warning-icon">
                  ⚠️
                </span>
                <h3>தீதுரு நட்சத்திர எச்சரிக்கை</h3>
              </div>
              <p>
                இன்று{" "}
                <strong>
                  {rsNakshatraInfo.nakshatra_name_tamil ||
                    rsNakshatraInfo.nakshatra_name}
                </strong>{" "}
                நட்சத்திரம் தீதுரு நட்சத்திரமாக கருதப்படுகிறது.
              </p>
              <div className="warning-items">
                {rsNakshatraInfo.avoid_medical && (
                  <div className="warning-item">
                    <span role="img" aria-label="Medical">
                      💊
                    </span>
                    <span>
                      மருத்துவ சிகிச்சை அல்லது புதிய மருந்துகள் தொடங்குவதை
                      தவிர்க்கவும்
                    </span>
                  </div>
                )}

                {rsNakshatraInfo.avoid_travel && (
                  <div className="warning-item">
                    <span role="img" aria-label="Travel">
                      ✈️
                    </span>
                    <span>பயணம் மேற்கொள்வதை தவிர்க்கவும்</span>
                  </div>
                )}

                {rsNakshatraInfo.avoid_financial && (
                  <div className="warning-item">
                    <span role="img" aria-label="Financial">
                      💰
                    </span>
                    <span>
                      கடன் வாங்குதல் அல்லது கொடுத்தல் போன்ற பண பரிவர்த்தனைகளை
                      தவிர்க்கவும்
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="panel">
              <h2>⏳ Loading panchangam data...</h2>
            </div>
          ) : !panchangamData ? (
            <div className="panel">
              <h2>❌ No data available for this date</h2>
              <p>Selected Date: {selectedDate.toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="panel">
              <h2>✨ Tamil Panchangam Data</h2>
              <div className="basic-info">
                <div className="info-item">
                  <span className="label">📅 Date: </span>
                  {selectedDate.toLocaleDateString()}
                </div>
                <div className="info-item">
                  <span className="label">📆 Day: </span>
                  {panchangamData.vaara || "Day"}
                </div>
                <div className="info-item">
                  <span className="label">🌟 Main Nakshatra: </span>
                  <span>
                    {panchangamData.main_nakshatra || "N/A"}
                    {/* Add RS badge if applicable */}
                    {rsNakshatraInfo && <span className="rs-badge">RS</span>}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">🔮 Nakshatra Yogam: </span>
                  {panchangamData.nakshatra_yogam || "N/A"}
                </div>
                <div className="info-item">
                  <span className="label">🌗 Moon Phase: </span>
                  <span>
                    {panchangamData.is_valar_pirai ? "வளர்பிறை (Waxing Moon)" : 
                     panchangamData.is_thei_pirai ? "தேய்பிறை (Waning Moon)" : "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">🌅 Sunrise: </span>
                  {panchangamData.sunrise ? new Date(panchangamData.sunrise).toLocaleTimeString() : "N/A"}
                </div>
                <div className="info-item">
                  <span className="label">🌇 Sunset: </span>
                  {panchangamData.sunset ? new Date(panchangamData.sunset).toLocaleTimeString() : "N/A"}
                </div>
                <div className="info-item">
                  <span className="label">⚠️ Rahu Kalam: </span>
                  {panchangamData.rahu_kalam || "N/A"}
                </div>
                <div className="info-item">
                  <span className="label">✅ Abhijit Muhurta: </span>
                  {panchangamData.abhijit_muhurta || "N/A"}
                </div>
                <div className="info-item">
                  <span className="label">🔄 Chandrashtama for: </span>
                  {panchangamData.chandrashtama_for || "N/A"}
                </div>
              </div>
            </div>
          )}
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

         .basic-info {
           margin-top: 20px;
         }

         .info-item {
           margin-bottom: 12px;
           padding: 8px 0;
           border-bottom: 1px solid #f0f0f0;
         }

         .info-item:last-child {
           border-bottom: none;
         }

         .label {
           font-weight: 600;
           color: #333;
           margin-right: 8px;
         }

         /* RS Nakshatra Warning Styles */
         .rs-nakshatra-warning {
           background-color: #ffebee;
           border: 1px solid #e57373;
           border-radius: 8px;
           padding: 15px;
           margin-bottom: 20px;
           box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
         }

         .warning-header {
           display: flex;
           align-items: center;
           margin-bottom: 12px;
         }

         .warning-icon {
           font-size: 22px;
           margin-right: 10px;
         }

         .warning-header h3 {
           margin: 0;
           color: #c62828;
           font-size: 18px;
           font-weight: 600;
         }

         .warning-items {
           display: flex;
           flex-direction: column;
           gap: 10px;
           margin-top: 12px;
           background-color: rgba(255, 255, 255, 0.5);
           border-radius: 6px;
           padding: 10px;
         }

         .warning-item {
           display: flex;
           align-items: center;
           gap: 10px;
         }

         .warning-item span:first-child {
           font-size: 18px;
         }

         .rs-badge {
           background-color: #d32f2f;
           color: white;
           font-size: 10px;
           padding: 2px 6px;
           border-radius: 10px;
           margin-left: 8px;
           display: inline-block;
           vertical-align: middle;
           font-weight: bold;
         }
      `}</style>
    </div>
  );
}
