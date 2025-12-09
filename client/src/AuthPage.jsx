// src/AuthPage.jsx
import { useState } from 'react';

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = isLogin
        ? 'http://localhost:5002/api/auth/login'
        : 'http://localhost:5002/api/auth/register';

      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Authentication failed');
      }

      onAuthSuccess(data);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background:
          'radial-gradient(circle at top, #22c55e22 0, transparent 45%), radial-gradient(circle at bottom, #6366f122 0, transparent 55%)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 32,
            background:
              'linear-gradient(135deg,rgba(56,189,248,0.65),rgba(129,140,248,0.65))',
            opacity: 0.8,
            filter: 'blur(18px)',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'linear-gradient(145deg,rgba(15,23,42,0.92),rgba(15,23,42,0.86))',
            borderRadius: 24,
            padding: 24,
            boxShadow:
              '0 26px 70px rgba(15,23,42,0.65)',
            border: '1px solid rgba(148,163,184,0.4)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ marginBottom: 18, textAlign: 'center' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                margin: '0 auto 10px',
                background:
                  'conic-gradient(from 160deg,#22c55e,#38bdf8,#6366f1,#a855f7,#22c55e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px rgba(15,23,42,0.9)',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#020617',
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: 0.18,
                textTransform: 'uppercase',
                color: '#9ca3af',
              }}
            >
              {isLogin ? 'Welcome back' : 'Join the store'}
            </p>
            <h2
              style={{
                margin: '4px 0 0',
                fontSize: 22,
                fontWeight: 600,
                color: '#e5e7eb',
              }}
            >
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              marginBottom: 18,
              padding: 3,
              borderRadius: 999,
              backgroundColor: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(55,65,81,0.9)',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 999,
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 500,
                color: isLogin ? '#0f172a' : '#9ca3af',
                background: isLogin
                  ? 'linear-gradient(135deg,#f9fafb,#e5e7eb)'
                  : 'transparent',
                boxShadow: isLogin
                  ? '0 12px 24px rgba(15,23,42,0.35)'
                  : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 999,
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 500,
                color: !isLogin ? '#0f172a' : '#9ca3af',
                background: !isLogin
                  ? 'linear-gradient(135deg,#f9fafb,#e5e7eb)'
                  : 'transparent',
                boxShadow: !isLogin
                  ? '0 12px 24px rgba(15,23,42,0.35)'
                  : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Register
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    marginBottom: 4,
                    color: '#9ca3af',
                  }}
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(75,85,99,0.9)',
                    fontSize: 13,
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    color: '#e5e7eb',
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 11,
                  marginBottom: 4,
                  color: '#9ca3af',
                }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(75,85,99,0.9)',
                  fontSize: 13,
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 11,
                  marginBottom: 4,
                  color: '#9ca3af',
                }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(75,85,99,0.9)',
                  fontSize: 13,
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  color: '#e5e7eb',
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 12,
                  color: '#fecaca',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 10,
                width: '100%',
                background:
                  'linear-gradient(135deg,#22c55e,#38bdf8,#6366f1)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 999,
                cursor: submitting ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 18px 40px rgba(37,99,235,0.65)',
                opacity: submitting ? 0.85 : 1,
              }}
            >
              {submitting
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
