import React, { useState } from 'react';
import { Wallet, Plus, Trash2, ArrowUpRight, Wifi, Banknote, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function FinanceHub({ data, selectedDate, onRefresh, activity, onDeactivate }) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('ONLINE');
  const [category, setCategory] = useState('Food & Dining');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = [
    'Food & Dining',
    'Groceries',
    'Travel & Fuel',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Personal / Misc'
  ];

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addExpense({
        amount: parseFloat(amount),
        mode,
        category,
        expenseDate: selectedDate,
        note: note.trim()
      });
      setAmount('');
      setNote('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add expense: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const total = data?.totalSpent || 0;
  const online = data?.onlineSpent || 0;
  const offline = data?.offlineSpent || 0;
  const list = data?.expenses || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Finance: Daily Spend</h2>
            <p className="text-xs text-slate-500">Online &amp; Offline Outflow</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Close' : 'Add Expense'}
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Spent</div>
          <div className="text-lg font-bold text-slate-900 mt-1">₹{Number(total).toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Online (UPI/Card)
          </div>
          <div className="text-lg font-bold text-emerald-900 mt-1">₹{Number(online).toLocaleString()}</div>
        </div>
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Offline (Cash)
          </div>
          <div className="text-lg font-bold text-amber-900 mt-1">₹{Number(offline).toLocaleString()}</div>
        </div>
      </div>

      {/* Add Expense Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddExpense} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Log New Spend</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('ONLINE')}
                  className={`flex-1 text-xs py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 border transition ${
                    mode === 'ONLINE' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Wifi className="w-3 h-3" /> Online
                </button>
                <button
                  type="button"
                  onClick={() => setMode('OFFLINE')}
                  className={`flex-1 text-xs py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 border transition ${
                    mode === 'OFFLINE' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Banknote className="w-3 h-3" /> Offline (Cash)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-forest-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Swiggy lunch or fuel"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-forest-600 focus:outline-none"
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
              className="text-xs font-semibold px-4 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {list.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No expenses logged for this date.
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  item.mode === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.mode}
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800">{item.category}</div>
                  {item.note && <div className="text-[11px] text-slate-400">{item.note}</div>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</span>
                <button
                  onClick={() => handleDelete(item.id)}
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
