import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function DateNavigator({ selectedDate, setSelectedDate }) {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Day Stepper & Current Date */}
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <button
          onClick={handlePrevDay}
          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition shadow-2xs"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2 flex-1 sm:flex-initial justify-center sm:justify-start">
          <Calendar className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">{formattedDate}</span>
          {isToday && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition shadow-2xs"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Date Jump & Native Picker */}
      <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        {!isToday && (
          <button
            onClick={handleToday}
            className="flex-1 sm:flex-initial text-center text-xs font-bold px-3 py-2 text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200/80 rounded-xl transition active:scale-95"
          >
            Today
          </button>
        )}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-600 transition"
        />
      </div>
    </div>
  );
}
