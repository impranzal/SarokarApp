import { useEffect, useState } from 'react';
import api from '../api/client';
import { GrievanceStatusBadge, CategoryChip } from '../components/Badges';

const STATUSES = ['submitted', 'under-review', 'resolved', 'closed'];

function ResponseForm({ grievance, onDone }) {
  const [status, setStatus] = useState(grievance.status);
  const [responseText, setResponseText] = useState(grievance.response?.text || '');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await api.patch(`/grievances/${grievance._id}/respond`, { status, responseText: responseText || undefined });
      onDone(res.data.grievance);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-sarokar-mist pt-3 space-y-2">
      <div className="flex gap-2 items-center">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-sarokar-mist rounded px-2 py-1.5 text-xs">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="bg-govblue-dark text-paper px-3 py-1.5 rounded text-xs hover:bg-govblue disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Update'}
        </button>
      </div>
      <textarea
        rows={2}
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Write a response to the citizen (optional)…"
        className="w-full border border-sarokar-mist rounded px-2 py-1.5 text-xs"
      />
    </div>
  );
}

export default function GrievanceQueue() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    setLoading(true);
    api.get('/grievances', { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setGrievances(res.data.grievances))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  function handleUpdated(updated) {
    setGrievances((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-1">Administration</p>
        <h1 className="font-serif text-3xl text-govblue-dark">Grievance queue</h1>
        <p className="text-ink/60 text-sm mt-1">Citizen complaints for your department and general administration.</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`text-sm px-3 py-1.5 rounded border ${
              statusFilter === s ? 'bg-govblue-dark text-paper border-govblue-dark' : 'border-sarokar-mist text-ink/60'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink/50 text-sm">Loading…</p>}
      {!loading && grievances.length === 0 && <p className="text-ink/50 text-sm">No grievances match this filter.</p>}

      <div className="space-y-3">
        {grievances.map((g) => (
          <div key={g._id} className="border border-sarokar-mist rounded-lg p-4 bg-white/40">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <GrievanceStatusBadge status={g.status} />
              <CategoryChip category={g.category} />
              <span className="text-xs text-ink/40">{g.department}</span>
              <span className="text-xs text-ink/40">by {g.user?.name || 'Unknown'}</span>
              {g.relatedConsultation && <span className="text-xs text-ink/40">re: {g.relatedConsultation.title}</span>}
            </div>
            <p className="font-medium text-ink/90">{g.subject}</p>
            <p className="text-sm text-ink/60 mt-1">{g.description}</p>
            <ResponseForm grievance={g} onDone={handleUpdated} />
          </div>
        ))}
      </div>
    </div>
  );
}
