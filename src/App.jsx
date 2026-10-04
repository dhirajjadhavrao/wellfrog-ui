import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DateNavigator from './components/DateNavigator';
import FinanceHub from './components/FinanceHub';
import LoanEmiHub from './components/LoanEmiHub';
import WorkoutHub from './components/WorkoutHub';
import WorkSessionHub from './components/WorkSessionHub';
import NaukriHub from './components/NaukriHub';
import ActivityManagerModal from './components/ActivityManagerModal';
import { api, getCurrentUser, getToken, clearAuth, setAuth } from './api';
import { 
  Sparkles, 
  Wallet, 
  Landmark, 
  Dumbbell, 
  Briefcase, 
  Target, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Load Dashboard Data
  const loadDashboard = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDailyDashboard(selectedDate);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Auth Expired listener
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setDashboardData(null);
    };
    window.addEventListener('wellfrog_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('wellfrog_auth_expired', handleAuthExpired);
  }, []);

  // Initial token verification & data loading
  useEffect(() => {
    if (user && getToken()) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('wellfrog_user', JSON.stringify(userData));
        })
        .catch(() => {
          clearAuth();
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  // Fast Dev Login shortcut
  const handleDevLogin = async () => {
    try {
      const res = await api.devLogin('dhiraj.jadhavrao@gmail.com', 'Dhiraj Jadhavrao');
      setAuth(res.token, res.user);
      setUser(res.user);
    } catch (e) {
      alert('Login failed: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Top Navbar */}
      <Navbar
        user={user}
        setUser={setUser}
        onOpenActivityManager={() => setIsActivityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!user ? (
          /* Unauthenticated Landing / Fast Login View */
          <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-forest-600 text-white text-4xl shadow-xl shadow-forest-600/20">
              🐸
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Master your daily life with <span className="text-forest-700">Wellfrog</span>
              </h1>
              <p className="text-base text-slate-600 max-w-xl mx-auto">
                A personal activity and routine tracker. Track your daily spend (online &amp; cash), loan EMIs,
                fitness workouts, office hours &amp; tasks, and job application pipeline — all in one minimal workspace.
              </p>
            </div>

            {/* Hub Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-left">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <Wallet className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Daily Spend</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Online UPI &amp; Cash split</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                  <Landmark className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Loans &amp; EMIs</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Paid, pending, failed alerts</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Workouts</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Routines &amp; duration logs</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Office Work</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Hours &amp; task checklists</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Naukri Pipeline</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Applications &amp; rounds</p>
              </div>
            </div>

            {/* Quick Login Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDevLogin}
                className="w-full sm:w-auto px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm rounded-xl shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Sign In as Dhiraj (Dev Login)
              </button>
            </div>
            <p className="text-xs text-slate-400">Multi-tenant ready: Google OAuth &amp; auto-seeding on first login</p>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <>
            {/* Date Navigator & Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="w-full sm:w-auto">
                <DateNavigator
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs"
                  title="Refresh Dashboard"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-forest-600' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-xl transition shadow-2xs sm:hidden"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Activities</span>
                </button>
              </div>
            </div>

            {/* Summary Highlights Pill Bar */}
            {dashboardData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Spend</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      ₹{Number(dashboardData.finance?.totalSpent || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                    ₹
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Work Hours</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {dashboardData.work?.hoursWorked || 0} hrs
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-semibold text-sm">
                    ⏱️
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Workout</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      {dashboardData.workouts?.completed ? (
                        <span className="text-forest-700 text-sm flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done ({dashboardData.workouts.totalMinutes}m)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium">Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-semibold text-sm">
                    🏋️
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">EMI Status</span>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
                      <span className="text-emerald-700">{dashboardData.loans?.paidCount || 0} Paid</span>
                      <span>•</span>
                      <span className="text-amber-700">{dashboardData.loans?.pendingCount || 0} Due</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    🏦
                  </div>
                </div>
              </div>
            )}

            {/* Error banner if any */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="flex-1 font-medium">{error}</div>
                <button
                  onClick={loadDashboard}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 5 Core Hubs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hub 1: Daily Spend (Online & Offline) */}
              <div className="w-full">
                <FinanceHub
                  data={dashboardData?.finance}
                  selectedDate={selectedDate}
                  onRefresh={loadDashboard}
                />
              </div>

              {/* Hub 2: Loans & EMIs Tracker */}
              <div className="w-full">
                <LoanEmiHub
                  data={dashboardData?.loans}
                  onRefresh={loadDashboard}
                />
              </div>

              {/* Hub 3: Fitness & Workout Sessions */}
              <div className="w-full">
                <WorkoutHub
                  data={dashboardData?.workouts}
                  selectedDate={selectedDate}
                  onRefresh={loadDashboard}
                />
              </div>

              {/* Hub 4: Office Work Time & Interactive Tasks */}
              <div className="w-full">
                <WorkSessionHub
                  data={dashboardData?.work}
                  selectedDate={selectedDate}
                  onRefresh={loadDashboard}
                />
              </div>

              {/* Hub 5: Naukri & Career Applications Pipeline (Full width or Col span 2) */}
              <div className="w-full lg:col-span-2">
                <NaukriHub
                  data={dashboardData?.jobs}
                  onRefresh={loadDashboard}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span>🐸 Wellfrog</span>
            <span>•</span>
            <span>Minimalist Life &amp; Activity Tracker</span>
          </div>
          <div>
            Built with Spring Boot 3 + React Monolith • Multi-Tenant Isolated
          </div>
        </div>
      </footer>

      {/* Activity & Sub-Activity Manager Modal */}
      <ActivityManagerModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onActivityChanged={loadDashboard}
      />
    </div>
  );
}
