import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch { setError('Email ou mot de passe incorrect'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', background: '#0A0B1E', overflow: 'hidden',
    }}>
      {/* LEFT PANEL */}
      <div style={{
        flex: 1, position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0B1E 0%, #0d1033 100%)',
      }}>
        {/* Glow circles */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          top: '5%', left: '5%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
          bottom: '5%', right: '10%', pointerEvents: 'none',
        }} />

        {/* Center content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <img
            src="/fleet.png"
            alt="Fleet Manager"
            style={{
              width: '350px', height: '350px', objectFit: 'contain',
              margin: '0 auto 20px', display: 'block',
              mixBlendMode: 'screen',
              filter: 'invert(1)',
            }}
          />
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Fleet Manager</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '48px' }}>
            Plateforme de suivi et gestion de flotte
          </p>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
            {[
              { val: '99.9%', label: 'Disponibilité' },
              { val: 'GPS', label: 'Temps réel' },
              { val: '24/7', label: 'Monitoring' },
            ].map(({ val, label }) => (
              <div key={val} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#6C63FF', marginBottom: '4px' }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: '420px', background: '#0B0C1F',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Connexion</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '36px' }}>
            Accédez à votre espace d'administration
          </p>

          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)',
              borderRadius: '10px', padding: '12px 16px', color: '#E74C3C',
              fontSize: '13px', marginBottom: '20px',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '8px',
              }}>ADRESSE EMAIL</label>
              <input
                type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  color: '#fff', fontSize: '14px', outline: 'none',
                  transition: 'all 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.background = 'rgba(108,99,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '8px',
              }}>MOT DE PASSE</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} required
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                    color: '#fff', fontSize: '14px', outline: 'none',
                    transition: 'all 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.6)'; e.target.style.background = 'rgba(108,99,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', fontSize: '16px', padding: 0,
                }}>{showPass ? '🙈' : '👁'}</button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(108,99,255,0.5)' : 'linear-gradient(135deg, #6C63FF, #8B85FF)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(108,99,255,0.4)',
              transition: 'all 0.2s', letterSpacing: '0.02em',
            }}
              onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 6px 24px rgba(108,99,255,0.6)'; }}
              onMouseLeave={e => { if (!loading) e.target.style.boxShadow = '0 4px 16px rgba(108,99,255,0.4)'; }}
            >{loading ? 'Connexion...' : 'Se connecter'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
