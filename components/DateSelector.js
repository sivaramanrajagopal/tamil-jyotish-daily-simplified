
import React from 'react';

export default function DateSelector({ selectedDate, setSelectedDate }) {
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="w-full max-w-xs mb-4">
      <input
        type="date"
        value={formatDate(selectedDate)}
        onChange={handleDateChange}
        className="p-2 border rounded-md w-full"
      />
    </div>
  );
}
