import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panchangamData, setPanchangamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPanchangamData(selectedDate);
  }, [selectedDate]);

  const fetchPanchangamData = async (date) => {
    setLoading(true);

    // Format date for API
    const formattedDate = date.toISOString().split('T')[0];

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('daily_panchangam')
      .select('*')
      .eq('date', formattedDate)
      .single();

    if (error) {
      console.error('Error fetching panchangam:', error);
      setLoading(false);
      setPanchangamData(null);
      return;
    }

    if (!data) {
      setLoading(false);
      setPanchangamData(null);
      return;
    }

    // Get nakshatra yogam
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    try {
      const { data: yogamData, error: yogamError } = await supabase
        .rpc('get_nakshatra_yogam', { 
          nakshatra_name: data.main_nakshatra, 
          day_name: dayOfWeek 
        });

      if (yogamError) throw yogamError;

      setPanchangamData({...data, nakshatra_yogam: yogamData});
    } catch (e) {
      console.error('Error fetching nakshatra yogam:', e);
      setPanchangamData(data); // Set without yogam data
    }

    setLoading(false);
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format time function
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';

    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get special day name
  const getSpecialDay = (data) => {
    if (!data) return 'Normal Day';

    if (data.is_pournami) return 'பௌர்ணமி (Full Moon Day)';
    if (data.is_amavasai) return 'அமாவாசை (New Moon Day)';
    if (data.is_ekadashi) return 'ஏகாதசி (Ekadashi)';
    if (data.is_dwadashi) return 'துவாதசி (Dwadashi)';
    if (data.is_ashtami) return 'அஷ்டமி (Ashtami)';
    if (data.is_navami) return 'நவமி (Navami)';
    if (data.is_trayodashi) return 'திரயோதசி (Trayodashi)';
    if (data.is_sashti) return 'சஷ்டி (Sashti)';
    return 'Normal Day';
  };

  // Properly parse JSONB fields
  const parseJsonField = (field) => {
    if (!field) return null;

    // If it's already an array or object, return it
    if (typeof field === 'object') return field;

    // If it's a string, try to parse it
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error('Error parsing JSON string:', e);
        return null;
      }
    }

    return null;
  };

  // Get the first item from a JSONB array field
  const getFirstItem = (field) => {
    const parsed = parseJsonField(field);

    if (!parsed) return null;

    // If it's an array
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }

    // If it's an object that might represent an array
    if (typeof parsed === 'object' && parsed !== null) {
      // Try to find the first item (could be at index 0 or with key "0")
      if (parsed[0]) return parsed[0];

      // Otherwise take the first key's value
      const firstKey = Object.keys(parsed)[0];
      if (firstKey) return parsed[firstKey];
    }

    return null;
  };

  // Map for English to Tamil nakshatra names
  const nakshatraEnglishToTamil = {
    'Ashwini': 'அசுவினி',
    'Bharani': 'பரணி',
    'Krittika': 'கார்த்திகை',
    'Rohini': 'ரோகிணி',
    'Mrigasira': 'மிருகசீரிஷம்',
    'Ardra': 'திருவாதிரை',
    'Punarvasu': 'புனர்பூசம்',
    'Pushya': 'பூசம்',
    'Ashlesha': 'ஆயில்யம்',
    'Magha': 'மகம்',
    'Purva Phalguni': 'பூரம்',
    'Uttara Phalguni': 'உத்திரம்',
    'Hasta': 'ஹஸ்தம்',
    'Chitra': 'சித்திரை',
    'Swati': 'சுவாதி',
    'Vishakha': 'விசாகம்',
    'Anuradha': 'அனுஷம்',
    'Jyeshtha': 'கேட்டை',
    'Mula': 'மூலம்',
    'Purva Ashadha': 'பூராடம்',
    'Uttara Ashadha': 'உத்திராடம்',
    'Shravana': 'திருவோணம்',
    'Dhanishta': 'அவிட்டம்',
    'Shatabhisha': 'சதயம்',
    'Purva Bhadrapada': 'பூரட்டாதி',
    'Uttara Bhadrapada': 'உத்திரட்டாதி',
    'Revati': 'ரேவதி'
  };

  // Convert English nakshatra names to Tamil
  const convertChandrashtamaToTamil = (englishNames) => {
    if (!englishNames) return 'N/A';

    if (Array.isArray(englishNames)) {
      return englishNames.map(name => nakshatraEnglishToTamil[name] || name).join(', ');
    }

    if (typeof englishNames === 'string') {
      return nakshatraEnglishToTamil[englishNames] || englishNames;
    }

    return 'N/A';
  };

  return (
    <div className="container">
      <Head>
        <title>TamilJyotish Daily Panchangam</title>
        <meta name="description" content="Daily panchangam information for auspicious timing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <h1>✨ TamilJyotish Daily Panchangam ✨</h1>

        <div className="date-selector">
          <input
            type="date"
            value={formatDate(selectedDate)}
            onChange={handleDateChange}
          />
        </div>
      </header>

      <main>
        {loading ? (
          <div className="panel">Loading panchangam data...</div>
        ) : !panchangamData ? (
          <div className="panel">No data available for this date</div>
        ) : (
          <div className="panel">
            {/* Basic date and day */}
            <div className="basic-info">
              <div className="info-item">
                <span className="label">📅 Date: </span>
                {new Date(panchangamData.date).toLocaleDateString([], {day: 'numeric', month: 'long', year: 'numeric'})}
              </div>
              <div className="info-item">
                <span className="label">📆 Day: </span>
                {panchangamData.vaara || new Date(panchangamData.date).toLocaleDateString([], {weekday: 'long'})}
              </div>
            </div>

            <div className="divider"></div>

            {/* Star information */}
            <div className="info-section">
              <div className="info-item">
                <span className="label">🌟 Main Nakshatra: </span>
                {panchangamData.main_nakshatra || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">🔮 Nakshatra Yogam: </span>
                {panchangamData.nakshatra_yogam || 'N/A'}
              </div>
            </div>

            {/* Tithi, Yogam, Karanam */}
            <div className="info-section">
              <div className="info-item">
                <span className="label">🌗 Tithi: </span>
                {(panchangamData.tithi && getFirstItem(panchangamData.tithi)?.name) || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">✨ Yogam: </span>
                {(panchangamData.yoga && getFirstItem(panchangamData.yoga)?.name) || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">🌓 Karanam: </span>
                {(panchangamData.karana && getFirstItem(panchangamData.karana)?.name) || 'N/A'}
              </div>
            </div>

            {/* Sun/Moon times */}
            <div className="info-section sun-moon-times">
              <div className="info-item">
                <span className="label">🌅 Sunrise: </span>
                {formatTime(panchangamData.sunrise)}
              </div>
              <div className="info-item">
                <span className="label">🌇 Sunset: </span>
                {formatTime(panchangamData.sunset)}
              </div>
              <div className="info-item">
                <span className="label">🌕 Moonrise: </span>
                {formatTime(panchangamData.moonrise)}
              </div>
              <div className="info-item">
                <span className="label">🌑 Moonset: </span>
                {formatTime(panchangamData.moonset)}
              </div>
            </div>

            <div className="divider"></div>

            {/* Important times */}
            <div className="section-title">⚠️ Important Times:</div>
            <div className="info-section">
              <div className="info-item">
                <span className="label">⚠️ Rahu Kalam: </span>
                {panchangamData.rahu_kalam || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">⏱️ Yamagandam: </span>
                {panchangamData.yamagandam || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">⏳ Kuligai: </span>
                {panchangamData.kuligai || 'N/A'}
              </div>
              <div className="info-item">
                <span className="label">✅ Abhijit Muhurta: </span>
                {panchangamData.abhijit_muhurta || 'N/A'}
              </div>
            </div>

            <div className="divider"></div>

            {/* Special information */}
            <div className="info-section">
              <div className="info-item">
                <span className="label">🎉 Special Day: </span>
                {getSpecialDay(panchangamData)}
              </div>

              {panchangamData.chandrashtama_for && (
                <div className="info-item">
                  <span className="label">🔄 Chandrashtama for: </span>
                  {convertChandrashtamaToTamil(panchangamData.chandrashtama_for)}
                </div>
              )}

              <div className="info-item cosmic-score">
                <span className="label">🌿 Cosmic Score: </span>
                {panchangamData.cosmic_score ? `${panchangamData.cosmic_score}/10` : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} TamilJyotish Daily</p>
      </footer>

      <style jsx>{`
        /* Basic styling */
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.5;
        }

        .header {
          text-align: center;
          margin-bottom: 25px;
        }

        h1 {
          color: #4f46e5;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .date-selector {
          margin: 15px auto;
          display: flex;
          justify-content: center;
        }

        .date-selector input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          width: 200px;
        }

        .panel {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          padding: 20px;
        }

        .basic-info {
          margin-bottom: 15px;
        }

        .divider {
          height: 1px;
          background-color: #eee;
          margin: 15px 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .info-section {
          margin-bottom: 15px;
        }

        .info-item {
          margin-bottom: 8px;
        }

        .sun-moon-times {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .label {
          font-weight: 600;
          margin-right: 5px;
        }

        .cosmic-score {
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #666;
        }

        @media (max-width: 500px) {
          .container {
            padding: 15px 10px;
          }

          .panel {
            padding: 15px;
          }

          .sun-moon-times {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}