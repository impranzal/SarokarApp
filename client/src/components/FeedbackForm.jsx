import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'economic-impact', 'implementation-feasibility', 'rights-concern',
  'drafting-clarity', 'environmental-impact', 'administrative-burden', 'other',
];

export default function FeedbackForm({ consultation, onSubmitted }) {
  const { user } = useAuth();
  const [clauseId, setClauseId] = useState('');
  const [stance, setStance] = useState('neutral');
  const [manualCategory, setManualCategory] = useState('');
  const [text, setText] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-ink/60 border border-sarokar-mist rounded p-4">
        Please log in as a citizen to submit feedback on this consultation.
      </p>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/feedback', {
        consultationId: consultation._id,
        clauseId: clauseId || undefined,
        stance,
        manualCategory: manualCategory || undefined,
        text,
        evidenceLink: evidenceLink || undefined,
      });
      setDone(true);
      onSubmitted?.(res.data.feedback);
    } catch (err) {
      const details = err.response?.data?.errors?.map((item) => item.message).join(' ');
      setError(details || err.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="border border-sarokar-green/30 bg-sarokar-green/5 rounded p-4 text-sarokar-green text-sm">
        Thank you — your feedback has been recorded and analyzed.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-sarokar-mist rounded-lg p-6 bg-white/40">
      <h3 className="font-serif text-lg text-govblue-dark">Submit your feedback</h3>

      {consultation.clauses?.length > 0 && (
        <div>
          <label className="block text-sm mb-1.5">Which clause? (optional — leave blank for overall)</label>
          <select
            value={clauseId}
            onChange={(e) => setClauseId(e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm"
          >
            <option value="">Policy as a whole</option>
            {consultation.clauses.map((c) => (
              <option key={c.clauseId} value={c.clauseId}>
                Clause {c.clauseId}{c.title ? ` — ${c.title}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="block text-sm mb-1.5">Your stance</span>
        <div className="flex gap-3">
          {['support', 'oppose', 'neutral'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStance(s)}
              className={`px-4 py-2 rounded text-sm border capitalize transition-colors ${
                stance === s
                  ? 'bg-govblue-dark text-paper border-govblue-dark'
                  : 'border-sarokar-mist text-ink/70 hover:border-govblue/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1.5">Category (optional — we'll also auto-detect this)</label>
        <select
          value={manualCategory}
          onChange={(e) => setManualCategory(e.target.value)}
          className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm"
        >
          <option value="">Let the system decide</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1.5">Your comment</label>
        <textarea
          required
          maxLength={2000}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Explain your position clearly — this will be analyzed and included in the public dashboard."
          className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm focus:border-govblue outline-none"
        />
        <p className="text-xs text-ink/40 mt-1">{text.length}/2000</p>
      </div>

      <div>
        <label className="block text-sm mb-1.5">Supporting link (optional)</label>
        <input
          type="url"
          value={evidenceLink}
          onChange={(e) => setEvidenceLink(e.target.value)}
          placeholder="https://…"
          className="w-full border border-sarokar-mist rounded px-3 py-2 text-sm focus:border-govblue outline-none"
        />
      </div>

      {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="bg-govblue-dark text-paper px-5 py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60"
      >
        {busy ? 'Submitting…' : 'Submit feedback'}
      </button>
    </form>
  );
}
