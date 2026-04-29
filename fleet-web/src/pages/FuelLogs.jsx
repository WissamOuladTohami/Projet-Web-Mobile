import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '9px 14px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', transition: 'all 0.2s', width: '100%',
};

const ChartTooltip = ({ active, payload }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1a2235', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
      <span style={{ color: '#6C63FF', fontWeight: 600 }}>{payload[0].value} L</span>
    </div>
  );
  return null;
};

export default function FuelLogs() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState({ vehicle_id: '', quantity: '', note: '' });
  const [search, setSearch] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [sortBy, setSortBy] = useState('desc');

  const load = () => {
    api.get('/fuel-logs').then(r => setLogs(r.data));
    api.get('/fuel-logs/stats').then(r => setStats(r.data));
  };

  useEffect(() => {
    load();
    api.get('/vehicles').then(r => setVehicles(r.data));
  }, []);

  const filtered = useMemo(() => {
    let list = [...logs];
    if (search) list = list.filter(l =>
      l.plate?.toLowerCase().includes(search.toLowerCase()) ||
      l.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.note?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterVehicle !== 'all') list = list.filter(l => String(l.vehicle_id) === filterVehicle);
    list.sort((a, b) => {
      const da = new Date(a.logged_at), db = new Date(b.logged_at);
      return sortBy === 'desc' ? db - da : da - db;
    });
    return list;
  }, [logs, search, filterVehicle, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/fuel-logs', form);
    setForm({ vehicle_id: '', quantity: '', note: '' }); load();
  };

  const total = filtered.reduce((s, l) => s + parseFloat(l.quantity || 0), 0).toFixed(1);
  const chartData = stats.map(s => ({ name: s.plate, total: parseFloat(s.total) }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Carburant</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
          Total affiché : <span style={{ color: '#6C63FF', fontWeight: 600 }}>{total} L</span>
        </p>
      </div>

      {/* Graphique */}
      {chartData.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Consommation par véhicule</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Total en litres</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={22}>
              <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '14px', fontWeight: 600 }}>+ ENREGISTRER CONSOMMATION</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>VÉHICULE</label>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required style={inputStyle}>
              <option value="">— Sélectionner —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.brand}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>QUANTITÉ (L)</label>
            <input type="number" min="0" step="0.01" value={form.quantity} required style={inputStyle}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>NOTE</label>
            <input value={form.note} style={inputStyle}
              onChange={e => setForm({ ...form, note: e.target.value })}
              onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '9px 20px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(108,99,255,0.3)', whiteSpace: 'nowrap',
          }}>Ajouter</button>
        </div>
      </form>

      {/* Filtres */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher véhicule, chauffeur, note..."
            style={{ ...inputStyle, paddingLeft: '34px' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>}
        </div>

        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="all">Tous les véhicules</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ val: 'desc', label: '↓ Plus récent' }, { val: 'asc', label: '↑ Plus ancien' }].map(({ val, label }) => (
            <button key={val} onClick={() => setSortBy(val)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
              fontWeight: sortBy === val ? 600 : 400,
              background: sortBy === val ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${sortBy === val ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: sortBy === val ? '#8B85FF' : 'var(--muted)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {['Véhicule', 'Chauffeur', 'Quantité', 'Note', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun résultat</td></tr>
            )}
            {filtered.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 18px', fontWeight: 600, color: '#8B85FF' }}>{l.plate}</td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)' }}>{l.driver_name || '—'}</td>
                <td style={{ padding: '13px 18px' }}>
                  <span style={{ fontWeight: 600 }}>{l.quantity}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}> L</span>
                </td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)', fontSize: '12px' }}>{l.note || '—'}</td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)', fontSize: '12px' }}>
                  {new Date(l.logged_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '13px 18px' }}>
                  <button onClick={async () => { if (confirm('Supprimer ?')) { await api.delete(`/fuel-logs/${l.id}`); load(); } }} style={{
                    background: 'rgba(231,76,60,0.1)', color: '#E74C3C',
                    border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px',
                    padding: '5px 12px', fontSize: '11px', cursor: 'pointer',
                  }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}