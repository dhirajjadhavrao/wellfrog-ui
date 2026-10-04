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
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-4 h-4 text-forest-600" />
          <span className="text-sm font-bold text-slate-800">{formattedDate}</span>
          {isToday && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1 text-slate-600 hover:text-forest-700 hover:bg-slate-100 rounded-lg transition"
          >
            Jump to Today
          </button>
        )}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
        />
      </div>
    </div>
  );
}
