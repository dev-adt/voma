import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { login, setGuestMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('public-body');
    document.body.classList.remove('light-theme');
  }, []);


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      // Đăng nhập thành công -> Điều hướng tương ứng với vai trò
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode();
    navigate('/');
  };

  return (
    <div className="public-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background Blur Spots */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0) 70%)', borderRadius: '50%', zIndex: 1, filter: 'blur(30px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)', borderRadius: '50%', zIndex: 1, filter: 'blur(30px)', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', zIndex: 10 }}>
        <div className="glass-card" style={{ padding: '2.5rem 2.25rem', borderRadius: '16px', position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '2rem', textAlign: 'center' }}>
            <div className="logo-icon" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 8px 20px var(--primary-glow)' }}>
              <img src="/voma_logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div>
              <div className="logo-name" style={{ fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Voma AI</div>
              <div className="logo-sub" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cổng Đăng Nhập Hợp Nhất</div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
            Đăng nhập tài khoản của bạn để vào Dashboard tương ứng hoặc tiếp tục với quyền khách vãng lai.
          </p>

          {error && (
            <div className="error-box" style={{ display: 'flex', background: 'rgba(239, 68, 68, 0.1)', border: '0.5px solid rgba(239, 68, 68, 0.25)', color: 'var(--rose)', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', marginBottom: '1.25rem', alignItems: 'center', gap: '6px', lineHeight: 1.4 }}>
              <i className="ti ti-circle-x" style={{ fontSize: '14px' }}></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="input-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="username" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tài khoản / Email</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Email đăng ký hoặc username..." 
                  required 
                  autoFocus 
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: '#FFFFFF', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
                <i className="ti ti-user" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }}></i>
              </div>
            </div>

            <div className="input-group" style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <label className="input-label" htmlFor="password" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mật khẩu</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Mật khẩu của bạn..." 
                  required 
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-strong)', background: '#FFFFFF', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
                <i className="ti ti-lock" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)' }}></i>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 8px 16px var(--primary-glow)', outline: 'none' }}>
              {loading ? (
                <>
                  <i className="ti ti-loader animate-spin"></i> Đang xác thực...
                </>
              ) : (
                <>
                  <i className="ti ti-login"></i> Đăng nhập hệ thống
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              onClick={handleContinueAsGuest}
              style={{
                width: '100%',
                padding: '10px',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-strong)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Tiếp tục với tư cách Khách (Guest)
            </button>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Doanh nghiệp chưa đăng ký?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Gửi hồ sơ ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
