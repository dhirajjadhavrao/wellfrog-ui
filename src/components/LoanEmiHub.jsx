import React, { useState } from 'react';
import { 
  Landmark, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  EyeOff, 
  Percent, 
  Calendar, 
  Zap, 
  TrendingDown, 
  Calculator,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

export default function LoanEmiHub({ data, onRefresh, activity, onDeactivate, selectedDate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState('LOAN'); // 'LOAN' or 'CREDIT_CARD'
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'LOAN', 'CREDIT_CARD', 'NEAR_DUE', 'PAID'

  // Form Fields
  const [bankName, setBankName] = useState('');
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [tenureMonths, setTenureMonths] = useState('24');
  const [remainingTenureMonths, setRemainingTenureMonths] = useState('24');
  const [interestRate, setInterestRate] = useState('8.5');
  const [emiAmount, setEmiAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loans = data?.loanList || [];
  const totalEmi = data?.totalEmiLiability || 0;
  const totalOutstanding = data?.totalOutstanding || 0;
  const paidCount = data?.paidCount || 0;
  const failedCount = data?.failedCount || 0;
  const pendingCount = data?.pendingCount || 0;
  const nearDueCount = data?.nearDueCount || 0;
  const closedCount = data?.closedCount || 0;

  // Determine current day of month from selectedDate or today
  const currentDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const currentDay = currentDateObj.getDate();

  // Helper to auto-calculate monthly EMI using compound interest EMI formula
  const handleAutoCalculateEmi = () => {
    const P = parseFloat(loanAmount);
    const N = parseInt(tenureMonths, 10);
    const annualR = parseFloat(interestRate);

    if (isNaN(P) || P <= 0 || isNaN(N) || N <= 0) {
      alert('Please enter valid Loan Amount and Tenure in months to calculate EMI');
      return;
    }

    if (isNaN(annualR) || annualR <= 0) {
      // 0% interest case
      const simpleEmi = Math.round(P / N);
      setEmiAmount(simpleEmi.toString());
      return;
    }

    const r = annualR / (12 * 100);
    const emi = Math.round((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1));
    setEmiAmount(emi.toString());
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();

    const emi = parseFloat(emiAmount);
    const principal = parseFloat(loanAmount);
    const tenure = parseInt(tenureMonths, 10);
    const remTenure = parseInt(remainingTenureMonths, 10);
    const rate = parseFloat(interestRate);
    const day = parseInt(dueDay, 10);

    if (!loanName.trim() || isNaN(emi) || emi <= 0) {
      alert('Please fill valid name and monthly EMI / bill amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addLoan({
        loanType: formType,
        bankName: bankName.trim() || (formType === 'CREDIT_CARD' ? 'Card Issuer' : 'Bank Lender'),
        loanName: loanName.trim(),
        loanAmount: !isNaN(principal) && principal > 0 ? principal : emi * (tenure || 1),
        remainingAmount: !isNaN(principal) && principal > 0 ? principal : emi * (remTenure || 1),
        emiAmount: emi,
        tenureMonths: !isNaN(tenure) ? tenure : 1,
        remainingTenureMonths: !isNaN(remTenure) ? remTenure : (tenure || 1),
        interestRate: !isNaN(rate) ? rate : 0,
        dueDay: !isNaN(day) ? day : 5,
        status: 'PENDING',
        note: note.trim()
      });

      // Reset form
      setBankName('');
      setLoanName('');
      setLoanAmount('');
      setEmiAmount('');
      setNote('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add record: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle or Mark Payment
  const handleTogglePayment = async (loan) => {
    let nextStatus = 'PAID';
    if (loan.status === 'PAID') {
      nextStatus = 'PENDING';
    } else if (loan.status === 'PENDING') {
      nextStatus = 'PAID';
    } else if (loan.status === 'CLOSED') {
      nextStatus = 'PENDING';
    }

    try {
      await api.updateLoanStatus(loan.id, nextStatus);
      onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan / credit card entry?')) return;
    try {
      await api.deleteLoan(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // Helper to determine due date proximity and highlighting
  const getDueStatus = (loan) => {
    if (loan.status === 'CLOSED') {
      return {
        label: 'Fully Cleared 🎉',
        isNear: false,
        isOverdue: false,
        isPaid: true,
        isClosed: true,
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }

    if (loan.status === 'PAID') {
      return {
        label: `Paid for this month (${loan.dueDay}th)`,
        isNear: false,
        isOverdue: false,
        isPaid: true,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
      };
    }

    const diff = (loan.dueDay || 5) - currentDay;

    if (diff === 0) {
      return {
        label: '⚠️ DUE TODAY!',
        isNear: true,
        isToday: true,
        isOverdue: false,
        isPaid: false,
        badgeClass: 'bg-red-500 text-white font-extrabold shadow-xs animate-pulse'
      };
    }

    if (diff > 0 && diff <= 3) {
      return {
        label: `⚡ Due in ${diff} day${diff > 1 ? 's' : ''} (${loan.dueDay}th)`,
        isNear: true,
        isOverdue: false,
        isPaid: false,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
      };
    }

    if (diff < 0) {
      return {
        label: `🚨 Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`,
        isNear: false,
        isOverdue: true,
        isPaid: false,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
      };
    }

    return {
      label: `Due on ${loan.dueDay}th (${diff} days left)`,
      isNear: false,
      isOverdue: false,
      isPaid: false,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  };

  // Filtering
  const filteredLoans = loans.filter((loan) => {
    if (filterTab === 'LOAN') return loan.loanType !== 'CREDIT_CARD';
    if (filterTab === 'CREDIT_CARD') return loan.loanType === 'CREDIT_CARD';
    if (filterTab === 'PAID') return loan.status === 'PAID' || loan.status === 'CLOSED';
    if (filterTab === 'NEAR_DUE') {
      if (loan.status === 'PAID' || loan.status === 'CLOSED') return false;
      const diff = (loan.dueDay || 5) - currentDay;
      return diff >= 0 && diff <= 3;
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full hover:border-slate-300 transition duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Loans, EMIs &amp; Cards</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Track EMIs, Credit Cards &amp; Auto-Pay Dates</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close' : 'Add Loan / Card'}</span>
          </button>
          {onDeactivate && (
            <button
              onClick={() => onDeactivate(activity)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-700 hover:bg-amber-50 active:scale-95 rounded-lg transition"
              title="Deactivate and hide from dashboard (keeps all data safe)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-3 sm:my-4">
        <div className="bg-slate-50 rounded-xl p-2 sm:p-2.5 border border-slate-100 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">Monthly EMI</div>
          <div className="text-xs sm:text-base font-bold text-slate-900 mt-0.5 truncate">₹{Number(totalEmi).toLocaleString()}</div>
        </div>

        <div className="bg-blue-50/60 rounded-xl p-2 sm:p-2.5 border border-blue-100 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-blue-700 uppercase tracking-wider truncate">Outstanding</div>
          <div className="text-xs sm:text-base font-bold text-blue-900 mt-0.5 truncate">₹{Number(totalOutstanding).toLocaleString()}</div>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-2 sm:p-2.5 border border-emerald-100 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-center gap-0.5 sm:gap-1 truncate">
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> <span className="truncate">Paid</span>
          </div>
          <div className="text-xs sm:text-base font-bold text-emerald-900 mt-0.5">{paidCount}</div>
        </div>

        <div className={`rounded-xl p-2 sm:p-2.5 border text-center transition ${
          nearDueCount > 0 ? 'bg-amber-100/70 border-amber-300 text-amber-900 animate-pulse' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-0.5 sm:gap-1 truncate ${
            nearDueCount > 0 ? 'text-amber-900 font-extrabold' : 'text-slate-400'
          }`}>
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> <span className="truncate">Due ≤3 Days</span>
          </div>
          <div className={`text-xs sm:text-base font-bold mt-0.5 ${nearDueCount > 0 ? 'text-amber-950 font-black' : 'text-slate-800'}`}>
            {nearDueCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 pb-2 overflow-x-auto text-[11px] font-semibold text-slate-500 border-b border-slate-100 mb-3">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            filterTab === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-100'
          }`}
        >
          All ({loans.length})
        </button>
        <button
          onClick={() => setFilterTab('LOAN')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            filterTab === 'LOAN' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100'
          }`}
        >
          Loans ({loans.filter((l) => l.loanType !== 'CREDIT_CARD').length})
        </button>
        <button
          onClick={() => setFilterTab('CREDIT_CARD')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            filterTab === 'CREDIT_CARD' ? 'bg-purple-600 text-white font-bold' : 'hover:bg-slate-100'
          }`}
        >
          Cards ({loans.filter((l) => l.loanType === 'CREDIT_CARD').length})
        </button>
        {nearDueCount > 0 && (
          <button
            onClick={() => setFilterTab('NEAR_DUE')}
            className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
              filterTab === 'NEAR_DUE' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Zap className="w-3 h-3" /> Due Soon ({nearDueCount})
          </button>
        )}
        <button
          onClick={() => setFilterTab('PAID')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            filterTab === 'PAID' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-100'
          }`}
        >
          Paid ({paidCount})
        </button>
      </div>

      {/* Add Loan / Credit Card Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in duration-150 space-y-3">
          
          {/* Form Mode Selector: Loan vs Credit Card */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {formType === 'LOAN' ? 'Add Bank Loan / EMI' : 'Add Credit Card'}
            </span>

            <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setFormType('LOAN')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  formType === 'LOAN' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bank Loan
              </button>
              <button
                type="button"
                onClick={() => setFormType('CREDIT_CARD')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  formType === 'CREDIT_CARD' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Credit Card
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Bank Name / Issuer */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {formType === 'LOAN' ? 'Bank / Lender Name' : 'Card Company / Bank'}
              </label>
              <input
                type="text"
                placeholder={formType === 'LOAN' ? 'e.g. HDFC Bank, SBI, ICICI' : 'e.g. HDFC Bank, SBI Card, Axis'}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Loan / Card Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {formType === 'LOAN' ? 'Loan Name / Purpose' : 'Card Nickname / Product'}
              </label>
              <input
                type="text"
                placeholder={formType === 'LOAN' ? 'e.g. Home Loan, Car Loan' : 'e.g. Millennia, Amazon Pay ICICI'}
                value={loanName}
                onChange={(e) => setLoanName(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Total Loan Amount / Outstanding Balance */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {formType === 'LOAN' ? 'Total Loan Amount (₹)' : 'Outstanding Amount (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 500000"
                value={loanAmount}
                onChange={(e) => {
                  setLoanAmount(e.target.value);
                  if (formType === 'CREDIT_CARD' && !emiAmount) {
                    setEmiAmount(e.target.value);
                  }
                }}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Monthly EMI / Bill Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  {formType === 'LOAN' ? 'Monthly EMI (₹)' : 'Bill Due Amount (₹)'}
                </label>
                {formType === 'LOAN' && (
                  <button
                    type="button"
                    onClick={handleAutoCalculateEmi}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    title="Calculate compound interest EMI"
                  >
                    <Calculator className="w-3 h-3" /> Auto-calc
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                value={emiAmount}
                onChange={(e) => setEmiAmount(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Due Day of Month */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {formType === 'LOAN' ? 'EMI Due Date (Day 1-31)' : 'Bill Due Date (Day 1-31)'}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Loan Specific: Rate of Interest */}
            {formType === 'LOAN' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 8.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Loan Specific: Total Tenure */}
            {formType === 'LOAN' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Tenure (Months)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 60"
                  value={tenureMonths}
                  onChange={(e) => {
                    setTenureMonths(e.target.value);
                    if (!remainingTenureMonths || remainingTenureMonths === tenureMonths) {
                      setRemainingTenureMonths(e.target.value);
                    }
                  }}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Loan Specific: Remaining Tenure */}
            {formType === 'LOAN' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Remaining Tenure (Months)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 48"
                  value={remainingTenureMonths}
                  onChange={(e) => setRemainingTenureMonths(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Notes */}
            <div className={formType === 'LOAN' ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2'}>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notes / Auto-Debit Account (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Auto-debit from Salary account, Min due: 2000"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80">
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
              className="text-xs font-bold px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition active:scale-95 shadow-xs"
            >
              {isSubmitting ? 'Saving...' : formType === 'LOAN' ? 'Save Loan' : 'Save Credit Card'}
            </button>
          </div>
        </form>
      )}

      {/* Loans & Cards List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 flex-1">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            {filterTab === 'ALL'
              ? 'No active loans or credit cards added yet. Click "+ Add Loan / Card" above to start tracking.'
              : `No items found matching the "${filterTab}" filter.`}
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const dueInfo = getDueStatus(loan);
            const isCard = loan.loanType === 'CREDIT_CARD';
            const totalTenure = loan.tenureMonths || 0;
            const remTenure = loan.remainingTenureMonths != null ? loan.remainingTenureMonths : totalTenure;
            const completedMonths = Math.max(0, totalTenure - remTenure);
            const percentPaid = totalTenure > 0 ? Math.min(100, Math.round((completedMonths / totalTenure) * 100)) : 0;

            return (
              <div
                key={loan.id}
                className={`p-3.5 rounded-xl border transition group relative ${
                  dueInfo.isToday
                    ? 'border-red-400 bg-red-50/40 ring-2 ring-red-400/50 shadow-sm'
                    : dueInfo.isNear
                    ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300 shadow-2xs'
                    : dueInfo.isClosed
                    ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-300'
                    : dueInfo.isPaid
                    ? 'border-emerald-200/90 bg-emerald-50/15'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isCard
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {isCard ? <CreditCard className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {loan.loanName}
                        </span>
                        {loan.bankName && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200/60">
                            {loan.bankName}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dueInfo.badgeClass}`}>
                          {dueInfo.label}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>
                          {isCard ? 'Outstanding: ' : 'Principal Left: '}
                          <strong className="text-slate-800">
                            ₹{Number(loan.remainingAmount || 0).toLocaleString()}
                          </strong>
                        </span>

                        {!isCard && totalTenure > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              Tenure: <strong className="text-slate-800">{remTenure}</strong> of {totalTenure} mos left
                            </span>
                          </>
                        )}

                        {loan.interestRate > 0 && (
                          <>
                            <span>•</span>
                            <span>{loan.interestRate}% p.a.</span>
                          </>
                        )}
                      </div>

                      {/* Optional Note or Last Paid */}
                      {loan.note && (
                        <div className="text-[11px] text-slate-400 italic truncate mt-0.5">
                          "{loan.note}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: EMI Amount & Mark Paid Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        ₹{Number(loan.emiAmount).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {isCard ? 'Bill Amount' : 'Monthly EMI'}
                      </span>
                    </div>

                    {/* Pay / Toggle Button */}
                    <button
                      onClick={() => handleTogglePayment(loan)}
                      title={loan.status === 'PAID' ? 'Click to revert to Pending' : 'Mark EMI / Bill as Paid for this month'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition active:scale-95 shadow-2xs ${
                        loan.status === 'CLOSED'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : loan.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{loan.status === 'CLOSED' ? 'Closed' : loan.status === 'PAID' ? 'Paid ✓' : 'Pay EMI'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(loan.id)}
                      title="Delete record"
                      className="p-1.5 text-slate-300 hover:text-red-600 active:scale-90 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar for Loans with Tenure */}
                {!isCard && totalTenure > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {percentPaid}% cleared
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{loans.length} active liability accounts</span>
        <span className="font-semibold text-slate-600">
          {closedCount > 0 ? `${closedCount} Fully Cleared!` : 'Payment cycle active'}
        </span>
      </div>

    </div>
  );
}
