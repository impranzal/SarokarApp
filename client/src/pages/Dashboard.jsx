import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../api/client';
import { StanceBadge } from '../components/Badges';

const STANCE_COLORS = { support: '#3E6B52', oppose: '#A85436', neutral: '#94A3A8' };

function BigNumber({ label, value, sub }) {
  return (
    <div className="border border-sarokar-mist rounded-lg p-5 bg-white/40">
      <p className="text-3xl font-serif text-govblue-dark">{value}</p>
      <p className="text-sm text-ink/60 mt-1">{label}</p>
      {sub && <p className="text-xs text-ink/40 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { consultationId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/dashboard/${consultationId}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard.'));
  }, [consultationId]);

  if (error) return <p className="max-w-6xl mx-auto px-6 py-12 text-sarokar-terracotta">{error}</p>;
  if (!data) return <p className="max-w-6xl mx-auto px-6 py-12 text-ink/50">Loading dashboard…</p>;

  const stancePie = data.stanceBreakdown.map((s) => ({ name: s._id, value: s.count }));
  const volumeLine = data.volumeOverTime.map((v) => ({ date: v._id, count: v.count }));
  const categoryBar = data.topCategories.map((c) => ({ category: c._id?.replace(/-/g, ' '), count: c.count }));

  const exportUrl = `${api.defaults.baseURL}/dashboard/${consultationId}/export.csv`;
  const download = (path, filename) => api.get(path, { responseType: 'blob' }).then((res) => {
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-1">Policymaker dashboard</p>
          <h1 className="font-serif text-3xl text-govblue-dark">{data.consultation.title}</h1>
        </div>
        <div className="flex gap-2">
        <a
          href={exportUrl}
          onClick={(e) => {
            // inject auth header via fetch+blob since <a> can't send headers
            e.preventDefault();
            api.get(`/dashboard/${consultationId}/export.csv`, { responseType: 'blob' }).then((res) => {
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'sarokar-report.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
            });
          }}
          className="border border-govblue-dark/30 text-govblue-dark px-4 py-2 rounded text-sm hover:bg-govblue-dark/5"
        >
          Export CSV report
        </a>
        <button
          type="button"
          onClick={() => download(`/dashboard/${consultationId}/export.pdf`, 'sarokar-report.pdf')}
          className="border border-govblue-dark/30 text-govblue-dark px-4 py-2 rounded text-sm hover:bg-govblue-dark/5"
        >
          Export PDF report
        </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <BigNumber label="Total feedback" value={data.totalFeedback} />
        <BigNumber
          label="Support"
          value={data.stanceBreakdown.find((s) => s._id === 'support')?.count || 0}
        />
        <BigNumber
          label="Oppose"
          value={data.stanceBreakdown.find((s) => s._id === 'oppose')?.count || 0}
        />
        <BigNumber label="Flagged for review" value={data.flaggedQueue.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="border border-sarokar-mist rounded-lg p-5">
          <h2 className="font-serif text-lg text-govblue-dark mb-4">Stance breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stancePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {stancePie.map((entry) => (
                  <Cell key={entry.name} fill={STANCE_COLORS[entry.name] || '#94A3A8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-sarokar-mist rounded-lg p-5">
          <h2 className="font-serif text-lg text-govblue-dark mb-4">Volume over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={volumeLine}>
              <CartesianGrid stroke="#DCE3E0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1E4258" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-sarokar-mist rounded-lg p-5 md:col-span-2">
          <h2 className="font-serif text-lg text-govblue-dark mb-4">Top themes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryBar} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid stroke="#DCE3E0" strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={160} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3E6B52" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-serif text-lg text-govblue-dark mb-4">Top keywords</h2>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 min-h-32" aria-label="Keyword cloud">
          {data.keywordCloud.map((k) => (
            <span
              key={k._id}
              className="inline-block text-govblue-dark/80 hover:text-govblue-dark transition-colors"
              style={{ fontSize: `${Math.min(14 + k.count * 2, 32)}px`, transform: `rotate(${(k._id.length % 5) - 2}deg)` }}
            >
              <span title={`${k.count} mentions`}>{k._id}</span>
            </span>
          ))}
          {data.keywordCloud.length === 0 && <p className="text-sm text-ink/50">No keywords extracted yet.</p>}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-serif text-lg text-govblue-dark mb-4">Representative comments by theme</h2>
        {data.totalFeedback === 0 && (
          <p className="text-sm text-ink/50 border border-sarokar-mist rounded p-4">
            No feedback has been submitted for this consultation yet.
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(data.representativeByCategory).map(([category, samples]) => (
            <div key={category} className="border border-sarokar-mist rounded-lg p-4">
              <p className="text-sm font-medium text-govblue-dark mb-2">{category.replace(/-/g, ' ')}</p>
              <div className="space-y-2">
                {samples.map((s, i) => (
                  <div key={i} className="text-sm border-l-2 border-sarokar-mist pl-3">
                    <StanceBadge stance={s.stance} />
                    <p className="text-ink/70 mt-1">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg text-govblue-dark mb-4">
          Flagged submissions queue ({data.flaggedQueue.length})
        </h2>
        {data.flaggedQueue.length === 0 ? (
          <p className="text-sm text-ink/50">No flagged submissions awaiting review.</p>
        ) : (
          <div className="space-y-2">
            {data.flaggedQueue.map((f) => (
              <div key={f._id} className="border border-sarokar-terracotta/30 bg-sarokar-terracotta/5 rounded p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <StanceBadge stance={f.stance} />
                  <span className="text-xs text-ink/50">by {f.user?.name || 'Unknown'}</span>
                  <span className="text-xs text-ink/40">similarity {Math.round(f.duplicateOfScore * 100)}%</span>
                </div>
                <p className="text-ink/70">{f.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
