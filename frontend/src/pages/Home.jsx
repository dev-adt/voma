import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Home = () => {
  const { role, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState({ members: 0, posts: 0, events: 0 });
  const [latestPosts, setLatestPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [featuredMembers, setFeaturedMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const getMemberInitialsColors = (name) => {
    if (!name) return { bg: '#E6F1FB', fg: '#0C447C' };
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
  
  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch Latest Approved Posts
  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/posts?status=approved', { headers });
        if (res.ok) {
          const data = await res.json();
          const allPosts = data.data || [];
          // Sắp xếp: bài nổi bật lên đầu, sau đó đến bài viết mới nhất
          const featured = allPosts.filter(p => p.is_featured === 1);
          const normal = allPosts.filter(p => p.is_featured !== 1);
          setLatestPosts([...featured, ...normal].slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching latest posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchLatestPosts();
  }, [token]);

  // Fetch Upcoming Events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/events?limit=3&upcoming=true', { headers });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [token]);

  // Fetch Featured Members (limit to 3)
  useEffect(() => {
    const fetchFeaturedMembers = async () => {
      try {
        const res = await fetch('/api/members?status=approved');
        if (res.ok) {
          const data = await res.json();
          const all = data.data || [];
          const featured = all.filter(m => m.is_featured === 1);
          setFeaturedMembers(featured.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured members:', err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchFeaturedMembers();
  }, []);

  const openPostDetail = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
    setModalOpen(false);
  };

  const openEventDetail = (event) => {
    if (!token) {
      if (confirm('Vui lòng đăng nhập để xem chi tiết địa điểm và thông tin mô tả sự kiện. Đến trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleToggleEventInterest = async (eventId) => {
    if (!token) {
      alert('Vui lòng đăng nhập để thực hiện tính năng này.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            const diff = data.is_interested ? 1 : -1;
            return {
              ...e,
              is_interested: data.is_interested,
              interest_count: Math.max(0, (e.interest_count || 0) + diff)
            };
          }
          return e;
        }));

        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => {
            const diff = data.is_interested ? 1 : -1;
            return {
              ...prev,
              is_interested: data.is_interested,
              interest_count: Math.max(0, (prev.interest_count || 0) + diff)
            };
          });
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getTiersLink = () => {
    if (role === 'member') return '/member-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/register';
  };
  const getTiersButtonText = () => {
    if (role === 'member') return t('btn_upgrade_now');
    return t('btn_join_now');
  };

  // Demo images for trade opportunity cards
  const demoImages = [
    'https://images.unsplash.com/photo-1542744173-8e08562744ad?w=600&auto=format&fit=crop&q=60', // meeting
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=60', // rice/agriculture
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60'  // landscape/tourism
  ];

  return (
    <div className="public-body">
      <Navbar />

      {/* Decor background blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(30,136,229,0.08) 0%, rgba(30,136,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, rgba(0,229,255,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container">
        
        {/* HERO SECTION */}
        <div className="hero-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', marginTop: '3rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
          <div className="hero-left" style={{ flex: '1.2', minWidth: '320px' }}>
            <div className="hero-badge">
              <i className="ti ti-sparkles"></i> {t('hero_badge')}
            </div>
            <h1 className="hero-title">
              {t('hero_title').split(', ')[0] || ''},<br /><span>{t('hero_title').split(', ')[1] || ''}</span>
            </h1>
            <p className="hero-desc">
              {t('hero_desc')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', textDecoration: 'none' }}>
                <i className="ti ti-arrow-up-right"></i> {t('hero_btn_register')}
              </Link>
              <Link to="/members" className="btn" style={{ padding: '12px 24px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', textDecoration: 'none' }}>
                <i className="ti ti-search"></i> {t('hero_btn_explore')}
              </Link>
            </div>
          </div>
          
          <div className="hero-right float-effect" style={{ flex: '1', minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
            <div className="hero-img-wrap">
              <img src="/images/hero_network.png" alt="Mạng lưới kết nối Voma" />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(8, 14, 30, 0.75)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: 'var(--radius)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald)', animation: 'pulse 2s infinite' }}></div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>{t('hero_realtime')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS CARD GRID */}
        <div className="stats-row" style={{ marginBottom: '5rem' }}>
          <div className="glass-card stat-card">
            <div className="stat-label">{t('stat_active_members')}</div>
            <div className="stat-val">{stats.members || 20}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>{t('stat_verified_companies')}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">{t('stat_shared_opportunities')}</div>
            <div className="stat-val">{stats.posts || 50}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>{t('stat_new_connections')}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">{t('stat_diverse_companies')}</div>
            <div className="stat-val">1.2k+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>{t('stat_industries')}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">{t('stat_trade_events')}</div>
            <div className="stat-val">{stats.events || 5}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>{t('stat_annual_meetings')}</div>
          </div>
        </div>

        {/* MAIN SERVICES SECTION */}
        <section id="features" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{t('services_badge')}</div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>{t('services_title')}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-dark-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>{t('services_desc')}</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="srv-card">
              <div className="srv-icon"><i className="ti ti-users"></i></div>
              <h3 className="srv-title">{t('service_1_title')}</h3>
              <p className="srv-desc">{t('service_1_desc')}</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)' }}><i className="ti ti-list-details"></i></div>
              <h3 className="srv-title">{t('service_2_title')}</h3>
              <p className="srv-desc">{t('service_2_desc')}</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--neon-cyan)' }}><i className="ti ti-robot"></i></div>
              <h3 className="srv-title">{t('service_3_title')}</h3>
              <p className="srv-desc">{t('service_3_desc')}</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)' }}><i className="ti ti-chart-dots"></i></div>
              <h3 className="srv-title">{t('service_4_title')}</h3>
              <p className="srv-desc">{t('service_4_desc')}</p>
            </div>
          </div>
        </section>

        {/* LATEST OPPORTUNITIES SECTION */}
        <section id="posts" style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{t('menu_opportunities')}</div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: 0 }}>{t('featured_projects_title')}</h2>
            </div>
            <Link to="/posts" className="btn" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', textDecoration: 'none' }}>
              {t('btn_view_all_posts')} <i className="ti ti-arrow-right"></i>
            </Link>
          </div>

          <div className="opp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {loadingPosts ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> {t('loading_latest_opps')}
              </div>
            ) : latestPosts.length > 0 ? (
              latestPosts.map((p, idx) => {
                const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '11/06/2026';
                const hasValidImage = p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined' && p.image_url.trim() !== '';
                const imgUrl = hasValidImage ? p.image_url : demoImages[idx % demoImages.length];
                const companyName = p.company_name || 'Voma Member';
                return (
                  <div className="opp-card" key={p.id} style={{ position: 'relative' }}>
                    {p.is_featured === 1 && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', fontWeight: 700, zIndex: 10 }}>
                        {t('badge_featured')} <i className="ti ti-star-filled"></i>
                      </span>
                    )}
                    <img src={imgUrl} className="opp-img" alt={p.title} />
                    <div className="opp-content">
                      <h3 className="opp-title">{p.title}</h3>
                      <div className="opp-meta">
                        <div className="av-circle" style={{ width: '20px', height: '20px', fontSize: '9px', border: 'none', background: 'var(--primary-glow)', color: 'var(--primary-light)' }}>
                          {companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{companyName}</span>
                      </div>
                      <div className="opp-foot">
                        <span>{dateStr}</span>
                        <button className="opp-btn" onClick={() => navigate('/posts/' + p.id)}>{t('btn_read_post')}</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-muted)' }}>
                <i className="ti ti-news" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> {t('no_approved_opps')}
              </div>
            )}
          </div>
        </section>

        {/* FEATURED MEMBERS SECTION */}
        {!loadingMembers && featuredMembers.length > 0 && (
          <section id="featured-members" style={{ marginBottom: '5rem' }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{t('menu_members')}</div>
                <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: 0 }}>{t('featured_members_title')}</h2>
              </div>
              <Link to="/members" className="btn" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', textDecoration: 'none' }}>
                {t('btn_view_all_members')} <i className="ti ti-arrow-right"></i>
              </Link>
            </div>

            <div className="opp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {featuredMembers.map((m) => {
                const avatarColors = getMemberInitialsColors(m.name);
                const initials = m.name ? m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HV';
                const tierBadge = m.tier === 'Platinum' ? '💎 Platinum' : m.tier === 'Gold' ? '🏅 Gold' : '🪙 Silver';
                const tierClass = m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver';
                
                return (
                  <div className="glass-card" key={m.id} style={{ 
                    position: 'relative', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    border: '1px solid rgba(245,158,11,0.25)', 
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)';
                  }}
                  onClick={() => navigate('/members')}
                  >
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0) 70%)', pointerEvents: 'none' }} />

                    <div style={{ height: '60px', background: `linear-gradient(135deg, ${avatarColors.bg} 0%, rgba(255,255,255,0) 100%)`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>
                    <div style={{ padding: '1.5rem', marginTop: '-35px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                      <div className="av-circle" style={{ background: avatarColors.bg, color: avatarColors.fg, width: '54px', height: '54px', fontSize: '16px', border: '3px solid var(--surface-1)', marginBottom: '12px', fontWeight: 700 }}>{initials}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, flex: 1 }}>{m.name}</h3>
                        <span className={`badge ${tierClass}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{tierBadge}</span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="ti ti-briefcase" style={{ color: 'var(--amber)' }}></i> {m.industry || t('category_default')}
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description || t('desc_default')}</p>
                      
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="ti ti-map-pin"></i> {m.city || t('location_default')}</span>
                        <span style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 600 }}>{t('btn_contact')} <i className="ti ti-chevron-right"></i></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* UPCOMING EVENTS SECTION */}
        <section id="events" style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{t('menu_events')}</div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: 0 }}>{t('events_section_title')}</h2>
            </div>
            <Link to="/events" className="btn" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', textDecoration: 'none' }}>
              {t('btn_view_all_events')} <i className="ti ti-arrow-right"></i>
            </Link>
          </div>

          <div className="opp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {loadingEvents ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> {t('loading_events_list')}
              </div>
            ) : events.length > 0 ? (
              events.map((e) => {
                const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('vi-VN') : '15/07/2026';
                const statusLabel = e.status === 'upcoming' ? t('status_upcoming') : e.status === 'ongoing' ? t('status_ongoing') : e.status === 'completed' ? t('status_completed') : t('status_cancelled');
                return (
                  <div className="opp-card" key={e.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', background: e.status === 'upcoming' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: e.status === 'upcoming' ? 'var(--amber)' : '#10B981', border: `1px solid ${e.status === 'upcoming' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{statusLabel}</span>
                        <button 
                          onClick={(evt) => {
                            evt.stopPropagation();
                            handleToggleEventInterest(e.id);
                          }}
                          style={{ background: 'none', border: 'none', color: e.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '16px', outline: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title={e.is_interested ? "Bỏ quan tâm" : "Quan tâm sự kiện"}
                        >
                          <i className={e.is_interested ? "ti ti-star-filled" : "ti ti-star"}></i>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{e.interest_count || 0}</span>
                        </button>
                      </div>
                      <h3 className="opp-title" style={{ minHeight: 'unset', marginBottom: '8px' }}>{e.title}</h3>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}><i className="ti ti-calendar"></i> Ngày: {dateStr}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}><i className="ti ti-users"></i> Tổ chức: {e.organizer || 'Voma'}</div>
                      {!token && (
                        <div style={{ fontSize: '11px', color: 'var(--rose)', marginTop: '8px', background: 'rgba(244,63,94,0.05)', padding: '6px', borderRadius: '4px', border: '1px dashed rgba(244,63,94,0.15)' }}>
                          <i className="ti ti-lock"></i> {t('login_required_location')}
                        </div>
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="opp-btn" onClick={() => openEventDetail(e)}>{t('btn_view_details')}</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-muted)' }}>
                <i className="ti ti-calendar" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> {t('no_upcoming_events')}
              </div>
            )}
          </div>
        </section>

        {/* MEMBERSHIP TIERS */}
        <section id="tiers" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{t('menu_tiers')}</div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>{t('pricing_section_title')}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-dark-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>{t('pricing_section_desc')}</p>
          </div>

          <div className="tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Silver */}
            <div className="pkg-card silver">
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--text-dark-secondary)' }}>{t('tier_silver')}</div>
                <div className="pkg-price">{t('price_free')}</div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> {t('silver_feat_1')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('silver_feat_2')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('silver_feat_3')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('silver_feat_4')}</div>
              </div>
              <Link to={getTiersLink()} className="btn" style={{ width: '100%', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>

            {/* Gold */}
            <div className="pkg-card gold">
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--amber)', color: '#000', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>{t('label_popular')}</div>
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--amber)' }}>{t('tier_gold')}</div>
                <div className="pkg-price" style={{ fontSize: '24px' }}>{t('price_gold_val')} <span>/ {t('pricing_per_year')}</span></div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> {t('gold_feat_1')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('gold_feat_2')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('gold_feat_3')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('gold_feat_4')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('gold_feat_5')}</div>
              </div>
              <Link to={getTiersLink()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>

            {/* Platinum */}
            <div className="pkg-card platinum">
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>{t('label_elite')}</div>
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--primary-light)' }}>{t('tier_platinum')}</div>
                <div className="pkg-price" style={{ fontSize: '24px' }}>{t('price_platinum_val')} <span>/ {t('pricing_per_year')}</span></div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> {t('plat_feat_1')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('plat_feat_2')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('plat_feat_3')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('plat_feat_4')}</div>
                <div className="pkg-item"><i className="ti ti-check"></i> {t('plat_feat_5')}</div>
              </div>
              <Link to={getTiersLink()} className="btn" style={{ width: '100%', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(30, 136, 229, 0.1)', borderColor: 'var(--primary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />



      {/* Modal xem chi tiết sự kiện */}
      {eventModalOpen && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', borderColor: 'var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-calendar-event" style={{ color: 'var(--amber)' }}></i> {t('event_details_title')}
              </h3>
              <button onClick={() => setEventModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto', textAlign: 'left' }}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_name')}</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.title}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_organizer')}</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.organizer || 'Voma'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_date')}</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{new Date(selectedEvent.event_date).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_max_capacity')}</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.capacity ? t('capacity_people')(selectedEvent.capacity) : t('capacity_unlimited')}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_location')}</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.location || t('location_default')}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_description')}</span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedEvent.description || t('no_event_desc')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => handleToggleEventInterest(selectedEvent.id)}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', background: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.05)', color: selectedEvent.is_interested ? '#000' : '#fff', borderColor: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.1)', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
              >
                <i className={selectedEvent.is_interested ? "ti ti-star-filled" : "ti ti-star"}></i>
                {selectedEvent.is_interested ? t('status_interested') : t('btn_interest')} ({selectedEvent.interest_count || 0})
              </button>
              <button className="btn btn-primary" onClick={() => setEventModalOpen(false)}>{t('btn_close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
