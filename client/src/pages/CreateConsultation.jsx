import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreateConsultation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', titleNepali: '', description: '', fullDraftText: '',
    department: user.department || '', targetAudience: 'General Public',
    openDate: '', closeDate: '',
  });
  const [clauses, setClauses] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addClause() {
    setClauses((c) => [...c, { clauseId: String(c.length + 1), title: '', text: '' }]);
  }

  function updateClause(index, field, value) {
    setClauses((c) => c.map((cl, i) => (i === index ? { ...cl, [field]: value } : cl)));
  }

  function removeClause(index) {
    setClauses((c) => c.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/consultations', { ...form, clauses });
      navigate(`/officer/dashboard/${res.data.consultation._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create consultation.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl text-govblue-dark mb-2">New consultation</h1>
      <p className="text-ink/60 text-sm mb-8">
        Publish a draft policy for structured public comment. It starts as a draft — you'll publish it separately.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5">Title (Nepali) — optional</label>
          <input
            value={form.titleNepali}
            onChange={(e) => update('titleNepali', e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5">Short description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5">Full draft text — optional</label>
          <textarea
            rows={4}
            value={form.fullDraftText}
            onChange={(e) => update('fullDraftText', e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5">Department</label>
            <input
              required
              disabled={user.role === 'officer'}
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm disabled:bg-ink/5"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Target audience</label>
            <input
              value={form.targetAudience}
              onChange={(e) => update('targetAudience', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1.5">Comment window opens</label>
            <input
              type="date"
              required
              value={form.openDate}
              onChange={(e) => update('openDate', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Comment window closes</label>
            <input
              type="date"
              required
              value={form.closeDate}
              onChange={(e) => update('closeDate', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="border-t border-sarokar-mist pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Clauses (optional)</span>
            <button type="button" onClick={addClause} className="text-sm text-govblue-dark underline">
              + Add clause
            </button>
          </div>
          {clauses.map((cl, i) => (
            <div key={i} className="border border-sarokar-mist rounded p-3 mb-2 space-y-2">
              <div className="flex gap-2">
                <input
                  placeholder="Clause ID (e.g. 1)"
                  value={cl.clauseId}
                  onChange={(e) => updateClause(i, 'clauseId', e.target.value)}
                  className="w-24 border border-sarokar-mist rounded px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Clause title"
                  value={cl.title}
                  onChange={(e) => updateClause(i, 'title', e.target.value)}
                  className="flex-1 border border-sarokar-mist rounded px-2 py-1.5 text-sm"
                />
                <button type="button" onClick={() => removeClause(i)} className="text-sarokar-terracotta text-sm px-2">
                  Remove
                </button>
              </div>
              <textarea
                placeholder="Clause text"
                rows={2}
                value={cl.text}
                onChange={(e) => updateClause(i, 'text', e.target.value)}
                className="w-full border border-sarokar-mist rounded px-2 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-govblue-dark text-paper px-5 py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create as draft'}
        </button>
      </form>
    </div>
  );
}
