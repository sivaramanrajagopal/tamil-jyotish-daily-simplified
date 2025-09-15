// Nakshatra utilities for RS detection and mapping
// This module contains all nakshatra-related logic to avoid initialization issues

// Complete mapping of English to Tamil nakshatra names
export const nakshatraEnglishToTamil = {
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
  Swathi: "ஸ்வாதி",
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
  // Alternative spellings
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
export const rsNakshatraTamilNames = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

// Alternative spellings for each RS Nakshatra
export const nakshatraAlternatives = {
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

// Mapping for RS Nakshatra group - the 12 nakshatras that should show warnings
export const rsNakshatraGroup = [
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

// Function to check if a nakshatra is an RS Nakshatra
export function isRSNakshatra(mainNakshatra) {
  if (!mainNakshatra) return false;

  // Check if the nakshatra is in Tamil or English
  const isTamilNakshatra = /[\u0B80-\u0BFF]/.test(mainNakshatra);

  // Get appropriate name equivalents
  let englishNakshatraName = "";
  let tamilNakshatraName = "";

  if (isTamilNakshatra) {
    // It's in Tamil
    tamilNakshatraName = mainNakshatra;
    englishNakshatraName = nakshatraEnglishToTamil[mainNakshatra] || "";
  } else {
    // It's in English
    englishNakshatraName = mainNakshatra;
    tamilNakshatraName = nakshatraEnglishToTamil[mainNakshatra] || "";
  }

  // All alternative spellings for RS Nakshatras, flattened into one array
  const rsNakshatraAlternatives = rsNakshatraTamilNames
    .map((name) => nakshatraAlternatives[name] || [])
    .flat();

  // Check all possible ways
  return (
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
  );
}

// Function to get RS Nakshatra info
export function getRSNakshatraInfo(mainNakshatra) {
  if (!isRSNakshatra(mainNakshatra)) return null;

  const isTamilNakshatra = /[\u0B80-\u0BFF]/.test(mainNakshatra);
  const tamilNakshatraName = isTamilNakshatra 
    ? mainNakshatra 
    : nakshatraEnglishToTamil[mainNakshatra] || mainNakshatra;

  return {
    is_rs_nakshatra: true,
    avoid_medical: true,
    avoid_travel: true,
    avoid_financial: true,
    rs_nakshatra_short_desc: "தவிர்க்க வேண்டியவை: மருத்துவ சிகிச்சை, பயணம், நிதி பரிவர்த்தனைகள்",
    nakshatra_name: mainNakshatra,
    nakshatra_name_tamil: tamilNakshatraName,
  };
}
