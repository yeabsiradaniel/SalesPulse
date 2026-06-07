import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });

  const fetchContacts = useCallback(async () => {
    const { data } = await api.get(`/contacts${search ? `?search=${search}` : ''}`);
    setContacts(data);
  }, [search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/contacts', form);
    setForm({ name: '', email: '', phone: '', company: '', notes: '' });
    setShowForm(false);
    fetchContacts();
  };

  const handleDelete = async (id) => {
    await api.delete(`/contacts/${id}`);
    fetchContacts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white">Contacts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
        >
          + New Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-800 mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" required />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="md:col-span-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
          <button type="submit" className="md:col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Add Contact</button>
        </form>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Phone</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-5 py-3 text-sm text-white font-medium">{c.name}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{c.company || '-'}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{c.email || '-'}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{c.phone || '-'}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(c._id)} className="text-xs text-gray-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">No contacts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;
