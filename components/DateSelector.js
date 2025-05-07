
import React from 'react';
import DatePicker from 'react-datepicker';

export default function DateSelector({ selectedDate, setSelectedDate }) {
  return (
    <div className="w-full max-w-xs mb-4">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="MMMM d, yyyy"
        className="p-2 border rounded-md w-full"
      />
    </div>
  );
}
