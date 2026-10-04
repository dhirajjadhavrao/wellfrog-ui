import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Layers, FolderPlus, Check, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api } from '../api';
import ActivityIcon, { getActivityEmoji } from './ActivityIcon';

export default function ActivityManagerModal({ isOpen, onClose, onActivityChanged }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'deactivated'

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [parentId, setParentId] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [unit, setUnit] = useState('MINUTES');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getActivities();
      setActivities(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rootActivities = activities.filter((a) => !a.parentId);
  const getSubActivities = (rootId) => activities.filter((a) => a.parentId === rootId);

  const activeRoots = rootActivities.filter((a) => a.active !== false);
  const deactivatedRoots = rootActivities.filter((a) => a.active === false);

  const displayedRoots = filterTab === 'active'
    ? activeRoots
    : filterTab === 'deactivated'
    ? deactivatedRoots
    : rootActivities;

  const handleOpenAddSub = (parentActivity) => {
    setParentId(parentActivity.id.toString());
    setIcon(getActivityEmoji(parentActivity.icon, parentActivity.categoryType));
    setColor(parentActivity.color || '#22c55e');
    setShowAddForm(true);
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addActivity({
        name: name.trim(),
        icon: icon.trim() || '⚡',
        parentId: parentId ? parseInt(parentId, 10) : null,
        color: color || '#22c55e',
        unit: unit || 'MINUTES',
        categoryType: parentId ? 'SUB_ACTIVITY' : 'CUSTOM',
      });

      setName('');
      setIcon('⚡');
      setParentId('');
      setShowAddForm(false);
      await fetchActivities();
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      alert('Error creating activity: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (activity) => {
    try {
      const nextActive = !(activity.active !== false);
      await api.toggleActivityActive(activity.id, nextActive);
      await fetchActivities();
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      alert('Error updating activity status: ' + err.message);
    }
  };

  const handlePermanentDelete = async (id, actName) => {
    if (!window.confirm(`Permanently delete "${actName}" and all associated data/logs? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteActivity(id, true);
      await fetchActivities();
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      alert('Error deleting activity: ' + err.message);
    }
  };

  const isBuiltIn = (act) => {
    return ['FINANCE', 'LOANS', 'WORKOUT', 'WORK_TIME', 'CAREER'].includes(act.categoryType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Activity Configuration</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Configure dashboard tiles &amp; custom habits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Info Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Full Dashboard Configurability: </span>
              Toggle any activity to hide or display its tile on the dashboard. Deactivating an activity never deletes your historical logs or entries.
            </div>
          </div>

          {/* Add form toggler */}
          {!showAddForm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-forest-50/70 border border-forest-200/80 rounded-xl p-4">
              <div>
                <h4 className="text-sm font-bold text-forest-900">Add New Activity Tile</h4>
                <p className="text-xs text-forest-700">Create custom tracking cards for personal habits, studies, reading, or projects</p>
              </div>
              <button
                onClick={() => {
                  setParentId('');
                  setShowAddForm(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Activity</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateActivity} className="bg-slate-50 border border-slate-300/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {parentId ? '➕ Add Sub-Activity' : '➕ Create New Activity Tile'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Reading, DSA Prep, Guitar, Meditation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Activity (Optional)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                  >
                    <option value="">-- None (Top-Level Dashboard Tile) --</option>
                    {rootActivities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {getActivityEmoji(act.icon, act.categoryType)} {act.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emoji / Icon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-16 px-3 py-2 text-center text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto text-base">
                      {['📚', '💻', '🧘', '🎸', '🏃', '💰', '🎯', '🥗', '⚡', '☕'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setIcon(emoji)}
                          className="px-2 py-1 rounded-lg hover:bg-slate-200 text-sm transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit of Measurement</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                  >
                    <option value="MINUTES">Minutes (Duration)</option>
                    <option value="HOURS">Hours (Duration)</option>
                    <option value="COUNT">Count / Reps / Items</option>
                    <option value="AMOUNT">Amount (₹)</option>
                    <option value="CHECK">Checklist (Done / Pending)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-xl shadow-xs transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Add to Dashboard'}
                </button>
              </div>
            </form>
          )}

          {/* Filter Pills */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Configured Activities ({rootActivities.length})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({rootActivities.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'active' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active ({activeRoots.length})
              </button>
              <button
                onClick={() => setFilterTab('deactivated')}
                className={`px-3 py-1 rounded-lg transition ${
                  filterTab === 'deactivated' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Deactivated ({deactivatedRoots.length})
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div>
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading activities...</div>
            ) : displayedRoots.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                {filterTab === 'deactivated'
                  ? 'No deactivated activities. All activities are currently active on your dashboard.'
                  : 'No activities found matching this filter.'}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedRoots.map((act) => {
                  const subs = getSubActivities(act.id);
                  const isActive = act.active !== false;

                  return (
                    <div
                      key={act.id}
                      className={`border rounded-2xl overflow-hidden transition ${
                        isActive
                          ? 'border-slate-200 bg-white shadow-2xs hover:border-slate-300'
                          : 'border-slate-200/60 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      {/* Root Item Bar */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 shadow-2xs shrink-0"
                            style={{ color: act.color || '#386641' }}
                          >
                            <ActivityIcon icon={act.icon} categoryType={act.categoryType} className="w-5 h-5" fallback="📌" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900">{act.name}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                                {act.categoryType || 'CUSTOM'}
                              </span>
                              {/* Status Badge */}
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                  Active on Dashboard
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                                  <EyeOff className="w-3 h-3" /> Deactivated (Hidden)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              Measurement Unit: <span className="font-semibold text-slate-700">{act.unit || 'Standard'}</span>
                              {subs.length > 0 && ` • ${subs.length} sub-activities`}
                            </span>
                          </div>
                        </div>

                        {/* Actions & Activate/Deactivate Toggle Switch */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                              {isActive ? 'Active' : 'Deactivated'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isActive}
                              onClick={() => handleToggleActive(act)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? 'bg-forest-600' : 'bg-slate-300'
                              }`}
                              title={
                                isActive
                                  ? 'Click to deactivate (hides from dashboard, keeps data safe)'
                                  : 'Click to activate (restores to dashboard with data)'
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Sub-activity button */}
                          <button
                            onClick={() => handleOpenAddSub(act)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-forest-700 hover:bg-forest-50 border border-forest-200/80 rounded-xl transition"
                            title="Add sub-activity under this activity"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>+ Sub</span>
                          </button>

                          {/* Permanent Delete for Custom activities only */}
                          {!isBuiltIn(act) && (
                            <button
                              onClick={() => handlePermanentDelete(act.id, act.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl transition hover:bg-red-50 border border-transparent hover:border-red-200"
                              title="Permanently delete activity and logs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-activities List */}
                      {subs.length > 0 && (
                        <div className="p-3 bg-white pl-8 sm:pl-14 space-y-2 border-t border-slate-100">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/70 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 flex items-center justify-center text-slate-700 shrink-0">
                                  <ActivityIcon icon={sub.icon} categoryType={sub.categoryType} className="w-4 h-4" fallback="🔹" />
                                </div>
                                <span className="text-xs font-semibold text-slate-800">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">({sub.unit})</span>
                              </div>
                              <button
                                onClick={() => handlePermanentDelete(sub.id, sub.name)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition"
                                title="Delete Sub-activity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 pb-safe border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] sm:text-xs text-slate-500">
            Deactivating keeps all historical logs safely in database.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-2xs active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
