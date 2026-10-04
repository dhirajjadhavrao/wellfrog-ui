import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DateNavigator from './components/DateNavigator';
import FinanceHub from './components/FinanceHub';
import LoanEmiHub from './components/LoanEmiHub';
import WorkoutHub from './components/WorkoutHub';
import WorkSessionHub from './components/WorkSessionHub';
import NaukriHub from './components/NaukriHub';
import CustomActivityHub from './components/CustomActivityHub';
import ActivityManagerModal from './components/ActivityManagerModal';
import ActivityIcon from './components/ActivityIcon';
import MobileBottomNav from './components/MobileBottomNav';
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

import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setDashboardData(null);
  };

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

  // Handle Google OAuth redirect callback (URL hash contains id_token or access_token)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');

    if (idToken) {
      window.history.replaceState(null, '', window.location.pathname);
      setLoading(true);
      api.loginWithGoogle(idToken)
        .then((res) => {
          setAuth(res.token, res.user);
          setUser(res.user);
        })
        .catch((err) => {
          setError(err.message || 'Google authentication failed');
        })
        .finally(() => setLoading(false));
    } else if (accessToken) {
      window.history.replaceState(null, '', window.location.pathname);
      setLoading(true);
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((r) => r.json())
        .then((googleUser) => {
          return api.emailAuth(googleUser.email, googleUser.name, true);
        })
        .then((res) => {
          setAuth(res.token, res.user);
          setUser(res.user);
        })
        .catch((err) => {
          setError(err.message || 'Google authentication failed');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleDeactivateActivity = async (activity) => {
    if (!activity) return;
    try {
      await api.toggleActivityActive(activity.id, false);
      await loadDashboard();
    } catch (err) {
      alert('Failed to deactivate activity: ' + err.message);
    }
  };

  const rootActivities = dashboardData?.activities || [];
  const subActivities = dashboardData?.subActivities || [];
  const activityLogs = dashboardData?.activityLogs || [];
  const activeRootActivities = rootActivities.filter((act) => act.active !== false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Top Navbar */}
      <Navbar
        user={user}
        setUser={setUser}
        onOpenActivityManager={() => setIsActivityModalOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6">
        {!user ? (
          /* Unauthenticated Landing / Sign In & Sign Up Screen */
          <div className="py-6 space-y-10 animate-in fade-in duration-300">
            {/* Top Hero copy */}
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Welcome to <span className="text-forest-700">Wellfrog</span>
              </h1>
              <p className="text-sm text-slate-600">
                Track your daily spend (online &amp; cash), loans &amp; EMIs, workout routines, office tasks, and job applications.
              </p>
            </div>

            {/* Embedded Auth Card with Sign In / Sign Up Tabs & Google Login */}
            <div className="max-w-md mx-auto">
              <AuthModal
                isModal={false}
                initialMode={authMode}
                onAuthSuccess={(loggedUser) => setUser(loggedUser)}
              />
            </div>

            {/* 5 Core Hubs Features Preview */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Everything you track in one place</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold">
                    ₹
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
            </div>
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

            {/* Dynamic Summary Highlights Pill Bar */}
            {dashboardData && activeRootActivities.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {activeRootActivities.map((act) => {
                  if (act.categoryType === 'FINANCE') {
                    return (
                      <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
                    );
                  }
                  if (act.categoryType === 'WORK_TIME') {
                    return (
                      <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
                    );
                  }
                  if (act.categoryType === 'WORKOUT') {
                    return (
                      <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
                    );
                  }
                  if (act.categoryType === 'LOANS') {
                    return (
                      <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
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
                    );
                  }
                  if (act.categoryType === 'CAREER') {
                    return (
                      <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Naukri Pipeline</span>
                          <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                            <span className="text-blue-700">{dashboardData.jobs?.appliedCount || 0} Applied</span>
                            <span>•</span>
                            <span className="text-amber-700">{dashboardData.jobs?.interviewCount || 0} Int.</span>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm">
                          🎯
                        </div>
                      </div>
                    );
                  }

                  // Custom Activity highlight pill
                  const customLogs = activityLogs.filter((l) => l.activityId === act.id);
                  const sumValue = customLogs.reduce((acc, l) => acc + (l.numericValue || 0), 0);
                  return (
                    <div key={act.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase truncate block max-w-[110px]">
                          {act.name}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {customLogs.length > 0 ? (
                            act.unit === 'MINUTES' ? `${sumValue}m` :
                            act.unit === 'HOURS' ? `${sumValue}h` :
                            act.unit === 'AMOUNT' ? `₹${sumValue.toLocaleString()}` :
                            act.unit === 'CHECK' ? 'Done ✓' : `${sumValue} count`
                          ) : (
                            <span className="text-slate-400 font-medium">0 logged</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold shadow-2xs border border-slate-100"
                        style={{ backgroundColor: `${act.color || '#386641'}15`, color: act.color || '#386641' }}
                      >
                        <ActivityIcon icon={act.icon} categoryType={act.categoryType} className="w-4 h-4" fallback="⚡" />
                      </div>
                    </div>
                  );
                })}
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

            {/* Dynamic Activity Tiles Grid */}
            {activeRootActivities.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-6 shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto text-3xl font-bold">
                  🐸
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">All activity tiles are currently deactivated</h3>
                  <p className="text-xs text-slate-500">
                    Your tracked data is completely safe. You can re-activate any activity or create new custom tracking tiles anytime.
                  </p>
                </div>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Activities Manager</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeRootActivities.map((act) => {
                  switch (act.categoryType) {
                    case 'FINANCE':
                      return (
                        <div key={act.id} className="w-full">
                          <FinanceHub
                            activity={act}
                            data={dashboardData?.finance}
                            selectedDate={selectedDate}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                    case 'LOANS':
                      return (
                        <div key={act.id} className="w-full">
                          <LoanEmiHub
                            activity={act}
                            data={dashboardData?.loans}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                    case 'WORKOUT':
                      return (
                        <div key={act.id} className="w-full">
                          <WorkoutHub
                            activity={act}
                            data={dashboardData?.workouts}
                            selectedDate={selectedDate}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                    case 'WORK_TIME':
                      return (
                        <div key={act.id} className="w-full">
                          <WorkSessionHub
                            activity={act}
                            data={dashboardData?.work}
                            selectedDate={selectedDate}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                    case 'CAREER':
                      return (
                        <div key={act.id} className="w-full">
                          <NaukriHub
                            activity={act}
                            data={dashboardData?.jobs}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                    default:
                      return (
                        <div key={act.id} className="w-full">
                          <CustomActivityHub
                            activity={act}
                            subActivities={subActivities.filter((s) => s.parentId === act.id)}
                            logs={activityLogs.filter((l) => l.activityId === act.id)}
                            selectedDate={selectedDate}
                            onRefresh={loadDashboard}
                            onDeactivate={handleDeactivateActivity}
                          />
                        </div>
                      );
                  }
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 pb-24 sm:pb-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
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

      {/* Mobile Bottom Navigation Bar (sm:hidden) */}
      <MobileBottomNav
        user={user}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        activeCount={activeRootActivities.length}
        onOpenActivityManager={() => setIsActivityModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Activity & Sub-Activity Manager Modal */}
      <ActivityManagerModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onActivityChanged={loadDashboard}
      />

      {/* Auth Modal (when triggered from Navbar) */}
      {isAuthModalOpen && !user && (
        <AuthModal
          isModal={true}
          initialMode={authMode}
          onAuthSuccess={(loggedUser) => {
            setUser(loggedUser);
            setIsAuthModalOpen(false);
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
