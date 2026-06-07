import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' });
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    const { data } = await api.get('/users');
    setMembers(data);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'sales' });
      setShowForm(false);
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/${id}`);
    fetchMembers();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white">Team</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
          >
            + Add Member
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-800 mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {error && <div className="md:col-span-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500">
            <option value="sales">Sales</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="md:col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Add Member</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m._id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                {m.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{m.name}</p>
                <p className="text-xs text-gray-500">{m.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                m.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {m.role}
              </span>
            </div>
            {isAdmin && m._id !== user._id && (
              <button
                onClick={() => handleDelete(m._id)}
                className="mt-3 text-xs text-gray-500 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
