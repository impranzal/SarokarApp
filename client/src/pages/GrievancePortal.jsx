import { useEffect, useState } from 'react';
import api from '../api/client';
import { GrievanceStatusBadge, CategoryChip } from '../components/Badges';

const CATEGORIES = ['service-quality', 'corruption', 'delay', 'mismanagement', 'technical-issue', 'other'];

export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'service-quality', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    api.get('/grievances')
      .then((res) => setGrievances(res.data.grievances))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/grievances', form);
      setForm({ subject: '', category: 'service-quality', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your grievance.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-1">Grievance Portal</p>
          <h1 className="font-serif text-3xl text-govblue-dark">Report a concern</h1>
          <p className="text-ink/60 text-sm mt-1">
            For administrative complaints separate from policy feedback — service quality, delays, or mismanagement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="bg-govblue-dark text-paper px-4 py-2.5 rounded hover:bg-govblue transition-colors text-sm shrink-0"
        >
          {showForm ? 'Cancel' : '+ File a grievance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-sarokar-mist rounded-lg p-6 mb-8 space-y-4 bg-white/40">
          <div>
            <label className="block text-sm mb-1.5">Subject</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5">Description</label>
            <textarea
              required
              rows={5}
              maxLength={3000}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what happened, when, and which office or service was involved."
              className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="bg-govblue-dark text-paper px-5 py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60 text-sm"
          >
            {busy ? 'Submitting…' : 'Submit grievance'}
          </button>
        </form>
      )}

      <h2 className="font-serif text-lg text-govblue-dark mb-4">Your grievances</h2>
      {loading && <p className="text-ink/50 text-sm">Loading…</p>}
      {!loading && grievances.length === 0 && (
        <p className="text-ink/50 text-sm">You haven't filed any grievances yet.</p>
      )}
      <div className="space-y-3">
        {grievances.map((g) => (
          <div key={g._id} className="border border-sarokar-mist rounded-lg p-4 bg-white/40">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <GrievanceStatusBadge status={g.status} />
              <CategoryChip category={g.category} />
              <span className="text-xs text-ink/40">{g.department}</span>
            </div>
            <p className="font-medium text-ink/90">{g.subject}</p>
            <p className="text-sm text-ink/60 mt-1">{g.description}</p>
            {g.response?.text && (
              <div className="mt-3 border-l-2 border-sarokar-green pl-3">
                <p className="text-xs text-sarokar-green font-medium mb-1">Department response</p>
                <p className="text-sm text-ink/70">{g.response.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
