import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, token } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Xem chi tiết hội viên đăng tải
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  const handleViewMemberDetails = async (memberId) => {
    if (!memberId) return;
    setLoadingMember(true);
    setShowMemberModal(true);
    try {
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch(`/api/members/${memberId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMemberDetails(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching member details', err);
    } finally {
      setLoadingMember(false);
    }
  };

  const demoImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch(`/api/posts/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setPost(data.data);
          } else {
            setError('Không tìm thấy bài viết.');
          }
        } else {
          setError('Không tìm thấy bài viết hoặc bạn không có quyền xem.');
        }
      } catch (err) {
        setError('Có lỗi xảy ra: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, token]);

  if (loading) {
    return (
      <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', display: 'block', margin: '0 auto 15px' }}></i>
            Đang tải chi tiết bài viết...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }} className="glass-card">
            <i className="ti ti-alert-triangle" style={{ fontSize: '48px', color: '#EF4444', display: 'block', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>Đã xảy ra lỗi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '1.5rem' }}>{error || 'Không tìm thấy thông tin.'}</p>
            <button onClick={() => navigate('/posts')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>Quay lại Bảng tin</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '11/06/2026';
  const hasValidImg = post.image_url && post.image_url !== 'null' && post.image_url !== 'undefined' && post.image_url.trim() !== '';
  const imgUrl = hasValidImg ? post.image_url : demoImages[post.id % demoImages.length];
  const isGuest = role === 'guest';
  const isPlatinum = post.company_tier === 'Platinum';
  const isGold = post.company_tier === 'Gold';

  return (
    <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '3rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'left' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '10px' }}></i>
            <Link to="/posts" style={{ color: 'inherit', textDecoration: 'none' }}>Bảng tin cơ hội</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '10px' }}></i>
            <span style={{ color: '#fff' }}>{post.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'start' }}>
            
            {/* Left Column: Post Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              
              {/* Cover Image */}
              <div style={{ width: '100%', maxHeight: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={imgUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Title & Meta Info */}
              <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                {post.is_featured === 1 && (
                  <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    Nổi bật <i className="ti ti-star-filled"></i>
                  </span>
                )}
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {post.type === 'offer' ? 'Cần bán / Cung cấp' : post.type === 'demand' ? 'Cần mua / Tìm kiếm' : 'Hợp tác'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.category || 'Chung'}</span>
                </div>

                <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '28px', color: '#fff', fontWeight: 700, lineHeight: '1.4', margin: '0 0 12px' }}>
                  {post.title}
                </h1>
                
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Đăng ngày: <strong style={{ color: '#fff' }}>{dateStr}</strong>
                </div>
              </div>

              {/* Summary / Lead Paragraph */}
              {post.summary && (
                <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(0,229,255,0.02)', borderColor: 'rgba(0,229,255,0.1)' }}>
                  <p style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--neon-cyan)', margin: 0, lineHeight: '1.6' }}>
                    {post.summary}
                  </p>
                </div>
              )}

              {/* Main Content Body */}
              <div className="glass-card" style={{ padding: '30px 24px' }}>
                <div 
                  className="post-html-body"
                  dangerouslySetInnerHTML={{ __html: post.body }}
                  style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.8',
                    textAlign: 'left',
                  }}
                />
              </div>

            </div>

            {/* Right Column: Sidebar (Author Details & Contact Info) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              
              {/* Author / Company Details */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 15px' }}>Đơn vị đăng tải</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                  <div className="av-circle" style={{ width: '48px', height: '48px', fontSize: '18px', background: isPlatinum ? 'linear-gradient(135deg, #FFD700, #FFA500)' : isGold ? 'var(--amber-glow)' : 'var(--primary-glow)', color: '#fff' }}>
                    {post.company_name ? post.company_name.substring(0, 2).toUpperCase() : 'DN'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, margin: 0 }}>{post.company_name || 'Hội viên ẩn danh'}</h3>
                    <span style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '9px',
                      background: isPlatinum ? 'rgba(245,158,11,0.15)' : isGold ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                      color: isPlatinum || isGold ? 'var(--amber)' : 'var(--text-muted)',
                      border: `1px solid ${isPlatinum || isGold ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {post.company_tier || 'Silver'}
                    </span>
                    {post.member_id && (
                      <button 
                        onClick={() => handleViewMemberDetails(post.member_id)}
                        style={{
                          marginTop: '8px',
                          background: 'rgba(0, 229, 255, 0.08)',
                          border: '1px solid rgba(0, 229, 255, 0.2)',
                          color: 'var(--neon-cyan)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          outline: 'none'
                        }}
                      >
                        <i className="ti ti-info-circle"></i> Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '15px 0' }} />
                
                {/* Contact Information Section (Login Wall) */}
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Thông tin liên hệ</h4>
                
                {isGuest ? (
                  <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                    <i className="ti ti-lock" style={{ fontSize: '20px', color: 'var(--neon-cyan)', marginBottom: '8px', display: 'block' }}></i>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: '1.5' }}>
                      Đăng nhập hội viên để xem thông tin liên hệ của dự án này.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ display: 'block', padding: '6px 12px', fontSize: '11.5px', textDecoration: 'none', textAlign: 'center' }}>
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <i className="ti ti-info-square" style={{ color: 'var(--neon-cyan)', marginTop: '2px' }}></i>
                      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', wordBreak: 'break-word' }}>
                        {post.contact_info || 'Liên hệ trực tiếp qua hệ thống'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Back */}
              <Link to="/posts" className="btn" style={{ display: 'block', padding: '10px 15px', fontSize: '12.5px', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center' }}>
                <i className="ti ti-arrow-left"></i> Quay lại Bảng tin
              </Link>

            </div>

          </div>

        </div>
      </main>

      <Footer />

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowMemberModal(false)}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setShowMemberModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }} className="hover-highlight">
              <i className="ti ti-x"></i>
            </button>

            {loadingMember ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i>
                Đang tải thông tin hội viên...
              </div>
            ) : memberDetails ? (
              <div>
                {/* Header Profile */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="av-circle" style={{ width: '56px', height: '56px', fontSize: '22px', background: memberDetails.tier === 'Platinum' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : memberDetails.tier === 'Gold' ? 'var(--amber-glow)' : 'var(--primary-glow)', color: '#fff', fontWeight: 600 }}>
                    {memberDetails.name ? memberDetails.name.substring(0, 2).toUpperCase() : 'DN'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 700, margin: 0 }}>{memberDetails.name}</h2>
                    <span style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '9px',
                      background: memberDetails.tier === 'Platinum' ? 'rgba(245,158,11,0.15)' : memberDetails.tier === 'Gold' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                      color: memberDetails.tier === 'Platinum' || memberDetails.tier === 'Gold' ? 'var(--amber)' : 'var(--text-muted)',
                      border: `1px solid ${memberDetails.tier === 'Platinum' || memberDetails.tier === 'Gold' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Hạng: {memberDetails.tier || 'Silver'}
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '15px' }} />

                {/* Main Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lĩnh vực hoạt động</div>
                    <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500, marginTop: '2px' }}>{memberDetails.industry || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quy mô</div>
                    <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500, marginTop: '2px' }}>{memberDetails.size || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tỉnh/Thành phố</div>
                    <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500, marginTop: '2px' }}>{memberDetails.city || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Địa chỉ</div>
                    <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 500, marginTop: '2px' }}>{memberDetails.address || 'Chưa cập nhật'}</div>
                  </div>
                  {memberDetails.website && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Website</div>
                      <a href={memberDetails.website.startsWith('http') ? memberDetails.website : `https://${memberDetails.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--neon-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <i className="ti ti-world"></i> {memberDetails.website}
                      </a>
                    </div>
                  )}
                </div>

                {memberDetails.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Mô tả hoạt động</div>
                    <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      {memberDetails.description}
                    </div>
                  </div>
                )}

                {/* Contact wall check */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '15px' }} />
                
                <h3 style={{ fontSize: '13px', color: '#fff', fontWeight: 600, margin: '0 0 10px' }}>Thông tin liên hệ</h3>
                {isGuest ? (
                  <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                    <i className="ti ti-lock" style={{ fontSize: '18px', color: 'var(--neon-cyan)', marginBottom: '6px', display: 'block' }}></i>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: '1.4' }}>
                      Bạn cần đăng nhập để xem thông tin liên hệ trực tiếp của doanh nghiệp này.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '4px 15px', fontSize: '11px' }}>Đăng nhập ngay</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Người liên hệ</div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{memberDetails.contact_name || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chức vụ</div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{memberDetails.contact_pos || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{memberDetails.email || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số điện thoại</div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{memberDetails.phone || 'Chưa cập nhật'}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                Không tìm thấy thông tin hội viên này.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
