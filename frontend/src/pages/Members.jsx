import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Members = () => {
  const { token, getAuthHeaders } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

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
            date: new Date(m.created_at).toLocaleDateString('vi-VN')
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

  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || 
           m.industry.toLowerCase().includes(q) || 
           m.email.toLowerCase().includes(q);
  });

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
              <i className="ti ti-users" style={{ color: 'var(--primary)' }}></i> Thư mục doanh nghiệp hội viên
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>Khám phá các doanh nghiệp thành viên đáng tin cậy trong mạng lưới BizHub.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm tên, ngành, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12px', width: '260px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.01)', color: '#fff' }}
            />
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}><i className="ti ti-user-plus" aria-hidden="true"></i> Đăng ký ngay</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách hội viên...
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> Lỗi tải dữ liệu hội viên: {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-search" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Không tìm thấy hội viên nào phù hợp.
          </div>
        ) : (
          <div id="members-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredMembers.map((m) => {
              const tierBadge = m.tier === 'Platinum' ? '💎 Platinum' : m.tier === 'Gold' ? '🏅 Gold' : '🪙 Silver';
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
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '15px', flex: 1, textAlign: 'left' }}>{m.desc}</p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginTop: 'auto' }}>
                      <span className={`badge ${tierClass}`}>{tierBadge}</span>
                      {m.email !== '***@***.***' ? (
                        <a href={`mailto:${m.email}`} className="btn" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none' }}><i className="ti ti-mail"></i> Liên hệ</a>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="ti ti-lock"></i> Ẩn liên hệ</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default Members;
