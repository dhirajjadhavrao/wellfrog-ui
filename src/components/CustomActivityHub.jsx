import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, Trash2, EyeOff, Layers, ChevronDown } from 'lucide-react';
import { api } from '../api';
import ActivityIcon, { getActivityEmoji } from './ActivityIcon';

export default function CustomActivityHub({
  activity,
  subActivities = [],
  logs = [],
  selectedDate,
  onRefresh,
  onDeactivate
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [subActivityId, setSubActivityId] = useState('');
  const [numericValue, setNumericValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute metrics
  const totalValue = logs.reduce((acc, l) => acc + (l.numericValue || 0), 0);
  const isCompleted = logs.length > 0;

  const formatUnitValue = (val, unit) => {
    switch (unit) {
      case 'MINUTES':
        return `${val} mins`;
      case 'HOURS':
        return `${val} hrs`;
      case 'AMOUNT':
        return `₹${Number(val).toLocaleString()}`;
      case 'COUNT':
        return `${val} count`;
      case 'CHECK':
        return val > 0 ? 'Completed' : 'Pending';
      default:
        return `${val} ${unit?.toLowerCase() || ''}`;
    }
  };

  const handleLogProgress = async (e) => {
    e.preventDefault();
    const isCheckUnit = activity?.unit === 'CHECK';
    const num = isCheckUnit ? 1 : parseFloat(numericValue);

    if (!isCheckUnit && (isNaN(num) || num <= 0)) {
      alert('Please enter a valid numeric value');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.logActivityProgress({
        activityId: activity.id,
        subActivityId: subActivityId ? parseInt(subActivityId, 10) : null,
        logDate: selectedDate,
        numericValue: num,
        textValue: textValue.trim() || null,
      });

      setNumericValue('');
      setTextValue('');
      setSubActivityId('');
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to log progress: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Delete this activity entry?')) return;
    try {
      await api.deleteActivityLog(logId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete log: ' + err.message);
    }
  };

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate(activity);
    }
  };

  const themeColor = activity?.color || '#386641';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-150">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xs border border-slate-200/60"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              <ActivityIcon icon={activity?.icon} categoryType={activity?.categoryType} className="w-5 h-5" fallback="⚡" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{activity?.name || 'Activity'}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                  {activity?.unit || 'Custom'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {subActivities.length > 0 ? `${subActivities.length} sub-activities configured` : 'Configurable Activity Hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition"
              style={{ backgroundColor: themeColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Close' : 'Log Entry'}</span>
            </button>

            <button
              onClick={handleDeactivate}
              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
              title="Deactivate and hide from dashboard (keeps all data safe)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Status Strip */}
        <div
          className="flex items-center justify-between my-4 p-3 rounded-xl border"
          style={{ backgroundColor: `${themeColor}08`, borderColor: `${themeColor}20` }}
        >
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed Today
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" /> Not Logged Yet
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-500 block">Today's Progress</span>
            <span className="text-base font-extrabold text-slate-900" style={{ color: themeColor }}>
              {isCompleted ? formatUnitValue(totalValue, activity?.unit) : '0'}
            </span>
          </div>
        </div>

        {/* Log Entry Form */}
        {showAddForm && (
          <form onSubmit={handleLogProgress} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Log Progress for {selectedDate}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subActivities.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sub-Activity</label>
                  <select
                    value={subActivityId}
                    onChange={(e) => setSubActivityId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:outline-none bg-white"
                  >
                    <option value="">-- General ({activity.name}) --</option>
                    {subActivities.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {getActivityEmoji(sub.icon, sub.categoryType)} {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activity?.unit !== 'CHECK' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Value ({activity?.unit || 'Amount'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={`e.g., 30 ${activity?.unit?.toLowerCase() || ''}`}
                    value={numericValue}
                    onChange={(e) => setNumericValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:outline-none"
                  />
                </div>
              )}

              <div className={activity?.unit === 'CHECK' || subActivities.length === 0 ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 finished, 3 sets done, etc."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition"
                style={{ backgroundColor: themeColor }}
              >
                {isSubmitting ? 'Saving...' : 'Save Log'}
              </button>
            </div>
          </form>
        )}

        {/* Log Entries Feed */}
        <div className="space-y-2 mt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Logs</span>
          {logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              No entries recorded for this date. Click "+ Log Entry" to record progress.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {logs.map((log) => {
                const sub = subActivities.find((s) => s.id === log.subActivityId);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {formatUnitValue(log.numericValue, activity?.unit)}
                          </span>
                          {sub && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md inline-flex items-center gap-1">
                              <ActivityIcon icon={sub.icon} categoryType={sub.categoryType} className="w-3 h-3" fallback="🔹" />
                              <span>{sub.name}</span>
                            </span>
                          )}
                        </div>
                        {log.textValue && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{log.textValue}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 text-slate-300 hover:text-red-600 transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
