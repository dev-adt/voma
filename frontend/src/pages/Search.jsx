import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Search = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  // Local state
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState({ posts: [], members: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, members, posts, events

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

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ posts: [], members: [], events: [] });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch(`/api/public-search?q=${encodeURIComponent(searchQuery)}`, { headers });
      if (!res.ok) throw new Error('Không thể tìm kiếm thông tin');
      const data = await res.json();
      if (data.success) {
        setResults({
          posts: data.posts || [],
          members: data.members || [],
          events: data.events || []
        });
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(queryParam);
    handleSearch(queryParam);
  }, [queryParam, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const totalResultsCount = results.posts.length + results.members.length + results.events.length;

  return (
    <div className="public-body">
      <Navbar />

      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(16,185,129,0.03) 0%, rgba(16,185,129,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '80vh', paddingBottom: '5rem', paddingTop: '2.5rem' }}>
        
        {/* Title Header */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="ti ti-search" style={{ color: 'var(--primary)' }}></i> Tìm kiếm thông tin
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>
            Tìm kiếm tin giao thương, doanh nghiệp đối tác và các sự kiện trong mạng lưới AVG.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm trên toàn website (ví dụ: công nghệ, nông sản, xúc tiến...)"
                style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-3)', color: '#fff', fontSize: '14px', outline: 'none' }}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Search Results Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAction: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', display: 'block', margin: '0 auto 10px' }}></i> Đang thực hiện tìm kiếm...
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }} className="glass-card">
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> 
            Có lỗi xảy ra: {error}
          </div>
        ) : !queryParam.trim() ? (
          <div style={{ textAlign: 'center', padding: '5rem' }} className="glass-card">
            <i className="ti ti-search" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}></i>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Hãy nhập từ khóa ở khung phía trên để bắt đầu tìm kiếm.</span>
          </div>
        ) : (
          <div>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '20px', marginBottom: '2rem' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('all')} 
                style={{ padding: '10px 4px', border: 'none', background: 'none', color: activeTab === 'all' ? 'var(--primary-light)' : 'var(--text-secondary)', borderBottom: activeTab === 'all' ? '2px solid var(--primary-light)' : '2px solid transparent', fontSize: '13.5px', fontWeight: activeTab === 'all' ? 700 : 'normal', cursor: 'pointer', outline: 'none' }}
              >
                Tất cả ({totalResultsCount})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('members')} 
                style={{ padding: '10px 4px', border: 'none', background: 'none', color: activeTab === 'members' ? 'var(--primary-light)' : 'var(--text-secondary)', borderBottom: activeTab === 'members' ? '2px solid var(--primary-light)' : '2px solid transparent', fontSize: '13.5px', fontWeight: activeTab === 'members' ? 700 : 'normal', cursor: 'pointer', outline: 'none' }}
              >
                Hội viên ({results.members.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('posts')} 
                style={{ padding: '10px 4px', border: 'none', background: 'none', color: activeTab === 'posts' ? 'var(--primary-light)' : 'var(--text-secondary)', borderBottom: activeTab === 'posts' ? '2px solid var(--primary-light)' : '2px solid transparent', fontSize: '13.5px', fontWeight: activeTab === 'posts' ? 700 : 'normal', cursor: 'pointer', outline: 'none' }}
              >
                Tin giao thương ({results.posts.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('events')} 
                style={{ padding: '10px 4px', border: 'none', background: 'none', color: activeTab === 'events' ? 'var(--primary-light)' : 'var(--text-secondary)', borderBottom: activeTab === 'events' ? '2px solid var(--primary-light)' : '2px solid transparent', fontSize: '13.5px', fontWeight: activeTab === 'events' ? 700 : 'normal', cursor: 'pointer', outline: 'none' }}
              >
                Sự kiện ({results.events.length})
              </button>
            </div>

            {totalResultsCount === 0 && (
              <div style={{ textAlign: 'center', padding: '5rem' }} className="glass-card">
                <i className="ti ti-face-sad" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}></i>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Không tìm thấy kết quả nào phù hợp với từ khóa "<strong>{queryParam}</strong>".</span>
              </div>
            )}

            {/* 1. MEMBERS RESULTS */}
            {(activeTab === 'all' || activeTab === 'members') && results.members.length > 0 && (
              <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)', paddingLeft: '8px' }}>
                  Hội viên ({results.members.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {results.members.map((m) => {
                    const initials = m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const colors = getInitialsColors(m.name);
                    const tierBadge = m.tier === 'Platinum' ? '💎 Platinum' : m.tier === 'Gold' ? '🏅 Gold' : '🪙 Silver';
                    const tierClass = m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver';

                    return (
                      <div className="card" key={`mem-${m.id}`} style={{ boxShadow: 'var(--shadow)', transition: 'var(--transition)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '60px', background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255,255,255,0) 100%)`, borderBottom: '1px solid var(--border)' }}></div>
                        <div style={{ padding: '1.25rem', marginTop: '-35px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div className="av-circle" style={{ background: colors.bg, color: colors.fg, width: '54px', height: '54px', fontSize: '16px', border: '3px solid #ffffff', marginBottom: '12px', fontWeight: 600 }}>{initials}</div>
                          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3, textAlign: 'left' }}>{m.name}</h3>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-briefcase"></i> {m.industry || 'Chưa chọn'}
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '15px', flex: 1, textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description || 'Chưa có mô tả.'}</p>
                          
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
                                <i className="ti ti-lock"></i> Đăng nhập để hiển thị liên hệ
                              </div>
                            </div>
                          )}

                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`badge ${tierClass}`}>{tierBadge}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="ti ti-map-pin"></i> {m.city || 'Việt Nam'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. POSTS RESULTS */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)', paddingLeft: '8px' }}>
                  Tin giao thương ({results.posts.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {results.posts.map((p) => {
                    const defaultPostImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60';
                    return (
                      <div className="card" key={`post-${p.id}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={p.image_url && p.image_url !== 'null' && p.image_url !== 'undefined' ? p.image_url : defaultPostImage} 
                            alt={p.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {p.type}
                          </span>
                        </div>
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ fontSize: '11px', color: 'var(--primary-light)', marginBottom: '6px', fontWeight: 600 }}>
                            {p.category || 'Giao thương'}
                          </div>
                          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.4, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {p.title}
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '15px', height: '54px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                            {p.summary}
                          </p>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>{p.company_name}</span>
                            <Link to={`/posts/${p.id}`} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none', borderRadius: '4px' }}>
                              Đọc thêm
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. EVENTS RESULTS */}
            {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
              <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)', paddingLeft: '8px' }}>
                  Sự kiện ({results.events.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {results.events.map((ev) => {
                    const defaultEvImage = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=60';
                    return (
                      <div className="card" key={`ev-${ev.id}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={ev.image_url || defaultEvImage} 
                            alt={ev.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ fontSize: '11px', color: 'var(--emerald)', marginBottom: '6px', fontWeight: 600 }}>
                            <i className="ti ti-calendar"></i> {new Date(ev.date).toLocaleDateString('vi-VN')}
                          </div>
                          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.4 }}>
                            {ev.title}
                          </h3>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Tổ chức: <strong>{ev.organizer}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-map-pin"></i> {ev.location}
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <Link to="/events" className="btn" style={{ padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none', borderRadius: '6px', backgroundColor: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                              Chi tiết sự kiện
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default Search;
