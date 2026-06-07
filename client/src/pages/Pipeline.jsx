import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import useSocket from '../hooks/useSocket';

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-purple-500' },
  { id: 'closed_won', label: 'Won', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Lost', color: 'bg-red-500' },
];

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', contact: '', notes: '' });

  const fetchDeals = useCallback(async () => {
    const { data } = await api.get('/deals');
    setDeals(data);
  }, []);

  const fetchContacts = useCallback(async () => {
    const { data } = await api.get('/contacts');
    setContacts(data);
  }, []);

  useEffect(() => { fetchDeals(); fetchContacts(); }, [fetchDeals, fetchContacts]);

  useSocket('deal:created', fetchDeals);
  useSocket('deal:updated', fetchDeals);
  useSocket('deal:deleted', fetchDeals);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const dealId = result.draggableId;
    const newStage = result.destination.droppableId;

    setDeals((prev) =>
      prev.map((d) => (d._id === dealId ? { ...d, stage: newStage } : d))
    );

    await api.put(`/deals/${dealId}`, { stage: newStage });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/deals', {
      title: form.title,
      value: parseFloat(form.value),
      contact: form.contact,
      notes: form.notes,
    });
    setForm({ title: '', value: '', contact: '', notes: '' });
    setShowForm(false);
    fetchDeals();
  };

  const handleDelete = async (id) => {
    await api.delete(`/deals/${id}`);
    fetchDeals();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white">Pipeline</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
        >
          + New Deal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-800 mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
          <input
            type="number"
            placeholder="Value ($)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
          <select
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          >
            <option value="">Select contact</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>{c.name} - {c.company}</option>
            ))}
          </select>
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="md:col-span-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
            Create Deal
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <Droppable key={stage.id} droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl p-3 min-h-[300px] lg:min-h-[400px] min-w-[260px] lg:min-w-0 snap-start transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-800' : 'bg-gray-900/50'
                    } border border-gray-800`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <span className="text-sm font-medium text-gray-300">{stage.label}</span>
                      <span className="text-xs text-gray-600 ml-auto">{stageDeals.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">${totalValue.toLocaleString()}</p>

                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal._id} draggableId={deal._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700 hover:border-gray-600 transition-colors group"
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-white font-medium">{deal.title}</p>
                              <button
                                onClick={() => handleDelete(deal._id)}
                                className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-xs text-emerald-400 mt-1">${deal.value.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{deal.contact?.name}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Pipeline;
