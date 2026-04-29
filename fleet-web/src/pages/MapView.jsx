import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const located = vehicles.filter((v) => v.latitude != null && v.longitude != null);

  const load = async () => {
    try {
      setError('');
      const r = await api.get('/positions/all-last');
      setVehicles(r.data);
    } catch (err) {
      console.error('Error loading positions', err);
      setVehicles([]);
      const msg = err?.response?.data?.message || 'Erreur de chargement des positions';
      const detail = err?.response?.data?.error || err?.response?.data?.hint || '';
      setError(detail ? `${msg}\n${detail}` : msg);
    }
  };

  useEffect(() => {
    const t0 = setTimeout(() => {
      load();
    }, 0);
    const t = setInterval(load, 5000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  return (
    <div>
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '4px' }}>Carte GPS</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            {located.length} véhicule{located.length > 1 ? 's' : ''} localisé{located.length > 1 ? 's' : ''} ·
            Actualisation auto chaque 5s
          </p>
        </div>
        <button
          onClick={load}
          style={{
            background: 'rgba(108,99,255,0.12)',
            color: 'var(--primary)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '12px',
            letterSpacing: '0.05em',
          }}
        >
          ↻ ACTUALISER
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(231,76,60,0.08)',
            border: '1px solid rgba(231,76,60,0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#E74C3C',
            fontSize: '13px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>
        {/* Liste véhicules */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              fontSize: '10px',
              color: 'var(--muted)',
              letterSpacing: '0.12em',
            }}
          >
            VÉHICULES
          </div>

          {vehicles.length === 0 && (
            <div style={{ padding: '20px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
              Aucun véhicule à afficher
            </div>
          )}

          {vehicles.map((v) => (
            <div
              key={v.vehicle_id ?? v.id}
              onClick={() => setSelected(v)}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                background: (selected?.vehicle_id ?? selected?.id) === (v.vehicle_id ?? v.id) ? 'rgba(108,99,255,0.10)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                const selectedKey = selected?.vehicle_id ?? selected?.id;
                const currentKey = v.vehicle_id ?? v.id;
                if (selectedKey !== currentKey) e.currentTarget.style.background = '#161616';
              }}
              onMouseLeave={(e) => {
                const selectedKey = selected?.vehicle_id ?? selected?.id;
                const currentKey = v.vehicle_id ?? v.id;
                if (selectedKey !== currentKey) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>{v.plate}</span>
                <span
                  style={{
                    fontSize: '9px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.05em',
                    background: v.status === 'active' ? 'rgba(46,204,113,0.12)' : 'rgba(107,107,107,0.12)',
                    color: v.status === 'active' ? 'var(--green)' : 'var(--muted)',
                  }}
                >
                  {(v.status || 'offline').toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {v.brand} {v.model || ''}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                {v.recorded_at ? new Date(v.recorded_at).toLocaleTimeString('fr-FR') : 'Jamais localisé'}
              </div>
            </div>
          ))}
        </div>

        {/* Carte */}
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', height: '520px' }}>
          <MapContainer center={[31.6295, -7.9811]} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

            {located.map((v) => (
              <Marker key={v.vehicle_id ?? v.id} position={[parseFloat(v.latitude), parseFloat(v.longitude)]}>
                <Popup>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: '160px' }}>
                    <strong style={{ color: '#6C63FF' }}>{v.plate}</strong>
                    <br />
                    <span style={{ fontSize: '12px' }}>
                      {v.brand} {v.model || ''}
                    </span>
                    <br />
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      {v.recorded_at ? new Date(v.recorded_at).toLocaleString('fr-FR') : '—'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
