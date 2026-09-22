import { useState } from 'react';
import api from '../api/client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/contact', form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your message. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-2">Get in touch</p>
      <h1 className="font-serif text-3xl text-govblue-dark mb-6">Contact</h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-10 text-sm">
        <div>
          <p className="text-ink/50 mb-1">General inquiries</p>
          <p className="text-ink/80">support@sarokar.gov.np</p>
        </div>
        <div>
          <p className="text-ink/50 mb-1">Office hours</p>
          <p className="text-ink/80">Sunday–Friday, 10:00–17:00 (NPT)</p>
        </div>
      </div>

      {done ? (
        <div className="border border-sarokar-green/30 bg-sarokar-green/5 rounded p-4 text-sarokar-green text-sm">
          Thank you — your message has been received. We'll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 border border-sarokar-mist rounded-lg p-6 bg-white/40">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5">Your name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm focus:border-govblue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm focus:border-govblue outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5">Subject</label>
            <input
              required
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm focus:border-govblue outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="w-full border border-sarokar-mist rounded px-3 py-2.5 text-sm focus:border-govblue outline-none"
            />
          </div>

          {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="bg-govblue-dark text-paper px-5 py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
