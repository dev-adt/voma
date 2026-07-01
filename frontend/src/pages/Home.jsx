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
          setLatestPosts((data.data || []).slice(0, 3));
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
    if (role === 'member') return 'Nâng cấp ngay';
    return 'Đăng ký ngay';
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
              <i className="ti ti-sparkles"></i> Kết nối giao thương số 1 Việt Nam
            </div>
            <h1 className="hero-title">
              Kết nối doanh nghiệp,<br /><span>Cùng phát triển bền vững</span>
            </h1>
            <p className="hero-desc">
              AVG là cầu nối tin cậy giữa các doanh nghiệp hàng đầu. Tìm kiếm đối tác kinh doanh nhanh chóng, chia sẻ cơ hội đầu tư hợp tác và tiếp cận trợ lý AI nghiệp vụ thông minh 24/7.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', textDecoration: 'none' }}>
                <i className="ti ti-arrow-up-right"></i> Gia nhập ngay (Miễn phí)
              </Link>
              <Link to="/members" className="btn" style={{ padding: '12px 24px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', textDecoration: 'none' }}>
                <i className="ti ti-search"></i> Khám phá hội viên
              </Link>
            </div>
          </div>
          
          <div className="hero-right float-effect" style={{ flex: '1', minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
            <div className="hero-img-wrap">
              <img src="/images/hero_network.png" alt="Mạng lưới kết nối AVG" />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(8, 14, 30, 0.75)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: 'var(--radius)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--emerald)', animation: 'pulse 2s infinite' }}></div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF' }}>Thời gian thực kết nối doanh nghiệp Việt</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS CARD GRID */}
        <div className="stats-row" style={{ marginBottom: '5rem' }}>
          <div className="glass-card stat-card">
            <div className="stat-label">Hội viên hoạt động</div>
            <div className="stat-val">{stats.members || 20}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>Doanh nghiệp đã xác thực</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">Cơ hội chia sẻ</div>
            <div className="stat-val">{stats.posts || 50}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>Tin kết nối mới định kỳ</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">Doanh nghiệp đa dạng</div>
            <div className="stat-val">1.2k+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>Công nghệ, Sản xuất, Bán lẻ</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-label">Sự kiện giao thương</div>
            <div className="stat-val">{stats.events || 5}+</div>
            <div className="stat-sub" style={{ color: 'var(--text-dark-muted)' }}>Hội nghị xúc tiến hàng năm</div>
          </div>
        </div>

        {/* MAIN SERVICES SECTION */}
        <section id="features" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Các dịch vụ chính</div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>Giải pháp số hoá kết nối doanh nghiệp</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-dark-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>AVG cung cấp hạ tầng chuyển đổi số toàn diện để bạn giao thương, tìm đối tác và sử dụng Trợ lý AI phân tích sâu.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="srv-card">
              <div className="srv-icon"><i className="ti ti-users"></i></div>
              <h3 className="srv-title">Kết nối Hội viên</h3>
              <p className="srv-desc">Kết nối hội viên, tiếp cận các doanh nghiệp lớn đã xác thực hồ sơ pháp nhân an toàn.</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)' }}><i className="ti ti-list-details"></i></div>
              <h3 className="srv-title">Bảng tin Cơ hội</h3>
              <p className="srv-desc">Tìm kiếm đối tác tiềm năng, bảng tin hội hỗ trợ kết nối dự án và cơ hội đầu tư hiệu quả.</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--neon-cyan)' }}><i className="ti ti-robot"></i></div>
              <h3 className="srv-title">Trợ lý AI thông minh</h3>
              <p className="srv-desc">Trợ lý AI nghiệp vụ trả lời thông tin tức thời, hỗ trợ tìm kiếm đối tác và đề xuất tự động.</p>
            </div>
            <div className="srv-card">
              <div className="srv-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)' }}><i className="ti ti-chart-dots"></i></div>
              <h3 className="srv-title">Phân tích Thị trường</h3>
              <p className="srv-desc">Trợ lý AI thông minh phân tích xu hướng thị trường, tổng hợp dữ liệu giao dịch ngành.</p>
            </div>
          </div>
        </section>

        {/* LATEST OPPORTUNITIES SECTION */}
        <section id="posts" style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Cơ hội giao thương mới nhất</div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: 0 }}>Dự án kết nối nổi bật</h2>
            </div>
            <Link to="/posts" className="btn" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', textDecoration: 'none' }}>
              Xem tất cả cơ hội <i className="ti ti-arrow-right"></i>
            </Link>
          </div>

          <div className="opp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {loadingPosts ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách cơ hội giao thương mới nhất...
              </div>
            ) : latestPosts.length > 0 ? (
              latestPosts.map((p, idx) => {
                const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '11/06/2026';
                const imgUrl = p.image_url || demoImages[idx % demoImages.length];
                const companyName = p.company_name || 'Hội viên ẩn danh';
                return (
                  <div className="opp-card" key={p.id}>
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
                        <button className="opp-btn" onClick={() => openPostDetail(p)}>Xem chi tiết</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-muted)' }}>
                <i className="ti ti-news" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Hiện chưa có cơ hội giao thương nào được duyệt.
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENTS SECTION */}
        <section id="events" style={{ marginBottom: '5rem' }}>
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Sự kiện giao thương sắp tới</div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: 0 }}>Giao lưu & Kết nối doanh nghiệp</h2>
            </div>
            <Link to="/events" className="btn" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', textDecoration: 'none' }}>
              Xem tất cả sự kiện <i className="ti ti-arrow-right"></i>
            </Link>
          </div>

          <div className="opp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {loadingEvents ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách sự kiện...
              </div>
            ) : events.length > 0 ? (
              events.map((e) => {
                const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('vi-VN') : '15/07/2026';
                const statusLabel = e.status === 'upcoming' ? 'Sắp diễn ra' : e.status === 'ongoing' ? 'Đang diễn ra' : e.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy';
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
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}><i className="ti ti-users"></i> Tổ chức: {e.organizer || 'AVG'}</div>
                      {!token && (
                        <div style={{ fontSize: '11px', color: 'var(--rose)', marginTop: '8px', background: 'rgba(244,63,94,0.05)', padding: '6px', borderRadius: '4px', border: '1px dashed rgba(244,63,94,0.15)' }}>
                          <i className="ti ti-lock"></i> Đăng nhập để xem chi tiết địa điểm.
                        </div>
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="opp-btn" onClick={() => openEventDetail(e)}>Xem chi tiết</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dark-muted)' }}>
                <i className="ti ti-calendar" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Hiện chưa có sự kiện giao thương nào sắp tới.
              </div>
            )}
          </div>
        </section>

        {/* MEMBERSHIP TIERS */}
        <section id="tiers" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neon-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Các gói hội viên</div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>Lựa chọn gói hội viên phù hợp</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-dark-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>Tham gia định vị thương hiệu, gia tăng quyền lợi giao thương và kết nối với các đối tác VIP.</p>
          </div>

          <div className="tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Silver */}
            <div className="pkg-card silver">
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--text-dark-secondary)' }}>Silver</div>
                <div className="pkg-price">Miễn phí</div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> Hội viên hoạt động cơ bản</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Hiển thị doanh nghiệp tại trang danh sách</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Đăng tối đa 3 tin bài kết nối/tháng</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Hỏi đáp Trợ lý AI cơ bản</div>
              </div>
              <Link to={getTiersLink()} className="btn" style={{ width: '100%', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>

            {/* Gold */}
            <div className="pkg-card gold">
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--amber)', color: '#000', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Phổ biến</div>
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--amber)' }}>Gold</div>
                <div className="pkg-price" style={{ fontSize: '24px' }}>5.000.000đ <span>/ năm</span></div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> Đầy đủ quyền lợi gói Silver</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Ưu tiên hiển thị doanh nghiệp nổi bật</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Đăng 15 tin bài kết nối/tháng</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Mở rộng tương tác AI tự động kết nối</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Nhận cơ hội giao thương đặc quyền</div>
              </div>
              <Link to={getTiersLink()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>

            {/* Platinum */}
            <div className="pkg-card platinum">
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Thượng lưu</div>
              <div className="pkg-header">
                <div className="pkg-name" style={{ color: 'var(--primary-light)' }}>Platinum</div>
                <div className="pkg-price" style={{ fontSize: '24px' }}>15.000.000đ <span>/ năm</span></div>
              </div>
              <div className="pkg-list">
                <div className="pkg-item"><i className="ti ti-check"></i> Quyền lợi cao cấp nhất hệ thống</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Đăng tin giao thương không giới hạn</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Tư vấn kết nối đối tác riêng biệt</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Báo cáo phân tích thị trường chuyên sâu</div>
                <div className="pkg-item"><i className="ti ti-check"></i> Trợ lý AI riêng tùy biến cho thương hiệu</div>
              </div>
              <Link to={getTiersLink()} className="btn" style={{ width: '100%', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(30, 136, 229, 0.1)', borderColor: 'var(--primary)', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>{getTiersButtonText()}</Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />

      {/* Modal xem chi tiết cơ hội giao thương */}
      {modalOpen && selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', borderColor: 'var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-bulb" style={{ color: 'var(--neon-cyan)' }}></i> Chi tiết cơ hội giao thương
              </h3>
              <button onClick={closePostDetail} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto', textAlign: 'left' }}>
              {selectedPost.image_url && (
                <div style={{ marginBottom: '14px', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={selectedPost.image_url} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 700 }}>Doanh nghiệp</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{selectedPost.company_name || 'Hội viên ẩn danh'}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 700 }}>Tiêu đề</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{selectedPost.title}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 700 }}>Nội dung chi tiết</span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedPost.body}</div>
              </div>
              
              {role === 'guest' ? (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(30,136,229,0.08)', border: '1px solid rgba(30,136,229,0.2)', borderRadius: '10px', textAlign: 'center' }}>
                  <i className="ti ti-lock" style={{ fontSize: '20px', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}></i>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Đăng nhập hội viên để xem thông tin liên hệ đối tác</div>
                  <Link to="/login" className="btn btn-primary" style={{ padding: '7px 18px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex' }}><i className="ti ti-login"></i> Đăng nhập ngay</Link>
                </div>
              ) : (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,255,163,0.06)', border: '1px solid rgba(0,255,163,0.2)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: '6px' }}><i className="ti ti-phone"></i> Thông tin liên hệ</div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', whiteSpace: 'pre-wrap' }}>{selectedPost.contact_info}</div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={closePostDetail}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết sự kiện */}
      {eventModalOpen && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', borderColor: 'var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-calendar-event" style={{ color: 'var(--amber)' }}></i> Chi tiết sự kiện giao thương
              </h3>
              <button onClick={() => setEventModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto', textAlign: 'left' }}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Tên Sự Kiện</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.title}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Đơn vị tổ chức</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.organizer || 'AVG'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Ngày Tổ chức</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{new Date(selectedEvent.event_date).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Sức chứa tối đa</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.capacity ? `${selectedEvent.capacity} người` : 'Không giới hạn'}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Địa điểm tổ chức</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.location || 'Chưa cập nhật'}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>Mô tả chi tiết</span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedEvent.description || 'Không có mô tả chi tiết cho sự kiện này.'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => handleToggleEventInterest(selectedEvent.id)}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', background: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.05)', color: selectedEvent.is_interested ? '#000' : '#fff', borderColor: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.1)', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
              >
                <i className={selectedEvent.is_interested ? "ti ti-star-filled" : "ti ti-star"}></i>
                {selectedEvent.is_interested ? 'Đã quan tâm' : 'Quan tâm sự kiện'} ({selectedEvent.interest_count || 0})
              </button>
              <button className="btn btn-primary" onClick={() => setEventModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
