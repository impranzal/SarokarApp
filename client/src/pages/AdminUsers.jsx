import { useEffect, useState } from 'react';
import api from '../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'officer', department: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users.');
    }
  }
  useEffect(() => { loadUsers(); }, []);

  async function createUser(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'officer', department: '' });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not provision account.');
    } finally { setBusy(false); }
  }

  async function updateUser(user, changes) {
    try {
      const res = await api.patch(`/users/${user.id}/role`, changes);
      setUsers((current) => current.map((item) => (item.id === user.id ? res.data.user : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update account.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-1">Administration</p>
      <h1 className="font-serif text-3xl text-govblue-dark mb-8">User management</h1>
      {error && <p role="alert" className="text-sarokar-terracotta mb-4">{error}</p>}
      <form onSubmit={createUser} className="grid md:grid-cols-5 gap-3 border border-sarokar-mist rounded-lg p-5 mb-10">
        {['name', 'email', 'password'].map((field) => (
          <input key={field} required value={form[field]} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            placeholder={field[0].toUpperCase() + field.slice(1)} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="border border-sarokar-mist rounded px-3 py-2 text-sm" />
        ))}
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border border-sarokar-mist rounded px-3 py-2 text-sm">
          <option value="officer">Officer</option><option value="admin">Admin</option>
        </select>
        <input required={form.role === 'officer'} value={form.department} placeholder="Department" onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="border border-sarokar-mist rounded px-3 py-2 text-sm" />
        <button disabled={busy} className="md:col-span-5 bg-govblue-dark text-paper rounded px-4 py-2 disabled:opacity-60">{busy ? 'Provisioning…' : 'Provision account'}</button>
      </form>
      <div className="overflow-x-auto border border-sarokar-mist rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-sarokar-mist/30"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Department</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-sarokar-mist">
            <td className="p-3">{user.name}</td><td className="p-3">{user.email}</td>
            <td className="p-3"><select value={user.role} onChange={(e) => updateUser(user, { role: e.target.value })} className="border rounded px-2 py-1"><option>citizen</option><option>officer</option><option>admin</option></select></td>
            <td className="p-3"><input defaultValue={user.department || ''} aria-label={`Department for ${user.name}`} onBlur={(e) => e.target.value !== (user.department || '') && updateUser(user, { department: e.target.value })} className="border rounded px-2 py-1" /></td>
            <td className="p-3">{user.isActive === false ? 'Inactive' : 'Active'}</td>
            <td className="p-3"><button onClick={() => updateUser(user, { isActive: user.isActive === false })} className="text-govblue-dark underline">{user.isActive === false ? 'Activate' : 'Deactivate'}</button></td>
          </tr>)}</tbody>
        </table>
        {users.length === 0 && <p className="p-5 text-ink/50">No users found.</p>}
      </div>
    </div>
  );
}
