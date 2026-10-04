import React, { useState } from 'react';
import { LogOut, User as UserIcon, Plus, Sparkles, Layers } from 'lucide-react';
import { api, setAuth, clearAuth } from '../api';

export default function Navbar({ user, setUser, onOpenActivityManager, onOpenAuth }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center text-lg sm:text-xl shadow-xs shrink-0">
            🐸
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-forest-900 leading-none">Wellfrog</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Life &amp; Activity OS</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={onOpenActivityManager}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-lg border border-forest-200 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                Activities &amp; Subs
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.pictureUrl ? (
                  <img src={user.pictureUrl} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{user.email}</div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth && onOpenAuth('signin')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-forest-700 hover:bg-slate-100 rounded-xl transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-xl shadow-xs transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
