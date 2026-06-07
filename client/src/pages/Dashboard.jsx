import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STAGE_LABELS = {
  lead: 'Lead', qualified: 'Qualified', proposal: 'Proposal',
  negotiation: 'Negotiation', closed_won: 'Won', closed_lost: 'Lost',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchData = useCallback(async () => {
    const [s, r, l, a] = await Promise.all([
      api.get('/deals/stats'),
      api.get('/deals/revenue-over-time'),
      api.get('/deals/leaderboard'),
      api.get('/activities?limit=10'),
    ]);
    setStats(s.data);
    setRevenue(r.data);
    setLeaderboard(l.data);
    setActivities(a.data);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time updates
  useSocket('deal:created', fetchData);
  useSocket('deal:updated', fetchData);
  useSocket('deal:deleted', fetchData);
  useSocket('activity:new', useCallback(async () => {
    const { data } = await api.get('/activities?limit=10');
    setActivities(data);
  }, []));

  if (!stats) return (
    <div>
      <div className="h-8 w-40 bg-gray-800 rounded-lg mb-8 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="h-4 w-20 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-7 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 h-[280px] animate-pulse" />
        ))}
      </div>
    </div>
  );

  const stageData = stats.byStage.map((s) => ({
    name: STAGE_LABELS[s._id] || s._id,
    count: s.count,
    value: s.totalValue,
  }));

  const pieData = stageData.filter((s) => s.count > 0);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard label="Total Deals" value={stats.totalDeals} />
        <StatCard label="Won Deals" value={stats.wonDeals} color="text-emerald-400" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} color="text-blue-400" />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="text-yellow-400" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Revenue over time */}
        <div className="bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="_id" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} width={45} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deals by stage */}
        <div className="bg-gray-900 rounded-xl p-4 md:p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Deals by Stage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Win/Loss pie */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Deal Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {leaderboard.map((person, i) => (
              <div key={person._id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.dealsWon} deals</p>
                </div>
                <span className="text-sm font-medium text-emerald-400">${person.totalRevenue.toLocaleString()}</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600 text-2xl mb-2">🏆</p>
                <p className="text-gray-500 text-sm">No closed deals yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a._id} className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">{a.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {a.user?.name} · {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600 text-2xl mb-2">📋</p>
                <p className="text-gray-500 text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = 'text-white' }) => (
  <div className="bg-gray-900 rounded-xl p-4 md:p-5 border border-gray-800">
    <p className="text-xs md:text-sm text-gray-400 mb-1">{label}</p>
    <p className={`text-lg md:text-2xl font-bold ${color} truncate`}>{value}</p>
  </div>
);

export default Dashboard;
