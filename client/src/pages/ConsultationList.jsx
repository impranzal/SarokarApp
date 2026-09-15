import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge } from '../components/Badges';

export default function ConsultationList() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/consultations', { params: search ? { search } : {} })
      .then((res) => setConsultations(res.data.consultations))
      .catch(() => setError('Could not load consultations.'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-govblue-dark">Open consultations</h1>
          <p className="text-ink/60 text-sm mt-1">Draft policies currently open for public comment.</p>
        </div>
        <input
          type="search"
          placeholder="Search by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-sarokar-mist rounded px-3 py-2 text-sm w-72 focus:border-govblue outline-none"
        />
      </div>

      {loading && <p className="text-ink/50">Loading consultations…</p>}
      {error && <p className="text-sarokar-terracotta">{error}</p>}
      {!loading && !error && consultations.length === 0 && (
        <p className="text-ink/50">No consultations match this view yet.</p>
      )}

      <div className="grid gap-4">
        {consultations.map((c) => (
          <Link
            key={c._id}
            to={`/consultations/${c._id}`}
            className="block border border-sarokar-mist rounded-lg p-6 hover:border-govblue/50 transition-colors bg-white/40"
          >
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={c.status} />
              <span className="text-xs text-ink/50">{c.department}</span>
            </div>
            <h2 className="font-serif text-xl text-govblue-dark">{c.title}</h2>
            {c.titleNepali && <p className="text-sm text-ink/50">{c.titleNepali}</p>}
            <p className="text-ink/70 text-sm mt-2 line-clamp-2">{c.description}</p>
            <p className="text-xs text-ink/40 mt-3">
              Open {new Date(c.openDate).toLocaleDateString()} — {new Date(c.closeDate).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
