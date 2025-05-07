
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateSelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export default function DateSelector({ selectedDate, setSelectedDate }: DateSelectorProps) {
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
