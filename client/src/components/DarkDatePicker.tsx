import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DarkDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  error?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DarkDatePicker: React.FC<DarkDatePickerProps> = ({
  value,
  onChange,
  label = 'Sowing Date',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date
  const parsedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-slate-300 mb-1.5 font-medium text-xs">
          {label}
        </label>
      )}

      {/* Input Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-900 border ${
          error ? 'border-red-500' : 'border-slate-700/80 hover:border-slate-600'
        } rounded-2xl px-4 py-3 text-white text-xs flex items-center justify-between transition-colors min-h-[48px]`}
      >
        <span className={value ? 'text-slate-100 font-medium' : 'text-slate-500'}>
          {value || 'Select date (YYYY-MM-DD)'}
        </span>
        <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
      </button>

      {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}

      {/* Dark Popup Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 bg-slate-900 border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-fadein-up">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-200">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const m = String(viewMonth + 1).padStart(2, '0');
              const d = String(dayNum).padStart(2, '0');
              const thisDateStr = `${viewYear}-${m}-${d}`;
              const isSelected = value === thisDateStr;
              const isToday =
                new Date().toISOString().split('T')[0] === thisDateStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold'
                      : isToday
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
