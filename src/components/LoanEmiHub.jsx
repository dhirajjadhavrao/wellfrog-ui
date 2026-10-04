import React, { useState } from 'react';
import { Landmark, Plus, CheckCircle2, AlertCircle, Clock, Trash2, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function LoanEmiHub({ data, onRefresh, activity, onDeactivate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loanName, setLoanName] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loans = data?.loanList || [];
  const totalEmi = data?.totalEmiLiability || 0;
  const paidCount = data?.paidCount || 0;
  const failedCount = data?.failedCount || 0;
  const pendingCount = data?.pendingCount || 0;

  const handleAddLoan = async (e) => {
    e.preventDefault();
    if (!loanName || !emiAmount || isNaN(emiAmount) || parseFloat(emiAmount) <= 0) {
      alert('Please fill valid loan name and EMI amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addLoan({
        loanName: loanName.trim(),
        emiAmount: parseFloat(emiAmount),
        dueDay: parseInt(dueDay, 10),
        status: 'PENDING',
        note: note.trim()
      });
      setLoanName('');
      setEmiAmount('');
      setNote('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add loan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (loan) => {
    let nextStatus = 'PENDING';
    if (loan.status === 'PENDING') nextStatus = 'PAID';
    else if (loan.status === 'PAID') nextStatus = 'FAILED';
    else if (loan.status === 'FAILED') nextStatus = 'PENDING';

    try {
      await api.updateLoanStatus(loan.id, nextStatus);
      onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan entry?')) return;
    try {
      await api.deleteLoan(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Loans &amp; EMIs</h2>
            <p className="text-xs text-slate-500">Monthly Obligations Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Close' : 'Add Loan'}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2 my-4">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total EMI</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">₹{Number(totalEmi).toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100 text-center">
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </div>
          <div className="text-base font-bold text-emerald-900 mt-0.5">{paidCount}</div>
        </div>
        <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-100 text-center">
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </div>
          <div className="text-base font-bold text-amber-900 mt-0.5">{pendingCount}</div>
        </div>
        <div className="bg-rose-50/60 rounded-xl p-2.5 border border-rose-100 text-center">
          <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </div>
          <div className="text-base font-bold text-rose-900 mt-0.5">{failedCount}</div>
        </div>
      </div>

      {/* Add Loan Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddLoan} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Add Loan / EMI Record</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loan / EMI Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Home Loan or Car EMI"
                value={loanName}
                onChange={(e) => setLoanName(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monthly EMI (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                value={emiAmount}
                onChange={(e) => setEmiAmount(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Day of Month (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
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
              className="text-xs font-semibold px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Loan'}
            </button>
          </div>
        </form>
      )}

      {/* Loans List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {loans.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No active loans or EMIs added yet.
          </div>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-900">{loan.loanName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Due on {loan.dueDay}th of month
                  {loan.lastPaidDate && ` • Last Paid: ${loan.lastPaidDate}`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900">₹{Number(loan.emiAmount).toLocaleString()}</span>
                
                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(loan)}
                  title="Click to toggle status: Pending -> Paid -> Failed"
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md cursor-pointer transition ${
                    loan.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : loan.status === 'FAILED'
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {loan.status}
                </button>

                <button
                  onClick={() => handleDelete(loan.id)}
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
