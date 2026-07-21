import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Members = () => {
  const { token } = useAuth();
  const { currentLang, t } = useTranslation();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(12);
  const [error, setError] = useState('');

  // Trạng thái dịch mô tả hội viên (map từ memberId sang text)
  const [translatedDescs, setTranslatedDescs] = useState({});
  const [loadingTranslations, setLoadingTranslations] = useState({});
  const [memberTargetLangs, setMemberTargetLangs] = useState({});

  const handleMemberTargetLangChange = (memberId, lang) => {
    setMemberTargetLangs(prev => ({ ...prev, [memberId]: lang }));
    setTranslatedDescs(prev => {
      const copy = { ...prev };
      delete copy[memberId];
      return copy;
    });
  };

  const handleTranslateMember = async (memberId, originalDesc) => {
    if (translatedDescs[memberId]) {
      setTranslatedDescs(prev => {
        const copy = { ...prev };
        delete copy[memberId];
        return copy;
      });
      return;
    }

    const targetLang = memberTargetLangs[memberId] || (currentLang === 'vi' ? 'en' : currentLang);
    setLoadingTranslations(prev => ({ ...prev, [memberId]: true }));
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalDesc, targetLang })
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedDescs(prev => ({ ...prev, [memberId]: data.translatedText }));
      } else {
        alert('Lỗi dịch thuật: ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Không thể thực hiện dịch: ' + err.message);
    } finally {
      setLoadingTranslations(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const getInitialsColors = (name) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: '#E6F1FB', fg: '#0C447C' },
      { bg: '#EAF3DE', fg: '#27500A' },
      { bg: '#FAEEDA', fg: '#633806' },
      { bg: '#EEEDFE', fg: '#3C3489' },
      { bg: '#E1F5EE', fg: '#085041' },
      { bg: '#FAECE7', fg: '#712B13' }
    ];
    return colors[sum % colors.length];
  };

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/members?status=approved', { headers });
        if (!res.ok) throw new Error('Không thể tải danh sách hội viên');
        const data = await res.json();
        
        const mappedMembers = (data.data || []).map(m => {
          const colors = getInitialsColors(m.name);
          return {
            id: m.id,
            name: m.name,
            initials: m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            bg: colors.bg,
            fg: colors.fg,
            tier: m.tier,
            industry: m.industry || 'Chưa phân loại',
            email: m.email || 'Chưa cập nhật',
            desc: m.description || 'Chưa có mô tả chi tiết hoạt động kinh doanh.',
            date: new Date(m.created_at).toLocaleDateString('vi-VN'),
            is_featured: m.is_featured,
            city: m.city || 'Việt Nam',
            phone: m.phone || 'Chưa cập nhật',
            contact_name: m.contact_name || 'Đại diện hội viên'
          };
        });

        setMembers(mappedMembers);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [token]);

  // Extract unique industries for select dropdown
  const uniqueIndustries = Array.from(new Set(members.map(m => m.industry).filter(Boolean)));

  // Featured members (pinned top, max 3)
  const featuredMembers = members.filter(m => m.is_featured === 1).slice(0, 3);

  // Filtered and sorted main members list
  const filteredAndSortedMembers = members
    .filter(m => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSearch = 
          m.name.toLowerCase().includes(q) || 
          m.industry.toLowerCase().includes(q) || 
          m.city.toLowerCase().includes(q) || 
          m.email.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }
      if (selectedTier && m.tier !== selectedTier) return false;
      if (selectedIndustry && m.industry !== selectedIndustry) return false;
      return true;
    })
    .sort((a, b) => {
      const tierWeight = { 'Platinum': 3, 'Gold': 2, 'Silver': 1 };
      const weightA = tierWeight[a.tier] || 0;
      const weightB = tierWeight[b.tier] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return b.id - a.id;
    });

  // Pagination bounds
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredAndSortedMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredAndSortedMembers.length / membersPerPage);

  return (
    <div className="public-body">
      <Navbar />

      {/* Decorative background gradient blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, rgba(79,70,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '80vh', paddingBottom: '5rem', paddingTop: '2.5rem' }}>
        
        {/* Title and Header */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="ti ti-users" style={{ color: 'var(--primary)' }}></i> {t('members_title')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>{t('members_subtitle')}</p>
        </div>

        {/* Filters bar */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                placeholder={t('search_members_placeholder')} 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px 8px 30px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12.5px', outline: 'none', backgroundColor: '#FFFFFF', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Filter by Tier */}
            <select
              value={selectedTier}
              onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12.5px', outline: 'none', backgroundColor: '#FFFFFF', color: 'var(--text-primary)', cursor: 'pointer', minWidth: '130px' }}
            >
              <option value="">{t('all_tiers')}</option>
              <option value="Platinum">💎 Platinum</option>
              <option value="Gold">🏅 Gold</option>
              <option value="Silver">🪙 Silver</option>
            </select>

            {/* Filter by Industry */}
            <select
              value={selectedIndustry}
              onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12.5px', outline: 'none', backgroundColor: '#FFFFFF', color: 'var(--text-primary)', cursor: 'pointer', minWidth: '150px' }}
            >
              <option value="">{t('all_industries')}</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>{t('label_show')}:</span>
              <select
                value={membersPerPage}
                onChange={(e) => {
                  setMembersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-strong)',
                  background: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="6">{t('members_per_page')(6)}</option>
                <option value="12">{t('members_per_page')(12)}</option>
                <option value="24">{t('members_per_page')(24)}</option>
              </select>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('found_members')(filteredAndSortedMembers.length)}
            </div>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '12.5px', padding: '8px 16px' }}>
              <i className="ti ti-user-plus"></i> {t('btn_upgrade_now')}
            </Link>
          </div>
        </div>

        {/* 1. TOP PINNED FEATURED MEMBERS */}
        {!loading && !error && featuredMembers.length > 0 && currentPage === 1 && (
          <div style={{ marginBottom: '3rem', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', textAlign: 'left' }}>
              <i className="ti ti-crown" style={{ color: 'var(--amber)', fontSize: '20px' }}></i>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: 700, color: 'var(--amber)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('featured_members_header')}
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {featuredMembers.map((m) => {
                const initials = m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const colors = getInitialsColors(m.name);
                const tierBadge = m.tier === 'Platinum' ? '💎 ' + t('tier_platinum_members') : m.tier === 'Gold' ? '🏅 ' + t('tier_gold_members') : '🪙 ' + t('tier_silver_members');
                const tierClass = m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver';
                
                return (
                  <div className="card" key={`feat-${m.id}`} style={{ border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 4px 20px rgba(245,158,11,0.08)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--surface-2)' }}>
                    <div style={{ height: '60px', background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255,255,255,0) 100%)`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>
                    <div style={{ padding: '1.25rem', marginTop: '-35px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="av-circle" style={{ background: colors.bg, color: colors.fg, width: '54px', height: '54px', fontSize: '16px', border: '3px solid var(--surface-2)', marginBottom: '12px', fontWeight: 750 }}>{initials}</div>
                      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px', lineHeight: 1.3, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {m.name}
                        <i className="ti ti-star-filled" style={{ color: 'var(--amber)', fontSize: '14px' }}></i>
                      </h3>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-briefcase" style={{ color: 'var(--amber)' }}></i> {m.industry}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.6, 
                          marginBottom: '8px', 
                          textAlign: 'left', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden' 
                        }}>
                          {translatedDescs[`feat-${m.id}`] ? translatedDescs[`feat-${m.id}`] : m.desc}
                        </p>
                        {m.desc && m.desc.trim() !== '' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <select
                              value={memberTargetLangs[`feat-${m.id}`] || (currentLang === 'vi' ? 'en' : currentLang)}
                              onChange={(e) => handleMemberTargetLangChange(`feat-${m.id}`, e.target.value)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '10px',
                                padding: '2px 4px',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="en">🇬🇧 EN</option>
                              <option value="vi">🇻🇳 VI</option>
                              <option value="ja">🇯🇵 JA</option>
                              <option value="zh">🇨🇳 ZH</option>
                            </select>
                            <button
                              onClick={() => handleTranslateMember(`feat-${m.id}`, m.desc)}
                              disabled={loadingTranslations[`feat-${m.id}`]}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: translatedDescs[`feat-${m.id}`] ? 'var(--emerald)' : 'var(--neon-cyan)',
                                fontSize: '10.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontWeight: 600,
                                padding: 0,
                                outline: 'none'
                              }}
                            >
                              <i className={loadingTranslations[`feat-${m.id}`] ? "ti ti-loader animate-spin" : "ti ti-language"}></i>
                              {loadingTranslations[`feat-${m.id}`] ? '...' : translatedDescs[`feat-${m.id}`] ? t('translate_view_original_short') : 'Dịch AI'}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Contact Info Block */}
                      {m.email !== '***@***.***' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-user" style={{ color: 'var(--amber)' }}></i> {m.contact_name}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-mail" style={{ color: 'var(--amber)' }}></i> {m.email}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-phone" style={{ color: 'var(--amber)' }}></i> {m.phone}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '11.5px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-lock"></i> {t('contact_login_required')}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${tierClass}`}>{tierBadge}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="ti ti-map-pin"></i> {m.city || t('location_default')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. MAIN MEMBERS DIRECTORY LIST */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i> {t('loading_members')}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> Lỗi tải dữ liệu hội viên: {error}
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem' }} className="glass-card">
            <i className="ti ti-search" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}></i>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('no_members_found')}</span>
          </div>
        ) : (
          <div>
            <div id="members-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {currentMembers.map((m) => {
                const tierBadge = m.tier === 'Platinum' ? '💎 ' + t('tier_platinum_members') : m.tier === 'Gold' ? '🏅 ' + t('tier_gold_members') : '🪙 ' + t('tier_silver_members');
                const tierClass = m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver';
                
                return (
                  <div className="card" key={m.id} style={{ boxShadow: 'var(--shadow)', transition: 'var(--transition)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '60px', background: `linear-gradient(135deg, ${m.bg} 0%, rgba(255,255,255,0) 100%)`, borderBottom: '1px solid var(--border)' }}></div>
                    <div style={{ padding: '1.25rem', marginTop: '-35px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="av-circle" style={{ background: m.bg, color: m.fg, width: '54px', height: '54px', fontSize: '16px', border: '3px solid #ffffff', marginBottom: '12px', fontWeight: 600 }}>{m.initials}</div>
                      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3, textAlign: 'left' }}>{m.name}</h3>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-briefcase"></i> {m.industry}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.6, 
                          marginBottom: '8px', 
                          textAlign: 'left', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden' 
                        }}>
                          {translatedDescs[m.id] ? translatedDescs[m.id] : m.desc}
                        </p>
                        {m.desc && m.desc.trim() !== '' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <select
                              value={memberTargetLangs[m.id] || (currentLang === 'vi' ? 'en' : currentLang)}
                              onChange={(e) => handleMemberTargetLangChange(m.id, e.target.value)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '10px',
                                padding: '2px 4px',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="en">🇬🇧 EN</option>
                              <option value="vi">🇻🇳 VI</option>
                              <option value="ja">🇯🇵 JA</option>
                              <option value="zh">🇨🇳 ZH</option>
                            </select>
                            <button
                              onClick={() => handleTranslateMember(m.id, m.desc)}
                              disabled={loadingTranslations[m.id]}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: translatedDescs[m.id] ? 'var(--emerald)' : 'var(--neon-cyan)',
                                fontSize: '10.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontWeight: 600,
                                padding: 0,
                                outline: 'none'
                              }}
                            >
                              <i className={loadingTranslations[m.id] ? "ti ti-loader animate-spin" : "ti ti-language"}></i>
                              {loadingTranslations[m.id] ? '...' : translatedDescs[m.id] ? t('translate_view_original_short') : 'Dịch AI'}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Contact Info Block */}
                      {m.email !== '***@***.***' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-user" style={{ color: 'var(--amber)' }}></i> {m.contact_name}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-mail" style={{ color: 'var(--amber)' }}></i> {m.email}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-phone" style={{ color: 'var(--amber)' }}></i> {m.phone}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '11.5px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-lock"></i> {t('contact_login_required')}
                          </div>
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${tierClass}`}>{tierBadge}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="ti ti-map-pin"></i> {m.city || t('location_default')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: currentPage === 1 ? 'var(--text-muted)' : '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <i className="ti ti-chevron-left"></i> {t('btn_back_prev')}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className="btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      backgroundColor: currentPage === pg ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      borderColor: currentPage === pg ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontWeight: currentPage === pg ? '700' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {pg}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {t('btn_go_next')} <i className="ti ti-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default Members;
