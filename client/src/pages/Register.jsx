import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name, email, password);
      navigate('/consultations');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-3xl text-govblue-dark mb-2">Create a citizen account</h1>
      <p className="text-ink/60 mb-8 text-sm">
        Officer and admin accounts are provisioned separately by the department.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1.5" htmlFor="name">Full name</label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 focus:border-govblue outline-none"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-sarokar-mist rounded px-3 py-2.5 focus:border-govblue outline-none"
          />
          <p className="text-xs text-ink/50 mt-1">At least 8 characters.</p>
        </div>

        {error && <p className="text-sarokar-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-govblue-dark text-paper py-2.5 rounded hover:bg-govblue transition-colors disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        Already registered? <Link to="/login" className="text-govblue-dark underline">Log in</Link>
      </p>
    </div>
  );
}
