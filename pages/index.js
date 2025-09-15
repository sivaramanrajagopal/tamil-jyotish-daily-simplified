// pages/index.js
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import CalendarSync from "../components/CalendarSync";

// Complete mapping of English to Tamil nakshatra names, including alternatives
const nakshatraEnglishToTamil = {
  Ashwini: "அசுவினி",
  Bharani: "பரணி",
  Krittika: "கார்த்திகை",
  Rohini: "ரோகிணி",
  Mrigasira: "மிருகசீரிஷம்",
  Ardra: "திருவாதிரை",
  Punarvasu: "புனர்பூசம்",
  Pushya: "பூசம்",
  Ashlesha: "ஆயில்யம்",
  Magha: "மகம்",
  "Purva Phalguni": "பூரம்",
  "Uttara Phalguni": "உத்திரம்",
  Hasta: "ஹஸ்தம்",
  Chitra: "சித்திரை",
  Swati: "சுவாதி",
  Swathi: "ஸ்வாதி", // Added specific mapping for Swathi with alternative spelling
  Vishakha: "விசாகம்",
  Anuradha: "அனுஷம்",
  Jyeshtha: "கேட்டை",
  Mula: "மூலம்",
  "Purva Ashadha": "பூராடம்",
  "Uttara Ashadha": "உத்திராடம்",
  Shravana: "திருவோணம்",
  Dhanishta: "அவிட்டம்",
  Shatabhisha: "சதயம்",
  "Purva Bhadrapada": "பூரட்டாதி",
  "Uttara Bhadrapada": "உத்திரட்டாதி",
  Revati: "ரேவதி",
  // Alternative spellings and variations
  "Mrigasira": "மிருகசீரிடம்",
  "Mrigashira": "மிருகசீரிடம்",
  "Mrigashirsha": "மிருகசீரிடம்",
  "Arudra": "திருவாதிரை",
  "Punarvasu": "புனர்பூசம்",
  "Punarpusam": "புனர்பூசம்",
  "Pushyami": "பூசம்",
  "Ashlesha": "ஆயில்யம்",
  "Ayilyam": "ஆயில்யம்",
  "Makha": "மகம்",
  "Magha": "மகம்",
  "Purva Phalguni": "பூரம்",
  "Pooram": "பூரம்",
  "Uttara Phalguni": "உத்திரம்",
  "Uthiram": "உத்திரம்",
  "Hastam": "ஹஸ்தம்",
  "Chithira": "சித்திரை",
  "Chithirai": "சித்திரை",
  "Swathi": "சுவாதி",
  "Visakha": "விசாகம்",
  "Vishakam": "விசாகம்",
  "Anuradha": "அனுஷம்",
  "Anusham": "அனுஷம்",
  "Jyeshta": "கேட்டை",
  "Kettai": "கேட்டை",
  "Moolam": "மூலம்",
  "Purva Ashadha": "பூராடம்",
  "Pooradam": "பூராடம்",
  "Uttara Ashadha": "உத்திராடம்",
  "Uthirattadhi": "உத்திராடம்",
  "Shravana": "திருவோணம்",
  "Thiruvonam": "திருவோணம்",
  "Dhanishta": "அவிட்டம்",
  "Avittam": "அவிட்டம்",
  "Shatabhisha": "சதயம்",
  "Sadayam": "சதயம்",
  "Purva Bhadrapada": "பூரட்டாதி",
  "Poorattadhi": "பூரட்டாதி",
  "Uttara Bhadrapada": "உத்திரட்டாதி",
  "Uthirattadhi": "உத்திரட்டாதி",
  "Revati": "ரேவதி",
  "Revathi": "ரேவதி"
};

// RS Nakshatra Tamil names
const rsNakshatraTamilNames = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

// Alternative spellings for each RS Nakshatra
const nakshatraAlternatives = {
  "அசுவினி": ["அசுவினி", "அசுவினி"],
  "பரணி": ["பரணி", "பரணி"],
  "கார்த்திகை": ["கார்த்திகை", "கார்த்திகை"],
  "ரோகிணி": ["ரோகிணி", "ரோகிணி"],
  "மிருகசீரிடம்": ["மிருகசீரிடம்", "மிருகசீரிஷம்", "மிருகசீரிடம்"],
  "திருவாதிரை": ["திருவாதிரை", "திருவாதிரை"],
  "புனர்பூசம்": ["புனர்பூசம்", "புனர்பூசம்"],
  "பூசம்": ["பூசம்", "பூசம்"],
  "ஆயில்யம்": ["ஆயில்யம்", "ஆயில்யம்"],
  "மகம்": ["மகம்", "மகம்"],
  "பூரம்": ["பூரம்", "பூரம்"],
  "உத்திரம்": ["உத்திரம்", "உத்திரம்"],
  "ஹஸ்தம்": ["ஹஸ்தம்", "ஹஸ்தம்"],
  "சித்திரை": ["சித்திரை", "சித்திரை"],
  "சுவாதி": ["சுவாதி", "ஸ்வாதி"],
  "விசாகம்": ["விசாகம்", "விசாகம்"],
  "அனுஷம்": ["அனுஷம்", "அனுஷம்"],
  "கேட்டை": ["கேட்டை", "கேட்டை"],
  "மூலம்": ["மூலம்", "மூலம்"],
  "பூராடம்": ["பூராடம்", "பூராடம்"],
  "உத்திராடம்": ["உத்திராடம்", "உத்திராடம்"],
  "திருவோணம்": ["திருவோணம்", "திருவோணம்"],
  "அவிட்டம்": ["அவிட்டம்", "அவிட்டம்"],
  "சதயம்": ["சதயம்", "சதயம்"],
  "பூரட்டாதி": ["பூரட்டாதி", "பூரட்டாதி"],
  "உத்திரட்டாதி": ["உத்திரட்டாதி", "உத்திரட்டாதி"],
  "ரேவதி": ["ரேவதி", "ரேவதி"]
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panchangamData, setPanchangamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsNakshatraInfo, setRsNakshatraInfo] = useState(null);

  // Preload voices on iOS
  useEffect(() => {
    const dummy = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(dummy);
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    fetchPanchangamData(selectedDate);
  }, [selectedDate, fetchPanchangamData]);

  // Reverse mapping for Tamil to English (helpful for detection)
  const nakshatraTamilToEnglish = {};
  Object.entries(nakshatraEnglishToTamil).forEach(([english, tamil]) => {
    nakshatraTamilToEnglish[tamil] = english;
  });

  // Mapping for RS Nakshatra group - the 12 nakshatras that should show warnings
  const rsNakshatraGroup = [
    "Bharani",
    "Krittika",
    "Ardra",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Chitra",
    "Swati",
    "Swathi",
    "Vishakha",
    "Jyeshtha",
    "Purva Ashadha",
    "Purva Bhadrapada",
  ];

  // All alternative spellings for RS Nakshatras, flattened into one array
  const rsNakshatraAlternatives = rsNakshatraTamilNames
    .map((name) => nakshatraAlternatives[name] || [])
    .flat();

  const fetchPanchangamData = useCallback(async (date) => {
    setLoading(true);
    const formattedDate = date.toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("daily_panchangam")
      .select("*")
      .eq("date", formattedDate)
      .single();

    if (error) {
      console.error("Error fetching panchangam:", error);
      setLoading(false);
      setPanchangamData(null);
      return;
    }

    if (!data) {
      setLoading(false);
      setPanchangamData(null);
      return;
    }

    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    try {
      const { data: yogamData, error: yogamError } = await supabase.rpc(
        "get_nakshatra_yogam",
        {
          nakshatra_name: data.main_nakshatra,
          day_name: dayOfWeek,
        },
      );

      if (yogamError) throw yogamError;

      // Extract nakshatra names from the data
      const mainNakshatra = data.main_nakshatra;

      // Check if the nakshatra is in Tamil or English
      const isTamilNakshatra = /[\u0B80-\u0BFF]/.test(mainNakshatra);

      // Get appropriate name equivalents
      let englishNakshatraName = "";
      let tamilNakshatraName = "";

      if (isTamilNakshatra) {
        // It's in Tamil
        tamilNakshatraName = mainNakshatra;
        englishNakshatraName = nakshatraTamilToEnglish[mainNakshatra] || "";
      } else {
        // It's in English
        englishNakshatraName = mainNakshatra;
        tamilNakshatraName = nakshatraEnglishToTamil[mainNakshatra] || "";
      }

      // Debug log
      console.log("Current nakshatra:", mainNakshatra);
      console.log("Is Tamil:", isTamilNakshatra);
      console.log("English equivalent:", englishNakshatraName);
      console.log("Tamil equivalent:", tamilNakshatraName);

      // Determine if this is an RS Nakshatra
      let isRSNakshatra = false;

      // Check all possible ways
      if (
        // 1. Check against English list
        rsNakshatraGroup.includes(englishNakshatraName) ||
        rsNakshatraGroup.includes(mainNakshatra) ||
        // 2. Check against Tamil list
        rsNakshatraTamilNames.includes(tamilNakshatraName) ||
        rsNakshatraTamilNames.includes(mainNakshatra) ||
        // 3. Special case for Swati/Swathi
        mainNakshatra === "Swati" ||
        mainNakshatra === "Swathi" ||
        mainNakshatra === "ஸ்வாதி" ||
        mainNakshatra === "சுவாதி" ||
        // 4. Check against alternative spellings
        rsNakshatraAlternatives.includes(mainNakshatra)
      ) {
        isRSNakshatra = true;
      }

      // Set RS Nakshatra info if found
      if (isRSNakshatra) {
        setRsNakshatraInfo({
          is_rs_nakshatra: true,
          avoid_medical: true,
          avoid_travel: true,
          avoid_financial: true,
          rs_nakshatra_short_desc:
            "தவிர்க்க வேண்டியவை: மருத்துவ சிகிச்சை, பயணம், நிதி பரிவர்த்தனைகள்",
          nakshatra_name: mainNakshatra,
          nakshatra_name_tamil: isTamilNakshatra
            ? mainNakshatra
            : tamilNakshatraName,
        });
        console.log("RS Nakshatra detected!");
      } else {
        setRsNakshatraInfo(null);
        console.log("Not an RS Nakshatra");
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
      console.error("Error fetching nakshatra yogam:", e);
      setPanchangamData(data);
    }

    setLoading(false);
  }, []);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const formatDateForInput = (date) => date.toISOString().split("T")[0];

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const date = new Date(timeStr);
    return date.toISOString().substring(11, 16); // HH:MM format
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    return `${day} ${month} ${year}`;
  };

  const getSpecialDay = (data) => {
    if (!data) return "Normal Day";
    if (data.is_pournami) return "பௌர்ணமி (Full Moon Day)";
    if (data.is_amavasai) return "அமாவாசை (New Moon Day)";
    if (data.is_ekadashi) return "ஏகாதசி (Ekadashi)";
    if (data.is_dwadashi) return "துவாதசி (Dwadashi)";
    if (data.is_ashtami) return "அஷ்டமி (Ashtami)";
    if (data.is_navami) return "நவமி (Navami)";
    if (data.is_trayodashi) return "திரயோதசி (Trayodashi)";
    if (data.is_sashti) return "சஷ்டி (Sashti)";
    return "Normal Day";
  };

  // Component for moon phase indicator
  const MoonPhaseIndicator = ({ isValarPirai, isTheiPirai }) => {
    if (isValarPirai) {
      return (
        <span className="moon-phase valar-pirai">
          <span className="moon-arrow">⬆</span>
          <span className="moon-text">வளர்பிறை</span>
        </span>
      );
    } else if (isTheiPirai) {
      return (
        <span className="moon-phase thei-pirai">
          <span className="moon-arrow">⬇</span>
          <span className="moon-text">தேய்பிறை</span>
        </span>
      );
    }
    return null;
  };

  const speakContent = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in your browser");
      return;
    }
    if (!panchangamData) return;

    window.speechSynthesis.cancel();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    const createTextChunks = () => {
      const today = new Date(panchangamData.date);
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      const chunks = [
        `இன்றைய பஞ்சாங்கம் ${formattedDate}.`,
        `கிழமை: ${panchangamData.vaara}.`,
        `நட்சத்திரம்: ${panchangamData.main_nakshatra || ""}.`,
        `நட்சத்திர யோகம்: ${panchangamData.nakshatra_yogam || ""}.`,
        `திதி: ${(panchangamData.tithi && getFirstItem(panchangamData.tithi)?.name) || ""}.`,
      ];

      // Add moon phase info to speech
      if (panchangamData.is_valar_pirai) {
        chunks.push(`சந்திரன் நிலை: வளர்பிறை.`);
      } else if (panchangamData.is_thei_pirai) {
        chunks.push(`சந்திரன் நிலை: தேய்பிறை.`);
      }

      chunks.push(
        `ராகு காலம்: ${panchangamData.rahu_kalam || ""}.`,
        `எமகண்டம்: ${panchangamData.yamagandam || ""}.`,
        `சந்திராஷ்டமம்: ${convertChandrashtamaToTamil(panchangamData.chandrashtama_for) || ""}.`,
        `விசேஷ நாள்: ${getSpecialDay(panchangamData)}.`,
      );

      // Add RS Nakshatra warning if applicable
      if (rsNakshatraInfo) {
        chunks.push(
          `கவனம்! இன்று ${rsNakshatraInfo.nakshatra_name_tamil || rsNakshatraInfo.nakshatra_name} தீதுரு நட்சத்திரம்.`,
          `இந்த நட்சத்திரத்தில் மருத்துவ சிகிச்சை, பயணம், மற்றும் பண பரிவர்த்தனை தவிர்க்க வேண்டும்.`,
        );
      }

      return chunks;
    };

    const speakInSequence = () => {
      const chunks = createTextChunks();
      const voices = window.speechSynthesis.getVoices();
      console.log(
        "Available voices:",
        voices.map((v) => `${v.name} (${v.lang})`),
      );

      let tamilVoice = voices.find(
        (v) =>
          (v.lang === "ta-IN" || v.lang.startsWith("ta")) &&
          v.name.toLowerCase().includes("female"),
      );

      if (!tamilVoice) {
        tamilVoice = voices.find(
          (v) =>
            (v.lang === "hi-IN" || v.lang.startsWith("en")) &&
            v.name.toLowerCase().includes("female"),
        );
      }

      if (!tamilVoice) {
        console.warn("Tamil voice not available. Using default voice.");
      }

      console.log("Selected voice:", tamilVoice ? tamilVoice.name : "Default");

      let chunkIndex = 0;
      const speakNextChunk = () => {
        if (chunkIndex < chunks.length) {
          const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
          utterance.lang = tamilVoice?.lang || "ta-IN";
          utterance.rate = isMobile ? 0.7 : 0.8;

          if (tamilVoice) {
            utterance.voice = tamilVoice;
            utterance.voiceURI = tamilVoice.voiceURI;
          }

          utterance.onend = () => {
            chunkIndex++;
            setTimeout(speakNextChunk, 300);
          };

          utterance.onerror = (e) => {
            console.error("Speech error:", e);
            chunkIndex++;
            setTimeout(speakNextChunk, 300);
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      speakNextChunk();
    };

    if (isiOS) {
      setTimeout(speakInSequence, 300);
    } else {
      speakInSequence();
    }
  };

  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === "object") return field;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error("Error parsing JSON string:", e);
        return null;
      }
    }
    return null;
  };

  const getFirstItem = (field) => {
    const parsed = parseJsonField(field);
    if (!parsed) return null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    if (typeof parsed === "object" && parsed !== null) {
      if (parsed[0]) return parsed[0];
      const firstKey = Object.keys(parsed)[0];
      if (firstKey) return parsed[firstKey];
    }
    return null;
  };

  // Convert English nakshatra names to Tamil
  const convertChandrashtamaToTamil = (englishNames) => {
    if (!englishNames) return "N/A";

    if (Array.isArray(englishNames)) {
      return englishNames
        .map((name) => nakshatraEnglishToTamil[name] || name)
        .join(", ");
    }

    if (typeof englishNames === "string") {
      return nakshatraEnglishToTamil[englishNames] || englishNames;
    }

    return "N/A";
  };

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

        {/* Add the Read Aloud button */}
        <button
          onClick={speakContent}
          style={{
            margin: "10px auto",
            display: "block",
            padding: "8px 15px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          disabled={loading || !panchangamData}
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
          <div className="panel">Loading panchangam data...</div>
        ) : !panchangamData ? (
          <div className="panel">No data available for this date</div>
        ) : (
          <div className="panel">
            {/* Basic date and day */}
            <div className="basic-info">
              <div className="info-item">
                <span className="label">📅 Date: </span>
                {formatDate(panchangamData.date)}
              </div>
              <div className="info-item">
                <span className="label">📆 Day: </span>
                {panchangamData.vaara || "Day"}
              </div>
            </div>

            <div className="divider"></div>

            {/* Star information */}
            <div className="info-section">
              <div className="info-item">
                <span className="label">🌟 Main Nakshatra: </span>
                <span>
                  {panchangamData.main_nakshatra || "N/A"}
                  {/* Add RS badge if applicable with space */}
                  {rsNakshatraInfo && <span className="rs-badge">RS</span>}
                </span>
              </div>
              <div className="info-item">
                <span className="label">🔮 Nakshatra Yogam: </span>
                {panchangamData.nakshatra_yogam || "N/A"}
              </div>
            </div>

            {/* Tithi, Yogam, Karanam */}
            <div className="info-section">
              <div className="info-item">
                <span className="label">🌗 Tithi: </span>
                <span>
                  {(panchangamData.tithi &&
                    getFirstItem(panchangamData.tithi)?.name) ||
                    "N/A"}
                  {/* Add moon phase indicator with proper spacing */}
                  {(panchangamData.is_valar_pirai ||
                    panchangamData.is_thei_pirai) && (
                    <MoonPhaseIndicator
                      isValarPirai={panchangamData.is_valar_pirai}
                      isTheiPirai={panchangamData.is_thei_pirai}
                    />
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="label">✨ Yogam: </span>
                {(panchangamData.yoga &&
                  getFirstItem(panchangamData.yoga)?.name) ||
                  "N/A"}
              </div>
              <div className="info-item">
                <span className="label">🌓 Karanam: </span>
                {(panchangamData.karana &&
                  getFirstItem(panchangamData.karana)?.name) ||
                  "N/A"}
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
                {panchangamData.rahu_kalam || "N/A"}
              </div>
              <div className="info-item">
                <span className="label">⏱️ Yamagandam: </span>
                {panchangamData.yamagandam || "N/A"}
              </div>
              <div className="info-item">
                <span className="label">⏳ Kuligai: </span>
                {panchangamData.kuligai || "N/A"}
              </div>
              <div className="info-item">
                <span className="label">✅ Abhijit Muhurta: </span>
                {panchangamData.abhijit_muhurta || "N/A"}
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
                  {convertChandrashtamaToTamil(
                    panchangamData.chandrashtama_for,
                  )}
                </div>
              )}

              <div className="info-item cosmic-score">
                <span className="label">🌿 Cosmic Score: </span>
                {panchangamData.cosmic_score
                  ? `${panchangamData.cosmic_score}/10`
                  : "N/A"}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p> Creation {new Date().getFullYear()} Sivaraman Rajagopal</p>
      </footer>

      <style jsx>{`
        /* Basic styling */
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
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
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

        .moon-phase {
          display: inline-flex;
          align-items: center;
          margin-left: 8px;
          font-size: 0.9rem;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: transparent;
        }

        .moon-arrow {
          font-size: 14px;
          font-weight: bold;
          margin-right: 4px;
        }

        .valar-pirai .moon-arrow {
          color: #22c55e; /* Explicit green color */
        }

        .thei-pirai .moon-arrow {
          color: #ef4444; /* Explicit red color */
        }

        .moon-text {
          font-size: 12px;
          margin-left: 2px;
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
