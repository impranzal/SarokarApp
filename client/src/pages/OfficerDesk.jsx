import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export default function OfficerDesk() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = user.role === 'officer' ? { mine: 'true' } : undefined;
    api
      .get('/consultations', { params })
      .then((res) => setConsultations(res.data.consultations))
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false));
  }, [user.role]);

  async function changeStatus(id, status) {
    await api.patch(`/consultations/${id}/status`, { status });
    setConsultations((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-govblue-dark">Officer desk</h1>
          <p className="text-ink/60 text-sm mt-1">
            {user.role === 'officer' ? `${user.department} consultations` : 'All consultations'}
          </p>
        </div>
        <Link
          to="/officer/new"
          className="bg-govblue-dark text-paper px-4 py-2.5 rounded hover:bg-govblue transition-colors text-sm"
        >
          + New consultation
        </Link>
      </div>

      {loading && <p className="text-ink/50">Loading…</p>}

      <div className="grid gap-4">
        {consultations.map((c) => (
          <div key={c._id} className="border border-sarokar-mist rounded-lg p-5 bg-white/40">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <StatusBadge status={c.status} />
                </div>
                <h2 className="font-serif text-lg text-govblue-dark">{c.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link to={`/officer/dashboard/${c._id}`} className="text-govblue-dark underline">
                  Dashboard
                </Link>
                {c.status === 'draft' && (
                  <button
                    type="button"
                    onClick={() => changeStatus(c._id, 'open')}
                    className="border border-sarokar-green/40 text-sarokar-green px-3 py-1.5 rounded hover:bg-sarokar-green/5"
                  >
                    Publish
                  </button>
                )}
                {c.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => changeStatus(c._id, 'closed')}
                    className="border border-govblue/40 text-govblue px-3 py-1.5 rounded hover:bg-govblue/5"
                  >
                    Close
                  </button>
                )}
                {c.status === 'closed' && (
                  <Link
                    to={`/consultations/${c._id}/transparency`}
                    className="border border-sarokar-mist px-3 py-1.5 rounded hover:border-govblue/50"
                  >
                    Public page
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && consultations.length === 0 && (
          <p className="text-ink/50 text-sm">
            {user.role === 'admin' ? 'No consultations found.' : "You haven't created any consultations yet."}
          </p>
        )}
      </div>
    </div>
  );
}
