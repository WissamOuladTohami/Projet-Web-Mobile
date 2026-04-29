import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', padding: '9px 14px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', transition: 'all 0.2s', width: '100%',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ plate: '', brand: '', model: '' });
  const [editing, setEditing] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('plate');

  const load = () => {
    api.get('/vehicles').then(r => setVehicles(r.data));
    api.get('/drivers').then(r => setDrivers(r.data));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = [...vehicles];
    if (search) list = list.filter(v =>
      v.plate?.toLowerCase().includes(search.toLowerCase()) ||
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase()) ||
      v.driver_name?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus !== 'all') list = list.filter(v => v.status === filterStatus);
    list.sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''));
    return list;
  }, [vehicles, search, filterStatus, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) { await api.put(`/vehicles/${editing}`, form); }
    else { await api.post('/vehicles', form); }
    setForm({ plate: '', brand: '', model: '' }); setEditing(null); load();
  };

  const handleAssign = async (vehicleId) => {
    await api.put(`/vehicles/${vehicleId}/assign`, { driver_id: selectedDriver || null });
    setAssigning(null); setSelectedDriver(''); load();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Véhicules</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''} enregistré{vehicles.length > 1 ? 's' : ''}</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '14px', fontWeight: 600 }}>
          {editing ? '✏ MODIFIER VÉHICULE' : '+ AJOUTER VÉHICULE'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          {[{ key: 'plate', label: 'Plaque' }, { key: 'brand', label: 'Marque' }, { key: 'model', label: 'Modèle' }].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
              <input style={inputStyle} value={form[key]} required
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', color: '#fff',
              border: 'none', borderRadius: '8px', padding: '9px 20px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
            }}>{editing ? 'Modifier' : 'Ajouter'}</button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm({ plate: '', brand: '', model: '' }); }} style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--muted)',
                border: '1px solid var(--border)', borderRadius: '8px',
                padding: '9px 14px', fontSize: '13px', cursor: 'pointer',
              }}>✕</button>
            )}
          </div>
        </div>
      </form>

      {/* Filtres */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher plaque, marque, chauffeur..."
            style={{ ...inputStyle, paddingLeft: '34px' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>}
        </div>

        {/* Filtre statut */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { val: 'all', label: 'Tous' },
            { val: 'active', label: '● Actifs' },
            { val: 'offline', label: '● Hors ligne' },
            { val: 'inactive', label: '● Inactifs' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilterStatus(val)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
              fontWeight: filterStatus === val ? 600 : 400,
              background: filterStatus === val ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterStatus === val ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: filterStatus === val ? '#8B85FF' : 'var(--muted)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Tri */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          ...inputStyle, width: 'auto', paddingRight: '28px', cursor: 'pointer',
        }}>
          <option value="plate">Trier : Plaque</option>
          <option value="brand">Trier : Marque</option>
          <option value="status">Trier : Statut</option>
        </select>

        <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Modal affectation */}
      {assigning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111827', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', width: '380px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Affecter un chauffeur</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
              Véhicule : <span style={{ color: '#6C63FF', fontWeight: 600 }}>{vehicles.find(v => v.id === assigning)?.plate}</span>
            </div>
            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
              style={{ ...inputStyle, marginBottom: '20px', width: '100%' }}>
              <option value="">— Aucun chauffeur —</option>
              {drivers.filter(d => d.status === 'active').map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleAssign(assigning)} style={{
                flex: 1, background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}>Confirmer</button>
              <button onClick={() => { setAssigning(null); setSelectedDriver(''); }} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
                border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer',
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {['Plaque', 'Marque', 'Modèle', 'Statut', 'Chauffeur', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun résultat</td></tr>
            )}
            {filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 18px', fontWeight: 600, color: '#8B85FF' }}>{v.plate}</td>
                <td style={{ padding: '13px 18px' }}>{v.brand}</td>
                <td style={{ padding: '13px 18px', color: 'var(--muted)' }}>{v.model}</td>
                <td style={{ padding: '13px 18px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600,
                    background: v.status === 'active' ? 'rgba(46,204,113,0.15)' : v.status === 'offline' ? 'rgba(231,76,60,0.15)' : 'rgba(107,107,107,0.15)',
                    color: v.status === 'active' ? '#2ECC71' : v.status === 'offline' ? '#E74C3C' : 'var(--muted)',
                  }}>{v.status?.toUpperCase()}</span>
                </td>
                <td style={{ padding: '13px 18px' }}>
                  {v.driver_name
                    ? <span style={{ color: '#60A5FA', fontSize: '13px' }}>{v.driver_name}</span>
                    : <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>}
                </td>
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setAssigning(v.id); setSelectedDriver(v.driver_id || ''); }} style={{
                      background: 'rgba(96,165,250,0.1)', color: '#60A5FA',
                      border: '1px solid rgba(96,165,250,0.2)', borderRadius: '6px',
                      padding: '5px 12px', fontSize: '11px', cursor: 'pointer',
                    }}>Affecter</button>
                    <button onClick={() => { setForm({ plate: v.plate, brand: v.brand, model: v.model }); setEditing(v.id); }} style={{
                      background: 'rgba(108,99,255,0.1)', color: '#8B85FF',
                      border: '1px solid rgba(108,99,255,0.2)', borderRadius: '6px',
                      padding: '5px 12px', fontSize: '11px', cursor: 'pointer',
                    }}>Modifier</button>
                    <button onClick={async () => { if (confirm('Supprimer ?')) { await api.delete(`/vehicles/${v.id}`); load(); } }} style={{
                      background: 'rgba(231,76,60,0.1)', color: '#E74C3C',
                      border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px',
                      padding: '5px 12px', fontSize: '11px', cursor: 'pointer',
                    }}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}