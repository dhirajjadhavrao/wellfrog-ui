import React, { useState } from 'react';
import { Target, Plus, Briefcase, Calendar, Trash2, ChevronDown, CheckCircle2, Clock, EyeOff } from 'lucide-react';
import { api } from '../api';

export default function NaukriHub({ data, onRefresh, activity, onDeactivate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Senior Java Engineer');
  const [platform, setPlatform] = useState('Naukri');
  const [status, setStatus] = useState('APPLIED');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobs = data?.recentJobs || [];
  const total = data?.totalTracked || 0;
  const appliedCount = data?.appliedCount || 0;
  const interviewCount = data?.interviewCount || 0;
  const offerCount = data?.offerCount || 0;

  const statusConfigs = {
    APPLIED: { label: 'Applied', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    SHORTLISTED: { label: 'Shortlisted', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    HR_CALL: { label: 'HR Screening', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    TECH_INTERVIEW: { label: 'Interview', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    OFFER: { label: 'Offer 🎉', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
    REJECTED: { label: 'Archived', bg: 'bg-slate-50 text-slate-500 border-slate-200' },
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!company || !role) {
      alert('Please fill company and role');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addJob({
        company: company.trim(),
        role: role.trim(),
        platform,
        status,
        appliedDate: new Date().toISOString().split('T')[0],
        lastUpdate: '',
        notes: notes.trim(),
      });
      setCompany('');
      setNotes('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      alert('Failed to add job application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job entry?')) return;
    try {
      await api.deleteJob(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full hover:border-slate-300 transition duration-150">
      {/* Activity Card Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Naukri &amp; Career</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Job Pipeline &amp; Interview Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddForm ? 'Close' : 'Add Job'}
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

      {/* KPI Status Strip (Matching Finance, Loan, Workout Hubs) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-3 sm:my-4">
        <div className="bg-blue-50/60 rounded-xl p-2 sm:p-2.5 border border-blue-100/80 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Applied</div>
          <div className="text-sm sm:text-base font-bold text-blue-900 mt-0.5">{appliedCount}</div>
        </div>
        <div className="bg-amber-50/60 rounded-xl p-2 sm:p-2.5 border border-amber-100/80 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Interview</div>
          <div className="text-sm sm:text-base font-bold text-amber-900 mt-0.5">{interviewCount}</div>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-2 sm:p-2.5 border border-emerald-100/80 text-center">
          <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Offers</div>
          <div className="text-sm sm:text-base font-bold text-emerald-900 mt-0.5">{offerCount}</div>
        </div>
      </div>

      {/* Add Job Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddJob} className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 mb-4 space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Job Application</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Google, Mastercard, Swiggy"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role / Position</label>
              <input
                type="text"
                placeholder="e.g. Senior Java Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Naukri">Naukri.com</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instahyre">Instahyre</option>
                <option value="Referral">Referral</option>
                <option value="Company Portal">Company Portal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="APPLIED">Applied</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="HR_CALL">HR Screening</option>
                <option value="TECH_INTERVIEW">Technical Interview</option>
                <option value="OFFER">Offer Received 🎉</option>
                <option value="REJECTED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notes / Recruiter Update</label>
            <input
              type="text"
              placeholder="e.g. Referral sent, 1st round scheduled Thursday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      )}

      {/* Applications Activity Feed (Matching standard Hub item lists) */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
        {jobs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No job applications logged yet. Click "+ Add Job" to track your Naukri applications.
          </div>
        ) : (
          jobs.map((job) => {
            const conf = statusConfigs[job.status] || statusConfigs.APPLIED;
            return (
              <div
                key={job.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">{job.company}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                      {job.platform || 'Naukri'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">{job.role}</div>
                  {job.notes && (
                    <div className="text-[11px] text-slate-400 italic truncate mt-0.5">"{job.notes}"</div>
                  )}
                  {job.appliedDate && (
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Applied: {job.appliedDate}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${conf.bg}`}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="HR_CALL">HR Screen</option>
                    <option value="TECH_INTERVIEW">Interview</option>
                    <option value="OFFER">Offer 🎉</option>
                    <option value="REJECTED">Archived</option>
                  </select>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-slate-300 hover:text-red-600 active:scale-90 rounded-lg hover:bg-red-50 transition"
                    title="Delete Job Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>{total} active applications</span>
        <span className="font-medium text-slate-500">{offerCount > 0 ? `${offerCount} Offer(s)!` : 'Pipeline active'}</span>
      </div>
    </div>
  );
}
