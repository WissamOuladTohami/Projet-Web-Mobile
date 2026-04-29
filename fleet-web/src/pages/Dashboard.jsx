import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const StatCard = ({ label, value, trend, icon, color, dim }) => (
  <div style={{
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
    padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${dim}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{
      width: '52px', height: '52px', borderRadius: '14px', background: dim,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{trend}</div>
    </div>
  </div>
);

const lineData = [
  { name: 'Jan', val: 12 }, { name: 'Fév', val: 19 }, { name: 'Mar', val: 15 },
  { name: 'Avr', val: 28 }, { name: 'Mai', val: 22 }, { name: 'Jun', val: 35 },
];

const COLORS = ['#6C63FF', '#2ECC71', '#FF8C42'];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1a1a2e', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
      <div style={{ color: 'var(--muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: '#6C63FF', fontWeight: 600 }}>{payload[0].value}</div>
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuels, setFuels] = useState([]);

  useEffect(() => {
    api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => {});
    api.get('/drivers').then(r => setDrivers(r.data)).catch(() => {});
    api.get('/fuel-logs').then(r => setFuels(r.data)).catch(() => {});
  }, []);

  const active = vehicles.filter(v => v.status === 'active').length;
  const offline = vehicles.filter(v => v.status === 'offline').length;
  const totalFuel = fuels.reduce((s, l) => s + parseFloat(l.quantity || 0), 0).toFixed(1);

  const pieData = [
    { name: 'Actifs', value: active || 1 },
    { name: 'Hors ligne', value: offline || 1 },
    { name: 'Inactifs', value: Math.max(0, vehicles.length - active - offline) || 1 },
  ];

  const barData = vehicles.slice(0, 6).map(v => ({
    name: v.plate,
    fuel: parseFloat(fuels.filter(f => f.vehicle_id === v.id)
      .reduce((s, l) => s + parseFloat(l.quantity || 0), 0).toFixed(1)) || 0,
  }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Vue d'ensemble de votre flotte</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard label="Total Véhicules" value={vehicles.length} trend="Flotte complète" icon="🚗" color="#6C63FF" dim="rgba(108,99,255,0.15)" />
        <StatCard label="Chauffeurs" value={drivers.length} trend="Équipe active" icon="👤" color="#2ECC71" dim="rgba(46,204,113,0.15)" />
        <StatCard label="Véhicules actifs" value={active} trend={`${vehicles.length ? Math.round(active / vehicles.length * 100) : 0}% de la flotte`} icon="📍" color="#60A5FA" dim="rgba(96,165,250,0.15)" />
        <StatCard label="Carburant total" value={`${totalFuel}L`} trend="Consommation cumulée" icon="⛽" color="#FF8C42" dim="rgba(255,140,66,0.15)" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Activité GPS</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Positions enregistrées / mois</div>
            </div>
            <span style={{ fontSize: '11px', color: '#2ECC71', background: 'rgba(46,204,113,0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>↑ +24%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="val" stroke="#6C63FF" strokeWidth={2.5}
                dot={{ fill: '#6C63FF', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6C63FF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Statut flotte</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Répartition des véhicules</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Carburant par véhicule</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Consommation en litres</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={20}>
              <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="fuel" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Derniers véhicules</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>État de la flotte</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Plaque', 'Marque', 'Statut', 'Chauffeur'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 500, paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.slice(0, 5).map(v => (
                <tr key={v.id}>
                  <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, color: '#6C63FF' }}>{v.plate}</td>
                  <td style={{ padding: '10px 0', fontSize: '13px' }}>{v.brand}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                      background: v.status === 'active' ? 'rgba(46,204,113,0.15)' : v.status === 'offline' ? 'rgba(231,76,60,0.15)' : 'rgba(107,107,107,0.15)',
                      color: v.status === 'active' ? '#2ECC71' : v.status === 'offline' ? '#E74C3C' : 'var(--muted)',
                    }}>{v.status?.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: 'var(--muted)' }}>{v.driver_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}