import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export const Navbar = () => {
  const { role, user, logout } = useAuth();
  const { currentLang, changeLang, t, getLangDetails, LANGS } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <>
      <nav style={{ zIndex: 1000 }}>
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div className="nav-logo-icon"><img src="/voma_logo.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /></div>
        Voma
      </Link>

      <div className="nav-links">
        <div className="nav-link nav-dropdown">
          {t('menu_members')} <i className="ti ti-chevron-down" style={{ fontSize: '10px' }}></i>
          <div className="nav-dropdown-menu">
            <Link to="/members" className="nav-dropdown-item">{t('menu_directory')} <span className="nav-dropdown-sub">&gt;</span></Link>
            <a href="#tiers" onClick={(e) => handleAnchorClick(e, '#tiers')} className="nav-dropdown-item">{t('menu_tiers')} <span className="nav-dropdown-sub">&gt;</span></a>
          </div>
        </div>

        <div className="nav-link nav-dropdown">
          {t('menu_marketplace')} <i className="ti ti-chevron-down" style={{ fontSize: '10px' }}></i>
          <div className="nav-dropdown-menu">
            <a href="#posts" onClick={(e) => handleAnchorClick(e, '#posts')} className="nav-dropdown-item">{t('menu_opportunities')} <span className="nav-dropdown-sub">&gt;</span></a>
            <Link to="/posts" className="nav-dropdown-item">{t('menu_national_feeds')} <span className="nav-dropdown-sub">&gt;</span></Link>
          </div>
        </div>

        <Link to="/events" className="nav-link">{t('menu_events')}</Link>
        <Link to="/ai-chat" className="nav-link">{t('menu_ai')}</Link>
        <Link to="/guide" className="nav-link">{t('menu_guide')}</Link>
      </div>

      <div className="nav-right">
        {/* Nút Tìm kiếm */}
        <Link to="/search" style={{ fontSize: '18px', color: 'var(--text-primary)', marginRight: '8px', padding: '4px' }}>
          <i className="ti ti-search"></i>
        </Link>

        {/* Nút Ngôn ngữ */}
        <div style={{ position: 'relative', marginRight: '8px' }}>
          <button 
            onClick={() => setLangOpen(!langOpen)}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '99px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.08)'
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
                backgroundColor: '#FFFFFF',
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
                    background: currentLang === langKey ? 'var(--surface-0)' : 'transparent',
                    border: 'none',
                    color: currentLang === langKey ? 'var(--primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: currentLang === langKey ? '700' : '500'
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
          <Link to={role === 'guest' ? "/login" : (role === 'admin' ? "/admin-dashboard" : "/member-dashboard")} style={{ fontSize: '18px', color: 'var(--text-primary)', padding: '4px', display: 'block' }}>
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
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px'
          }}
        >
          <i className={mobileMenuOpen ? "ti ti-x" : "ti ti-menu-2"}></i>
        </button>
      </div>
    </nav>

    {/* Mobile Links Dropdown */}
    {mobileMenuOpen && (
      <div className="mobile-nav-menu" style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(8, 14, 30, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 999,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        boxSizing: 'border-box'
      }}>
        {/* Members dropdown items list inline */}
        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
          {t('menu_members')}
        </div>
        <Link to="/members" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', paddingLeft: '12px', fontSize: '13px' }}>
          {t('menu_directory')}
        </Link>
        <a href="#tiers" onClick={(e) => { handleAnchorClick(e, '#tiers'); setMobileMenuOpen(false); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', paddingLeft: '12px', fontSize: '13px' }}>
          {t('menu_tiers')}
        </a>

        {/* Marketplace inline list */}
        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginTop: '8px' }}>
          {t('menu_marketplace')}
        </div>
        <a href="#posts" onClick={(e) => { handleAnchorClick(e, '#posts'); setMobileMenuOpen(false); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', paddingLeft: '12px', fontSize: '13px' }}>
          {t('menu_opportunities')}
        </a>
        <Link to="/posts" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', paddingLeft: '12px', fontSize: '13px' }}>
          {t('menu_national_feeds')}
        </Link>

        {/* Simple Link items */}
        <Link to="/events" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', textDecoration: 'none', marginTop: '8px' }}>
          {t('menu_events')}
        </Link>
        <Link to="/ai-chat" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', textDecoration: 'none' }}>
          {t('menu_ai')}
        </Link>
        <Link to="/guide" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', textDecoration: 'none' }}>
          {t('menu_guide')}
        </Link>
      </div>
    )}
  </>
);
};
export default Navbar;
