import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Layers, FolderPlus, Tag, Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function ActivityManagerModal({ isOpen, onClose, onActivityChanged }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleOpenAddSub = (parentActivity) => {
    setParentId(parentActivity.id.toString());
    setIcon(parentActivity.icon || '⚡');
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

  const handleDeleteActivity = async (id, actName) => {
    if (!window.confirm(`Delete "${actName}" and any associated sub-activities?`)) {
      return;
    }
    try {
      await api.deleteActivity(id);
      await fetchActivities();
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      alert('Error deleting activity: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activities &amp; Sub-Activities</h2>
              <p className="text-xs text-slate-500">Configure tracked services, routines, and custom sub-tasks</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add form toggler */}
          {!showAddForm ? (
            <div className="flex justify-between items-center bg-forest-50/70 border border-forest-200/80 rounded-xl p-4">
              <div>
                <h4 className="text-sm font-bold text-forest-900">Custom Activity or Sub-activity</h4>
                <p className="text-xs text-forest-700">Add personal hobbies, study routines, projects, or side-hustles</p>
              </div>
              <button
                onClick={() => {
                  setParentId('');
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Add New Activity
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateActivity} className="bg-slate-50 border border-slate-300/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {parentId ? '➕ Add Sub-Activity' : '➕ Create Root Activity'}
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
                    placeholder="e.g., Reading, DSA Prep, Badminton"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Activity (Optional)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none bg-white"
                  >
                    <option value="">-- None (Top-Level Root) --</option>
                    {rootActivities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.icon} {act.name}
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
                      className="w-16 px-3 py-2 text-center text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto text-base">
                      {['📚', '💻', '🧘', '🎸', '🏃', '💰', '🎯', '🥗'].map((emoji) => (
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
                    <option value="MINUTES">Minutes</option>
                    <option value="HOURS">Hours</option>
                    <option value="COUNT">Count / Reps</option>
                    <option value="AMOUNT">Amount (₹)</option>
                    <option value="CHECK">Checklist / Done</option>
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
                  {isSubmitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          )}

          {/* Activity Tree / List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Your Activities &amp; Sub-Hierarchies
            </h3>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading activities...</div>
            ) : rootActivities.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No activities found. First login auto-seeds default activities.
              </div>
            ) : (
              <div className="space-y-3">
                {rootActivities.map((act) => {
                  const subs = getSubActivities(act.id);
                  return (
                    <div
                      key={act.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-slate-300 transition"
                    >
                      {/* Root Item */}
                      <div className="p-3.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                            {act.icon || '📌'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{act.name}</span>
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                                {act.categoryType || 'SYSTEM'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">Unit: {act.unit || 'Standard'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAddSub(act)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-forest-700 hover:bg-forest-100/70 rounded-lg transition"
                            title="Add sub-activity under this"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>+ Sub</span>
                          </button>

                          {act.categoryType !== 'FINANCE' &&
                            act.categoryType !== 'WORKOUT' &&
                            act.categoryType !== 'WORK' &&
                            act.categoryType !== 'CAREER' && (
                              <button
                                onClick={() => handleDeleteActivity(act.id, act.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition hover:bg-red-50"
                                title="Delete Activity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Sub-activities */}
                      {subs.length > 0 && (
                        <div className="p-3 bg-white pl-12 space-y-2 border-t border-slate-100">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm">{sub.icon || '🔹'}</span>
                                <span className="text-xs font-semibold text-slate-800">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">({sub.unit})</span>
                              </div>
                              <button
                                onClick={() => handleDeleteActivity(sub.id, sub.name)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
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
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            All user data and activity logs are strictly isolated per account.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
