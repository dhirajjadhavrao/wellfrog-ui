import React, { useState } from 'react';
import { Home, Calendar, Layers, User, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function MobileBottomNav({
  user,
  selectedDate,
  setSelectedDate,
  activeCount = 0,
  onOpenActivityManager,
  onOpenAuth,
  onLogout
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowDatePicker(false);
  };

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Docked at bottom, hidden on tablet/desktop) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe">
        <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-center px-1">
          
          {/* Tab 1: Today Overview */}
          <button
            onClick={handleToday}
            className={`flex flex-col items-center justify-center h-full transition active:scale-95 ${
              isToday ? 'text-forest-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight tracking-tight">Today</span>
          </button>

          {/* Tab 2: Calendar / Date Picker Drawer */}
          <button
            onClick={() => setShowDatePicker(true)}
            className={`flex flex-col items-center justify-center h-full transition active:scale-95 ${
              !isToday ? 'text-forest-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight tracking-tight">
              {isToday ? 'Calendar' : formattedDate}
            </span>
          </button>

          {/* Tab 3: Activities Manager */}
          <button
            onClick={onOpenActivityManager}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-forest-700 transition active:scale-95 relative"
          >
            <div className="relative">
              <Layers className="w-5 h-5 mb-0.5" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-forest-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {activeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight tracking-tight">Activities</span>
          </button>

          {/* Tab 4: Profile / Auth */}
          {user ? (
            <button
              onClick={() => setShowProfileSheet(true)}
              className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-forest-700 transition active:scale-95"
            >
              {user.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.name}
                  className="w-5 h-5 rounded-full border border-forest-600 mb-0.5"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-forest-100 text-forest-700 text-[10px] font-bold flex items-center justify-center mb-0.5 border border-forest-300">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-[10px] leading-tight tracking-tight truncate max-w-[60px]">
                Account
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth('signin')}
              className="flex flex-col items-center justify-center h-full text-forest-700 font-bold transition active:scale-95"
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight tracking-tight">Sign In</span>
            </button>
          )}

        </div>
      </nav>

      {/* Date Picker Mobile Bottom Sheet */}
      {showDatePicker && (
        <div className="sm:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl p-5 pb-safe shadow-2xl border-t border-slate-200 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Drag Pill */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                <h3 className="text-sm font-bold text-slate-800">Select Date</h3>
              </div>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Step Bar */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-200">
              <button
                onClick={handlePrevDay}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 active:scale-95 text-slate-700"
                title="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="text-sm font-extrabold text-slate-900">{formattedDate}</div>
                {isToday ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    • Today •
                  </span>
                ) : (
                  <button
                    onClick={handleToday}
                    className="text-[11px] font-bold text-forest-600 underline"
                  >
                    Jump to Today
                  </button>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 active:scale-95 text-slate-700"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Native Date Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pick specific calendar date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setShowDatePicker(false);
                  }
                }}
                className="w-full text-sm font-medium border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white"
              />
            </div>

            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full py-3 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Profile & Sign Out Bottom Sheet for Mobile */}
      {showProfileSheet && user && (
        <div className="sm:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl p-6 pb-safe shadow-2xl border-t border-slate-200 space-y-5 animate-in slide-in-from-bottom duration-200">
            {/* Drag Pill */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Your Account</h3>
              <button
                onClick={() => setShowProfileSheet(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {user.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-forest-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowProfileSheet(false);
                  onOpenActivityManager();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition active:scale-95"
              >
                <Layers className="w-4 h-4 text-forest-700" />
                <span>Manage Activities &amp; Sub-tasks</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileSheet(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-700 transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Wellfrog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
