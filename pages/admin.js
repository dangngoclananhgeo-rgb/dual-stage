import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      localStorage.setItem('ds_token', data.token);
      localStorage.setItem('ds_role', data.role);
      onLogin(data.role, data.token);
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="lock-icon">⬡</div>
          <h2>Quản trị</h2>
          <p>Nhập mật khẩu để tiếp tục</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? '...' : 'Đăng nhập'}
          </button>
        </form>
        <Link href="/" className="back-link">← Về trang chính</Link>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          max-width: 380px;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 3rem 2.5rem;
          background: rgba(255,255,255,0.02);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .lock-icon {
          font-size: 2rem;
          color: rgba(255,255,255,0.2);
          display: block;
          margin-bottom: 1rem;
        }
        h2 {
          font-family: 'Unbounded', sans-serif;
          font-weight: 300;
          font-size: 1.2rem;
          letter-spacing: 0.2em;
          margin-bottom: 0.4rem;
        }
        p {
          color: rgba(255,255,255,0.35);
          font-size: 0.85rem;
          font-family: 'DM Mono', monospace;
        }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f0f0f0;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          outline: none;
          font-family: 'DM Mono', monospace;
          transition: border-color 0.2s;
        }
        .field input:focus { border-color: rgba(255,255,255,0.3); }
        .error-msg {
          color: #e87547;
          font-size: 0.8rem;
          font-family: 'DM Mono', monospace;
          margin-top: 0.75rem;
          border-left: 2px solid #e87547;
          padding-left: 0.75rem;
        }
        .submit-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 0.9rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          color: #f0f0f0;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .back-link {
          display: block;
          text-align: center;
          margin-top: 1.5rem;
          color: rgba(255,255,255,0.25);
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          text-decoration: none;
          letter-spacing: 0.08em;
        }
        .back-link:hover { color: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
}

function Dashboard({ role, token, onLogout }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const accentColor = role === 'A' ? '#e8c547' : '#47c5e8';
  const wordCount = countWords(caption);

  useEffect(() => {
    async function fetchContent() {
      const r = await fetch('/api/content');
      if (r.ok) {
        const data = await r.json();
        setVideoUrl(data[`videoUrl${role}`] || '');
        setCaption(data[`caption${role}`] || '');
      }
      setInitialLoading(false);
    }
    fetchContent();
  }, [role]);

  async function handleSave() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const r = await fetch(`/api/content/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ videoUrl, caption }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      setMessage('Đã cập nhật thành công ✓');
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <div className="loading-screen"><span>Đang tải...</span></div>;
  }

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <div className="dash-zone" style={{ '--accent': accentColor }}>Zone {role}</div>
          <h2>Chỉnh sửa nội dung</h2>
        </div>
        <div className="header-actions">
          <Link href="/" className="view-btn">Xem website ↗</Link>
          <button className="logout-btn" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div>

      <div className="form-section">
        <label className="field-label">Link video YouTube / TikTok</label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          className="text-input"
        />
        <p className="field-hint">
          Hỗ trợ: YouTube (watch, shorts, youtu.be), TikTok
        </p>
      </div>

      <div className="form-section">
        <div className="caption-label-row">
          <label className="field-label">Caption</label>
          <span className={`word-count ${wordCount > 300 ? 'over' : ''}`} style={{ '--accent': accentColor }}>
            {wordCount} / 300 từ
          </span>
        </div>
        <textarea
          placeholder="Nhập nội dung caption ở đây..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="textarea-input"
          rows={8}
        />
      </div>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={loading || wordCount > 300}
        style={{ '--accent': accentColor }}
      >
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>

      <style jsx>{`
        .dashboard {
          max-width: 680px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          color: rgba(255,255,255,0.3);
          font-size: 0.85rem;
        }
        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 3rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .dash-zone {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        h2 {
          font-family: 'Unbounded', sans-serif;
          font-weight: 300;
          font-size: 1.3rem;
          letter-spacing: 0.1em;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .view-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          letter-spacing: 0.05em;
        }
        .view-btn:hover { color: rgba(255,255,255,0.7); }
        .logout-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.45);
          padding: 0.4rem 0.9rem;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          transition: all 0.2s;
        }
        .logout-btn:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); }

        .form-section { margin-bottom: 2rem; }
        .field-label {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.6rem;
        }
        .field-hint {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.2);
          margin-top: 0.4rem;
          letter-spacing: 0.03em;
        }
        .text-input, .textarea-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f0f0f0;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
          font-family: 'DM Mono', monospace;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }
        .text-input:focus, .textarea-input:focus { border-color: rgba(255,255,255,0.25); }

        .caption-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }
        .caption-label-row .field-label { margin-bottom: 0; }
        .word-count {
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          color: var(--accent);
          opacity: 0.7;
        }
        .word-count.over { color: #e87547; opacity: 1; }

        .success-msg {
          background: rgba(71, 197, 120, 0.08);
          border: 1px solid rgba(71, 197, 120, 0.25);
          color: #47c578;
          padding: 0.75rem 1rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          margin-bottom: 1.25rem;
          letter-spacing: 0.03em;
        }
        .error-msg {
          background: rgba(232, 117, 71, 0.08);
          border: 1px solid rgba(232, 117, 71, 0.25);
          color: #e87547;
          padding: 0.75rem 1rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          margin-bottom: 1.25rem;
          letter-spacing: 0.03em;
        }
        .save-btn {
          padding: 0.9rem 2rem;
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .save-btn:hover:not(:disabled) { background: rgba(255,255,255,0.04); }
        .save-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default function Admin() {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('ds_token');
    const savedRole = localStorage.getItem('ds_role');
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
    setChecked(true);
  }, []);

  function handleLogin(r, t) {
    setRole(r);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('ds_token');
    localStorage.removeItem('ds_role');
    setRole(null);
    setToken(null);
  }

  if (!checked) return null;

  return (
    <>
      <Head>
        <title>Admin — Dual Stage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Lora:ital,wght@0,400;0,500;1,400&family=Unbounded:wght@300;400&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0a0a0a;
          color: #f0f0f0;
          font-family: 'Lora', serif;
          min-height: 100vh;
        }
        input, textarea, button { font-family: inherit; }
      `}</style>

      {role && token ? (
        <Dashboard role={role} token={token} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </>
  );
}
