import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Posts = () => {
  const { role, token } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  // Platinum slider index state
  const [activeSlide, setActiveSlide] = useState(0);

  const demoImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/posts?status=approved', { headers });
        if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
        const data = await res.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [token]);

  // Platinum slider posts (latest 5)
  const platinumPosts = posts
    .filter(p => p.company_tier === 'Platinum')
    .slice(0, 5);

  // Auto scroll Platinum slider
  useEffect(() => {
    if (platinumPosts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % platinumPosts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [platinumPosts.length]);

  // Filters logic
  const filteredPosts = posts.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(q) || 
      (p.company_name && p.company_name.toLowerCase().includes(q)) ||
      (p.summary && p.summary.toLowerCase().includes(q));
      
    const matchesTier = !selectedTier || p.company_tier === selectedTier;
    const matchesType = !selectedType || p.type === selectedType;
    
    return matchesSearch && matchesTier && matchesType;
  });

  // Sort featured posts to the top of the main listing
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.is_featured === 1 && b.is_featured !== 1) return -1;
    if (a.is_featured !== 1 && b.is_featured === 1) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTier, selectedType]);

  // Pagination index calculations
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  const getInitialsColors = (name) => {
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

  return (
    <div className="public-body">
      <Navbar />

      {/* Decorative background gradient blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, rgba(79,70,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '80vh', paddingBottom: '5rem', paddingTop: '2.5rem' }}>
        
        {/* Title Header */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="ti ti-news" style={{ color: 'var(--neon-cyan)' }}></i> Tin bài & Cơ hội giao thương
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>Cập nhật tin tức, cơ hội hợp tác kinh tế, tuyển dụng mới nhất từ các doanh nghiệp hội viên.</p>
        </div>

        {/* 1. TOP PLATINUM SLIDER */}
        {!loading && !error && platinumPosts.length > 0 && (
          <div style={{ position: 'relative', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'var(--surface-2)', marginBottom: '3rem', display: 'flex', alignItems: 'center' }}>
            {platinumPosts.map((p, idx) => {
              const isActive = idx === activeSlide;
              const postImg = p.image_url || demoImages[p.id % demoImages.length];
              return (
                <div key={p.id} style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  visibility: isActive ? 'visible' : 'hidden',
                  transition: 'opacity 0.8s ease-in-out, visibility 0.8s ease-in-out',
                  display: 'flex',
                  background: 'linear-gradient(90deg, rgba(8,14,30,0.95) 0%, rgba(8,14,30,0.4) 100%)',
                }}>
                  {/* Backdrop Cover image */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '60%',
                    backgroundImage: `url(${postImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 100%)'
                  }} />
                  
                  <div style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left', zIndex: 2, maxWidth: '600px' }}>
                    <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ti ti-crown"></i> Đối tác Platinum
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>{p.title}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 15px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.summary || p.body.replace(/<[^>]*>/g, '').substring(0, 150)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <button onClick={() => navigate('/posts/' + p.id)} className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>
                        Đọc bài viết <i className="ti ti-arrow-right"></i>
                      </button>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{p.company_name}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Carousel indicator dots */}
            <div style={{ position: 'absolute', bottom: '15px', left: '2.5rem', display: 'flex', gap: '8px', zIndex: 10 }}>
              {platinumPosts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    background: idx === activeSlide ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. FILTER BAR */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '240px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                placeholder="Tìm bài viết, đối tác..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 30px', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12.5px', outline: 'none', backgroundColor: 'var(--surface-3)', color: '#fff' }}
              />
            </div>

            {/* Filter by Tier */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12.5px', outline: 'none', backgroundColor: 'var(--surface-3)', color: '#fff', cursor: 'pointer', minWidth: '130px' }}
            >
              <option value="">Tất cả hội viên</option>
              <option value="Platinum">Hội viên Platinum</option>
              <option value="Gold">Hội viên Gold</option>
              <option value="Silver">Hội viên Silver</option>
            </select>

            {/* Filter by Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12.5px', outline: 'none', backgroundColor: 'var(--surface-3)', color: '#fff', cursor: 'pointer', minWidth: '140px' }}
            >
              <option value="">Tất cả phân loại</option>
              <option value="offer">Cung cấp sản phẩm</option>
              <option value="demand">Tìm kiếm / Nhu cầu</option>
              <option value="cooperate">Hợp tác phát triển</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tìm thấy <strong>{sortedPosts.length}</strong> bài viết
          </div>
        </div>

        {/* 3. POSTS DIRECTORY LIST */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải bài viết...
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }} className="glass-card">
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> Lỗi tải bài viết: {error}
          </div>
        ) : currentPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem' }} className="glass-card">
            <i className="ti ti-news" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', color: 'var(--text-muted)' }}></i>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Không tìm thấy bài viết nào phù hợp với bộ lọc.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {currentPosts.map((p) => {
              const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '11/06/2026';
              const pImg = p.image_url || demoImages[p.id % demoImages.length];
              const isPlat = p.company_tier === 'Platinum';
              const isGld = p.company_tier === 'Gold';
              const avatarColors = getInitialsColors(p.company_name);
              const initials = p.company_name ? p.company_name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HV';

              return (
                <div className="glass-card" key={p.id} style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s', border: p.is_featured === 1 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                  
                  {/* Featured Badge */}
                  {p.is_featured === 1 && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', fontWeight: 700, zIndex: 1 }}>
                      Nổi bật <i className="ti ti-star-filled"></i>
                    </span>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap', padding: '1.25rem' }}>
                    
                    {/* Cover image left */}
                    <div style={{ width: '130px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <img src={pImg} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Content center */}
                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                      <div>
                        {/* Member avatar & details line */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div className="av-circle" style={{ width: '22px', height: '22px', fontSize: '9px', background: avatarColors.bg, color: avatarColors.fg, fontWeight: 600 }}>{initials}</div>
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>{p.company_name}</span>
                          <span style={{ 
                            fontSize: '8.5px', 
                            background: isPlat ? 'rgba(245,158,11,0.15)' : isGld ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', 
                            color: isPlat || isGld ? 'var(--amber)' : 'var(--text-muted)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {p.company_tier || 'Silver'}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>· {dateStr}</span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 650, color: '#fff', margin: '0 0 6px', lineHeight: 1.4 }}>{p.title}</h3>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>{p.summary || p.body.replace(/<[^>]*>/g, '').substring(0, 120)}</p>
                      </div>

                      {/* Tag & classification */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '9.5px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,229,255,0.08)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,229,255,0.15)', fontWeight: 600 }}>
                          {p.type === 'offer' ? 'Cung cấp' : p.type === 'demand' ? 'Nhu cầu' : 'Hợp tác'}
                        </span>
                        {p.category && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.category}</span>
                        )}
                      </div>
                    </div>

                    {/* Action button right */}
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                      <button onClick={() => navigate('/posts/' + p.id)} className="btn btn-primary" style={{ fontSize: '12.5px', padding: '8px 18px' }}>
                        Đọc bài <i className="ti ti-book-open"></i>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '2.5rem' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '12px', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <i className="ti ti-chevron-left"></i> Trang trước
                </button>
                <span style={{ fontSize: '12.5px', color: '#fff' }}>
                  Trang <strong>{currentPage}</strong> / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '12px', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Trang sau <i className="ti ti-chevron-right"></i>
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

export default Posts;
