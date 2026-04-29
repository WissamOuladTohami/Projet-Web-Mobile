import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '9px 14px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', transition: 'all 0.2s', width: '100%',
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const load = () => api.get('/drivers').then(r => setDrivers(r.data));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...drivers];
    if (search) list = list.filter(d =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterRole !== 'all') list = list.filter(d => d.role === filterRole);
    list.sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''));
    return list;
  }, [drivers, search, filterRole, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/drivers', { ...form, role: 'driver' });
    setForm({ name: '', email: '', password: '', phone: '' }); load();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Chauffeurs</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} enregistré{drivers.length > 1 ? 's' : ''}</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '14px', fontWeight: 600 }}>+ AJOUTER CHAUFFEUR</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          {[
            { key: 'name', label: 'Nom', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'password', label: 'Mot de passe', type: 'password' },
            { key: 'phone', label: 'Téléphone', type: 'text', required: false },
          ].map(({ key, label, type, required = true }) => (
            <div key={key}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
              <input type={type} style={inputStyle} value={form[key]} required={required}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher nom, email, téléphone..."
            style={{ ...inputStyle, paddingLeft: '34px' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { val: 'all', label: 'Tous' },
            { val: 'admin', label: '★ Admin' },
            { val: 'driver', label: '● Chauffeur' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilterRole(val)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
              fontWeight: filterRole === val ? 600 : 400,
              background: filterRole === val ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterRole === val ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: filterRole === val ? '#8B85FF' : 'var(--muted)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="name">Trier : Nom</option>
          <option value="email">Trier : Email</option>
          <option value="role">Trier : Rôle</option>
        </select>

        <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {['Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun résultat</td></tr>
            )}
            {filtered.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 18px', fontWeight: 600 }}>{d.name}</td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)', fontSize: '13px' }}>{d.email}</td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)' }}>{d.phone || '—'}</td>
                <td style={{ padding: '13px 18px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                    background: d.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(108,99,255,0.15)',
                    color: d.role === 'admin' ? '#D4AF37' : '#8B85FF',
                  }}>{d.role?.toUpperCase()}</span>
                </td>
                <td style={{ padding: '13px 18px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                    background: d.status === 'active' ? 'rgba(46,204,113,0.15)' : 'rgba(107,107,107,0.15)',
                    color: d.status === 'active' ? '#2ECC71' : 'var(--muted)',
                  }}>{d.status?.toUpperCase()}</span>
                </td>
                <td style={{ padding: '13px 18px' }}>
                  <button onClick={async () => { if (confirm('Supprimer ?')) { await api.delete(`/drivers/${d.id}`); load(); } }} style={{
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