import React, { useState } from 'react';
import { Dumbbell, Plus, CheckCircle2, Clock, Trash2, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function WorkoutHub({ data, selectedDate, onRefresh, activity, onDeactivate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [workoutType, setWorkoutType] = useState('Gym / Strength');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workouts = data?.workoutList || [];
  const completed = data?.completed || false;
  const totalMins = data?.totalMinutes || 0;

  const workoutTypes = [
    'Gym / Strength (Chest & Triceps)',
    'Gym / Strength (Back & Biceps)',
    'Gym / Strength (Legs & Core)',
    'Gym / Strength (Shoulders & Abs)',
    'Outdoor Running',
    'Cardio / HIIT',
    'Brisk Walking / 10k Steps',
    'Yoga & Stretching',
    'Rest & Recovery'
  ];

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!durationMinutes || isNaN(durationMinutes) || parseInt(durationMinutes, 10) <= 0) {
      alert('Please enter a valid workout duration');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.logWorkout({
        workoutType,
        durationMinutes: parseInt(durationMinutes, 10),
        workoutDate: selectedDate,
        notes: notes.trim()
      });
      setNotes('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to log workout: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout log?')) return;
    try {
      await api.deleteWorkout(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Workout &amp; Fitness</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Daily Exercise &amp; Routine Logs</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close' : 'Log Workout'}</span>
          </button>
          {onDeactivate && (
            <button
              onClick={() => onDeactivate(activity)}
              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
              title="Deactivate and hide from dashboard (keeps all data safe)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="flex items-center justify-between my-4 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
        <div className="flex items-center gap-2">
          {completed ? (
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
          <span className="text-xs text-slate-500 font-medium">Duration: </span>
          <span className="text-sm font-bold text-slate-900">{totalMins} mins</span>
        </div>
      </div>

      {/* Log Workout Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddWorkout} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Log Exercise Session</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Workout Routine</label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-orange-600 focus:outline-none"
              >
                {workoutTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-orange-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exercises &amp; Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Bench Press 80kg 3x8, Incline Dumbbell 24kg, 15m Treadmill"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold px-4 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </form>
      )}

      {/* Workout Sessions List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {workouts.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No workouts logged for this date.
          </div>
        ) : (
          workouts.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-900">{w.workoutType}</div>
                {w.notes && <div className="text-[11px] text-slate-500 mt-0.5">{w.notes}</div>}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                  {w.durationMinutes} mins
                </span>
                <button
                  onClick={() => handleDelete(w.id)}
                  title="Delete"
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
