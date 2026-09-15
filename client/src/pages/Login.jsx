import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/consultations');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-3xl text-govblue-dark mb-2">Log in</h1>
      <p className="text-ink/60 mb-8 text-sm">Access your consultations and submitted feedback.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 focus:border-govblue outline-none"
          />
        </div>
        <div>
          <label className="block text-sm mb-1.5" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 focus:border-govblue outline-none"
          />
        </div>

        {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-govblue-dark text-paper py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        No account yet? <Link to="/register" className="text-govblue-dark underline">Register as a citizen</Link>
      </p>
    </div>
  );
}
