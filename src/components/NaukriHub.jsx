import React, { useState } from 'react';
import { Target, Plus, Briefcase, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function NaukriHub({ data, onRefresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Senior Java Engineer');
  const [platform, setPlatform] = useState('Naukri');
  const [status, setStatus] = useState('APPLIED');
  const [lastUpdate, setLastUpdate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobs = data?.recentJobs || [];
  const total = data?.totalTracked || 0;
  const appliedCount = data?.appliedCount || 0;
  const interviewCount = data?.interviewCount || 0;
  const offerCount = data?.offerCount || 0;

  const statuses = [
    { value: 'APPLIED', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
    { value: 'HR_CALL', label: 'HR Screening', color: 'bg-amber-100 text-amber-800' },
    { value: 'TECH_INTERVIEW', label: 'Technical Interview', color: 'bg-orange-100 text-orange-800' },
    { value: 'OFFER', label: 'Offer Received 🎉', color: 'bg-emerald-100 text-emerald-800 font-bold' },
    { value: 'REJECTED', label: 'Archived / Rejected', color: 'bg-slate-100 text-slate-600' }
  ];

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
        lastUpdate: lastUpdate.trim(),
        notes: notes.trim()
      });
      setCompany('');
      setLastUpdate('');
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Naukri &amp; Career Pipeline</h2>
            <p className="text-xs text-slate-500">Job Applications &amp; Interview Updates</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Close' : 'Add Application'}
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-4 gap-2 my-4">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{total}</div>
        </div>
        <div className="bg-blue-50/60 rounded-xl p-2.5 border border-blue-100 text-center">
          <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Applied</div>
          <div className="text-base font-bold text-blue-900 mt-0.5">{appliedCount}</div>
        </div>
        <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-100 text-center">
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Interviewing</div>
          <div className="text-base font-bold text-amber-900 mt-0.5">{interviewCount}</div>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100 text-center">
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Offers</div>
          <div className="text-base font-bold text-emerald-900 mt-0.5">{offerCount}</div>
        </div>
      </div>

      {/* Add Job Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddJob} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Add Job Application</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. Mastercard, Google, Swiggy"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role / Designation</label>
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
                <option value="Direct">Company Career Site</option>
                <option value="Referral">Employee Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latest Update / Note</label>
              <input
                type="text"
                placeholder="e.g. Recruiter message received, tech round on Wednesday"
                value={lastUpdate}
                onChange={(e) => setLastUpdate(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none"
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
              className="text-xs font-semibold px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      )}

      {/* Applications List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {jobs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No job applications added yet.
          </div>
        ) : (
          jobs.map((job) => {
            const currentStatusObj = statuses.find(s => s.value === job.status) || statuses[0];

            return (
              <div
                key={job.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{job.company}</span>
                      <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100">
                        {job.platform}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{job.role}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border-0 focus:ring-1 focus:ring-blue-600 cursor-pointer ${currentStatusObj.color}`}
                    >
                      {statuses.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDelete(job.id)}
                      title="Delete"
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {job.lastUpdate && (
                  <div className="mt-2 text-[11px] text-blue-900 bg-blue-50/70 p-1.5 rounded-lg border border-blue-100">
                    💡 <strong>Update:</strong> {job.lastUpdate}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
