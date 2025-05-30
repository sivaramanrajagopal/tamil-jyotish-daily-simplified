
import React from 'react';
import { format } from 'date-fns';

export default function PanchangamDisplay({ panchangamData, loading }) {
  if (loading) {
    return <div className="text-center p-4">Loading panchangam data...</div>;
  }

  if (!panchangamData) {
    return <div className="text-center p-4">No data available for this date</div>;
  }

  // Format sunrise/sunset times
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const date = new Date(timeStr);
    return format(date, 'h:mm a');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Basic Information */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-700 border-b pb-2">📅 Basic Information</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">📆 Day:</span> {panchangamData.vaara || format(new Date(panchangamData.date), 'EEEE')}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌗 Tithi:</span> {panchangamData.tithi?.name || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Stars & Yogams */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-700 border-b pb-2">🌟 Stars & Cosmic Influences</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌟 Nakshatra:</span> {panchangamData.main_nakshatra || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🔮 Nakshatra Yogam:</span> {panchangamData.nakshatra_yogam || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">✨ Yoga:</span> {panchangamData.yoga?.name || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🪐 Karana:</span> {panchangamData.karana?.name || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Timings */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-700 border-b pb-2">⏱️ Timings</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌅 Sunrise:</span> {formatTime(panchangamData.sunrise)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌇 Sunset:</span> {formatTime(panchangamData.sunset)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌕 Moonrise:</span> {formatTime(panchangamData.moonrise)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">🌑 Moonset:</span> {formatTime(panchangamData.moonset)}</p>
          </div>
        </div>
      </section>

      {/* Auspicious & Inauspicious Times */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-700 border-b pb-2">⚠️ Auspicious & Inauspicious Times</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">⚠️ Rahu Kalam:</span> {panchangamData.rahu_kalam || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">⏱️ Yamagandam:</span> {panchangamData.yamagandam || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">⏳ Kuligai:</span> {panchangamData.kuligai || 'N/A'}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p><span className="font-medium">✅ Abhijit Muhurta:</span> {panchangamData.abhijit_muhurta || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Special Information */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-indigo-700 border-b pb-2">🎉 Special Information</h2>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <p><span className="font-medium">🎉 Special Day:</span> {(panchangamData.is_amavasai && 'Amavasai') || 
              (panchangamData.is_pournami && 'Pournami') || 
              (panchangamData.is_ekadashi && 'Ekadashi') ||
              (panchangamData.is_ashtami && 'Ashtami') ||
              'Normal Day'}</p>
          </div>
          <div>
            <p><span className="font-medium">🌿 Cosmic Score:</span> {panchangamData.cosmic_score || 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-medium">🏆 Tarabalam Type:</span> {panchangamData.tarabalam_type || 'N/A'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
