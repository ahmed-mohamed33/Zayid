import React from 'react';
import CalendarIcon from '../../assets/icons/calendar-2.svg';

function DateInputField({ label, value, onChange, error }) {
  return (
    <div className="relative w-full mb-4">
      <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: none;
        }
        input[type="datetime-local"]::-moz-calendar-picker-indicator {
          display: none;
        }
      `}</style>


      {label && (
        <label className="text-[18px] font-normal text-[#2d3142] mb-1 block">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="datetime-local"
          value={value}
          onChange={onChange}
          className={`w-full h-[56px] pr-12 pl-4 rounded-lg border ${
            error ? 'border-red-500' : 'border-[#bfc0c0]'
          } bg-white outline-none cursor-pointer text-[#2d3142]`}
        />
        <img
          src={CalendarIcon}
          alt="Calendar"
          className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default DateInputField;
