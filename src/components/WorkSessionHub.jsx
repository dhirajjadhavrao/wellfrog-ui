import React, { useState, useEffect } from 'react';
import { Briefcase, CheckSquare, Square, Save, Plus } from 'lucide-react';
import { api } from '../api';

export default function WorkSessionHub({ data, selectedDate, onRefresh }) {
  const [hoursWorked, setHoursWorked] = useState('0');
  const [tasksText, setTasksText] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setHoursWorked(data.hoursWorked ? data.hoursWorked.toString() : '0');
      setTasksText(data.tasks || '');
      setNotes(data.notes || '');
    }
  }, [data]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.logWorkSession({
        sessionDate: selectedDate,
        hoursWorked: parseFloat(hoursWorked) || 0.0,
        tasks: tasksText.trim(),
        notes: notes.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefresh();
    } catch (err) {
      alert('Failed to save work session: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse lines starting with [x] or [ ] as interactive tasks
  const lines = tasksText.split('\n');

  const toggleTaskLine = (lineIndex) => {
    const updated = lines.map((l, idx) => {
      if (idx !== lineIndex) return l;
      if (l.trim().startsWith('[x]')) {
        return l.replace('[x]', '[ ]');
      } else if (l.trim().startsWith('[ ]')) {
        return l.replace('[ ]', '[x]');
      } else {
        return '[x] ' + l;
      }
    });
    setTasksText(updated.join('\n'));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Office Work &amp; Tasks</h2>
            <p className="text-xs text-slate-500">Hours Logged &amp; Daily Deliverables</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">Saved! ✓</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            {isSubmitting ? 'Saving...' : 'Save Work'}
          </button>
        </div>
      </div>

      {/* Hours Logged Strip */}
      <div className="my-4 flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100">
        <label className="text-xs font-bold text-purple-900">Total Hours Worked Today:</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.25"
            min="0"
            max="24"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            className="w-20 text-center font-bold text-sm bg-white border border-purple-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-600 focus:outline-none"
          />
          <span className="text-xs text-purple-700 font-semibold">hours</span>
        </div>
      </div>

      {/* Task Checklist / Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daily Tasks &amp; Deliverables
          </label>
          <span className="text-[10px] text-slate-400">Prefix line with [x] for done, [ ] for todo</span>
        </div>

        {/* Interactive task checkboxes if formatted with [ ] or [x] */}
        {lines.some(l => l.trim().startsWith('[x]') || l.trim().startsWith('[ ]')) && (
          <div className="space-y-1.5 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              const isDone = trimmed.startsWith('[x]');
              const isTodo = trimmed.startsWith('[ ]');
              if (!isDone && !isTodo) return null;
              const label = trimmed.substring(3).trim();

              return (
                <div
                  key={idx}
                  onClick={() => toggleTaskLine(idx)}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 transition"
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {label || 'Task item'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea Editor */}
        <textarea
          rows="4"
          placeholder="[x] Fix payment gateway retry webhook&#10;[ ] Review PR for auth module&#10;[ ] Sync with product lead"
          value={tasksText}
          onChange={(e) => setTasksText(e.target.value)}
          className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
        />

        <div className="mt-2">
          <input
            type="text"
            placeholder="Office Notes (e.g. In office, WFH, sprint planning)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-1 focus:ring-purple-600 focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
}
