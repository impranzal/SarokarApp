import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const STANCE_LABELS = { support: 'Support', oppose: 'Oppose', neutral: 'Neutral' };

export default function Transparency() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/consultations/${id}/transparency`)
      .then((res) => setData(res.data))
      .catch(() => setError('No public summary is available for this consultation yet.'));
  }, [id]);

  if (error) return <p className="max-w-3xl mx-auto px-6 py-12 text-sarokar-terracotta">{error}</p>;
  if (!data) return <p className="max-w-3xl mx-auto px-6 py-12 text-ink/50">Loading…</p>;

  const { consultation, stanceBreakdown, totalFeedback, governmentResponse } = data;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-2">Public transparency summary</p>
      <h1 className="font-serif text-3xl text-govblue-dark">{consultation.title}</h1>
      <p className="text-ink/60 text-sm mt-2">
        {totalFeedback} citizen submissions considered · {consultation.department}
      </p>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {['support', 'oppose', 'neutral'].map((s) => {
          const row = stanceBreakdown.find((r) => r._id === s);
          const count = row?.count || 0;
          const pct = totalFeedback ? Math.round((count / totalFeedback) * 100) : 0;
          return (
            <div key={s} className="border border-sarokar-mist rounded-lg p-5 text-center">
              <p className="text-3xl font-serif text-govblue-dark">{pct}%</p>
              <p className="text-sm text-ink/60 mt-1">{STANCE_LABELS[s]}</p>
              <p className="text-xs text-ink/40">{count} comments</p>
            </div>
          );
        })}
      </div>

      {governmentResponse?.summaryText ? (
        <div className="mt-10 border-l-4 border-sarokar-green pl-6">
          <h2 className="font-serif text-xl text-govblue-dark mb-2">Government response</h2>
          <p className="text-ink/70 leading-relaxed">{governmentResponse.summaryText}</p>
          {governmentResponse.actionTaken && (
            <p className="text-sm text-ink/50 mt-3">
              <span className="font-medium">Action taken: </span>{governmentResponse.actionTaken}
            </p>
          )}
          {governmentResponse.postedAt && (
            <p className="text-xs text-ink/40 mt-2">
              Published {new Date(governmentResponse.postedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-10 text-sm text-ink/50 border border-sarokar-mist rounded p-4">
          The responsible department has not yet published a response to this consultation.
        </p>
      )}
    </div>
  );
}
