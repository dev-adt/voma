import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export const Navbar = () => {
  const { role, user, logout } = useAuth();
  const { currentLang, changeLang, t, getLangDetails, LANGS } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('public-body');
    document.body.classList.remove('light-theme');
  }, []);


  const getInitials = (name) => {
    if (!name) return 'BH';
    return name.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAnchorClick = (e, anchor) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.querySelector(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Nếu không ở trang chủ, để Route chuyển về / rồi cuộn
      navigate('/' + anchor);
    }
  };

  const currentLangDetails = getLangDetails();

  return (
    <nav style={{ zIndex: 1000 }}>
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div className="nav-logo-icon"><img src="/avg_logo.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /></div>
        AVG
      </Link>

      <div className="nav-links">
        <div className="nav-link nav-dropdown">
          {t('menu_members')} <i className="ti ti-chevron-down" style={{ fontSize: '10px' }}></i>
          <div className="nav-dropdown-menu">
            <Link to="/members" className="nav-dropdown-item">Danh mục đầy đủ <span className="nav-dropdown-sub">&gt;</span></Link>
            <a href="#tiers" onClick={(e) => handleAnchorClick(e, '#tiers')} className="nav-dropdown-item">Quyền lợi gói dịch vụ <span className="nav-dropdown-sub">&gt;</span></a>
          </div>
        </div>

        <div className="nav-link nav-dropdown">
          Thị trường <i className="ti ti-chevron-down" style={{ fontSize: '10px' }}></i>
          <div className="nav-dropdown-menu">
            <a href="#posts" onClick={(e) => handleAnchorClick(e, '#posts')} className="nav-dropdown-item">Cơ hội giao thương <span className="nav-dropdown-sub">&gt;</span></a>
            <Link to="/posts" className="nav-dropdown-item">Bảng tin toàn quốc <span className="nav-dropdown-sub">&gt;</span></Link>
          </div>
        </div>

        <Link to="/events" className="nav-link">Sự kiện</Link>

        <Link to="/ai-chat" className="nav-link">Khám phá trợ lý AI</Link>
      </div>

      <div className="nav-right">
        {/* Nút Tìm kiếm */}
        <Link to="/search" style={{ fontSize: '18px', color: 'var(--text-dark-secondary)', marginRight: '8px', padding: '4px' }}>
          <i className="ti ti-search"></i>
        </Link>

        {/* Nút Ngôn ngữ */}
        <div style={{ position: 'relative', marginRight: '8px' }}>
          <button 
            onClick={() => setLangOpen(!langOpen)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '99px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{currentLangDetails.flag}</span>
            <span>{currentLangDetails.label}</span>
          </button>
          {langOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 0',
                minWidth: '100px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 2000
              }}
            >
              {Object.keys(LANGS).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    changeLang(langKey);
                    setLangOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    color: currentLang === langKey ? '#fff' : 'var(--text-secondary)',
                    textAlign: 'left',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: currentLang === langKey ? 'rgba(255,255,255,0.05)' : 'transparent'
                  }}
                >
                  <span>{LANGS[langKey].flag}</span>
                  <span>{LANGS[langKey].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chuông báo */}
        <div style={{ position: 'relative', marginRight: '12px' }}>
          <Link to={role === 'guest' ? "/login" : (role === 'admin' ? "/admin-dashboard" : "/member-dashboard")} style={{ fontSize: '18px', color: 'var(--text-dark-secondary)', padding: '4px', display: 'block' }}>
            <i className="ti ti-bell"></i>
            {role !== 'guest' && (
              <span style={{ position: 'absolute', top: '1px', right: '1px', width: '6px', height: '6px', backgroundColor: 'var(--rose)', borderRadius: '50%' }}></span>
            )}
          </Link>
        </div>

        {/* Avatar hiển thị tùy trạng thái */}
        {role === 'guest' ? (
          <Link to="/login" className="av-sm" style={{ cursor: 'pointer', textDecoration: 'none' }} id="nav-av">BH</Link>
        ) : role === 'admin' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/admin-dashboard" className="av-sm" style={{ cursor: 'pointer', textDecoration: 'none' }}>
              {getInitials(user?.name || 'Admin')}
            </Link>
            <button 
              onClick={() => {
                if (confirm('Bạn có muốn đăng xuất tài khoản Admin?')) logout();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--rose)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px'
              }}
              title="Đăng xuất Admin"
            >
              <i className="ti ti-logout" style={{ fontSize: '16px' }}></i>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/member-dashboard" className="av-sm" style={{ cursor: 'pointer', textDecoration: 'none' }} title={`${user?.name || ''} — Xem Dashboard`}>
              {getInitials(user?.name)}
            </Link>
            <button 
              onClick={() => {
                if (confirm('Bạn có muốn đăng xuất tài khoản Hội viên?')) logout();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--rose)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px'
              }}
              title="Đăng xuất"
            >
              <i className="ti ti-logout" style={{ fontSize: '16px' }}></i>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
