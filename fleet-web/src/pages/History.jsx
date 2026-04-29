import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function calcDistance(positions) {
  let total = 0;
  for (let i = 1; i < positions.length; i++) {
    const R = 6371;
    const dLat = (positions[i].latitude - positions[i-1].latitude) * Math.PI / 180;
    const dLon = (positions[i].longitude - positions[i-1].longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
      Math.cos(positions[i-1].latitude * Math.PI/180) *
      Math.cos(positions[i].latitude * Math.PI/180) *
      Math.sin(dLon/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return total.toFixed(2);
}

export default function History() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState([]);

  useEffect(() => {
    api.get('/vehicles').then(r => setVehicles(r.data));
    api.get('/vehicles/offline').then(r => setOffline(r.data));
  }, []);

  const loadHistory = async (vehicleId) => {
    if (!vehicleId) return;
    setLoading(true);
    const res = await api.get(`/positions/history/${vehicleId}`);
    setPositions(res.data.reverse());
    setLoading(false);
  };

  const polyline = positions.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
  const distance = calcDistance(positions);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '4px' }}>Historique & Hors ligne</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Trajectoires et véhicules inactifs</p>
      </div>

      {/* Véhicules hors ligne */}
      {offline.length > 0 && (
        <div style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--red)', letterSpacing: '0.12em', marginBottom: '14px' }}>
            ⚠ VÉHICULES HORS LIGNE ({offline.length})
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {offline.map(v => (
              <div key={v.id} style={{
                background: '#161616', border: '1px solid rgba(231,76,60,0.2)',
                borderRadius: '10px', padding: '12px 16px', minWidth: '160px',
              }}>
                <div style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>{v.plate}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{v.brand} {v.model}</div>
                <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
                  {v.last_position
                    ? `Dernière pos. : ${new Date(v.last_position).toLocaleString('fr-FR')}`
                    : 'Jamais localisé'}
                </div>
                {v.driver_name && (
                  <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Chauffeur : {v.driver_name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique positions */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '16px' }}>HISTORIQUE DE TRAJECTOIRE</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select value={selected}
            onChange={e => { setSelected(e.target.value); loadHistory(e.target.value); }}
            style={{
              background: '#161616', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '10px 14px', color: 'var(--text)', fontSize: '13px', outline: 'none', minWidth: '220px',
            }}>
            <option value="">— Sélectionner un véhicule —</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.plate} — {v.brand}</option>
            ))}
          </select>
          {positions.length > 0 && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Points : <span style={{ color: 'var(--gold)' }}>{positions.length}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Distance approx. : <span style={{ color: 'var(--gold)' }}>{distance} km</span>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
            Chargement...
          </div>
        )}

        {!loading && positions.length > 0 && (
          <div style={{ borderRadius: '12px', overflow: 'hidden', height: '420px', border: '1px solid var(--border)' }}>
            <MapContainer center={polyline[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Polyline positions={polyline} color="#D4AF37" weight={3} opacity={0.8} />
              <Marker position={polyline[0]}>
                <Popup>
                  <strong style={{ color: '#D4AF37' }}>Départ</strong><br />
                  {new Date(positions[0].recorded_at).toLocaleString('fr-FR')}
                </Popup>
              </Marker>
              <Marker position={polyline[polyline.length - 1]}>
                <Popup>
                  <strong style={{ color: '#D4AF37' }}>Dernière position</strong><br />
                  {new Date(positions[positions.length - 1].recorded_at).toLocaleString('fr-FR')}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {!loading && selected && positions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
            Aucune position enregistrée pour ce véhicule
          </div>
        )}

        {!loading && !selected && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
            Sélectionnez un véhicule pour voir sa trajectoire
          </div>
        )}
      </div>
    </div>
  );
}