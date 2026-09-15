import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge } from '../components/Badges';
import FeedbackForm from '../components/FeedbackForm';

export default function ConsultationDetail() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/consultations/${id}`)
      .then((res) => setConsultation(res.data.consultation))
      .catch(() => setError('Consultation not found.'));
  }, [id]);

  if (error) return <p className="max-w-3xl mx-auto px-6 py-12 text-sarokar-terracotta">{error}</p>;
  if (!consultation) return <p className="max-w-3xl mx-auto px-6 py-12 text-ink/50">Loading…</p>;

  const isOpen = consultation.status === 'open';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <StatusBadge status={consultation.status} />
        <span className="text-xs text-ink/50">{consultation.department}</span>
      </div>
      <h1 className="font-serif text-3xl md:text-4xl text-govblue-dark">{consultation.title}</h1>
      {consultation.titleNepali && <p className="text-ink/50 mt-1">{consultation.titleNepali}</p>}

      <p className="text-ink/70 mt-5 leading-relaxed">{consultation.description}</p>

      <p className="text-xs text-ink/40 mt-4">
        Comment window: {new Date(consultation.openDate).toLocaleDateString()} — {new Date(consultation.closeDate).toLocaleDateString()}
        {' · '}Target audience: {consultation.targetAudience}
      </p>

      {consultation.fullDraftText && (
        <details className="mt-6 border border-sarokar-mist rounded p-4">
          <summary className="cursor-pointer font-medium text-sm text-govblue-dark">Read full draft text</summary>
          <p className="text-sm text-ink/70 mt-3 whitespace-pre-line leading-relaxed">{consultation.fullDraftText}</p>
        </details>
      )}

      {consultation.clauses?.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="font-serif text-lg text-govblue-dark">Clauses</h2>
          {consultation.clauses.map((c) => (
            <div key={c.clauseId} className="border-l-2 border-sarokar-mist pl-4">
              <p className="text-sm font-medium">Clause {c.clauseId}{c.title ? ` — ${c.title}` : ''}</p>
              <p className="text-sm text-ink/60">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {['closed', 'archived'].includes(consultation.status) && (
        <div className="mt-6">
          <Link
            to={`/consultations/${consultation._id}/transparency`}
            className="text-sm text-govblue-dark underline"
          >
            View the public summary and government response →
          </Link>
        </div>
      )}

      <div className="mt-10">
        {isOpen ? (
          <FeedbackForm consultation={consultation} />
        ) : (
          <p className="text-sm text-ink/50 border border-sarokar-mist rounded p-4">
            This consultation is not currently accepting new feedback.
          </p>
        )}
      </div>
    </div>
  );
}
