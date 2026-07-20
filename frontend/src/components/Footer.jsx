import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer style={{ backgroundColor: '#030813', color: '#64748B', padding: '5rem 0 3rem', fontSize: '12.5px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="public-container" style={{ margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '16px' }}>
                <img src="/favicon.png" alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </div>
              Voma
            </div>
            <p style={{ lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {t('footer_desc')}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}><i className="ti ti-brand-facebook"></i></a>
              <a href="#" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}><i className="ti ti-brand-twitter"></i></a>
              <a href="#" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}><i className="ti ti-brand-youtube"></i></a>
              <a href="#" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}><i className="ti ti-brand-linkedin"></i></a>
              <a href="#" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px' }}><i className="ti ti-brand-instagram"></i></a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: '600', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('footer_services')}</h4>
            <Link to="/members" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_members')}</Link>
            <Link to="/posts" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_marketplace')}</Link>
            <Link to="/ai-chat" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_ai')}</Link>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: '600', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('footer_support')}</h4>
            <Link to="/posts" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_national_feeds')}</Link>
            <Link to="/register" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_register')}</Link>
            <a href="/#tiers" style={{ display: 'block', padding: '6px 0', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>{t('menu_tiers')}</a>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: '600', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('footer_contact')}</h4>
            <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ti ti-mail"></i> info@adtgroup.net</div>
            <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ti ti-phone"></i> 0986354152</div>
            <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ti ti-map-pin"></i> 26 TT23 Khu Đô Thị Văn Phú, Phường Kiến Hưng, Hà Nội, Việt Nam</div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', fontSize: '12px' }}>
          <div>{t('footer_rights')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/members" style={{ color: '#64748B', textDecoration: 'none' }}>{t('menu_members')}</Link>
            <Link to="/posts" style={{ color: '#64748B', textDecoration: 'none' }}>{t('menu_opportunities')}</Link>
            <Link to="/register" style={{ color: '#64748B', textDecoration: 'none' }}>{t('menu_register')}</Link>
            <Link to="/ai-chat" style={{ color: '#64748B', textDecoration: 'none' }}>{t('menu_ai')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
