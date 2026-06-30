import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Posts = () => {
  const { role, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    const loadPosts = async () => {
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/posts?status=approved', { headers });
        if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
        const data = await res.json();
        
        const mappedPosts = (data.data || []).map(p => {
          const colors = p.company_name ? getInitialsColors(p.company_name) : { bg: '#E6F1FB', fg: '#0C447C' };
          return {
            id: p.id,
            memberId: p.member_id,
            company: p.company_name || 'Hội viên ẩn danh',
            initials: p.company_name ? p.company_name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HV',
            bg: colors.bg,
            fg: colors.fg,
            title: p.title,
            summary: p.summary || '',
            body: p.body,
            type: p.type || 'Bài viết',
            contact: p.contact_info,
            tags: p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : [],
            date: new Date(p.created_at).toLocaleDateString('vi-VN')
          };
        });

        setPosts(mappedPosts);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [token]);

  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.company.toLowerCase().includes(q);
  });

  const openPostModal = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
  };

  return (
    <div className="public-body">
      <Navbar />

      {/* Decorative background gradient blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, rgba(79,70,229,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '60vh', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <i className="ti ti-news" style={{ color: 'var(--primary)' }}></i> Tin bài & Cơ hội giao thương
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>Cập nhật tin tức, nhu cầu hợp tác kinh tế, tuyển dụng mới nhất từ hội viên.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Tìm bài viết, đối tác..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12px', width: '260px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.01)', color: '#fff' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải bài viết...
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> Lỗi tải bài viết: {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-news" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Không tìm thấy bài viết nào phù hợp.
          </div>
        ) : (
          <div id="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPosts.map((p) => (
              <div className="card" key={p.id} style={{ boxShadow: 'var(--shadow)', transition: 'var(--transition)', borderColor: 'var(--border)' }}>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                    <div className="av-circle" style={{ background: p.bg, color: p.fg, flexShrink: 0, fontWeight: 600, width: '40px', height: '40px' }}>{p.initials}</div>
                    <div style={{ flex: 1, minWidth: '240px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.company}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {p.date}</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 600, marginBottom: '6px', lineHeight: 1.4, color: 'var(--text-primary)', marginBlockStart: 0 }}>{p.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBlockEnd: 0 }}>{p.summary}</p>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {p.tags.map((t, index) => (
                          <span key={index} style={{ background: 'var(--primary-bg)', border: '0.5px solid rgba(79,70,229,0.1)', borderRadius: '99px', fontSize: '10px', padding: '2px 8px', color: 'var(--primary)', fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                      <button className="btn" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => openPostModal(p)}><i className="ti ti-eye"></i> Đọc bài</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Modal xem bài */}
      {modalOpen && selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 10 }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Chi tiết cơ hội giao thương</div>
              <button onClick={closePostModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}><i className="ti ti-x"></i></button>
            </div>
            
            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div className="av-circle" style={{ background: selectedPost.bg, color: selectedPost.fg, fontWeight: 600, width: '36px', height: '36px', fontSize: '12px' }}>{selectedPost.initials}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{selectedPost.company}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đăng ngày {selectedPost.date}</div>
                </div>
              </div>
              
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>{selectedPost.title}</h2>
              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Phân loại: {selectedPost.type}</div>
              
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                {selectedPost.body}
              </div>

              {role === 'guest' ? (
                <div style={{ padding: '1rem', background: 'rgba(30,136,229,0.08)', border: '1px solid rgba(30,136,229,0.2)', borderRadius: '10px', textAlign: 'center' }}>
                  <i className="ti ti-lock" style={{ fontSize: '20px', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}></i>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Đăng nhập hội viên để xem thông tin liên hệ đối tác</div>
                  <Link to="/login" onClick={closePostModal} className="btn btn-primary" style={{ padding: '7px 18px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex' }}><i className="ti ti-login"></i> Đăng nhập ngay</Link>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(0,255,163,0.06)', border: '1px solid rgba(0,255,163,0.2)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: '6px' }}><i className="ti ti-phone"></i> Thông tin liên hệ</div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', whiteSpace: 'pre-wrap' }}>{selectedPost.contact}</div>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={closePostModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Posts;
