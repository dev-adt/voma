import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export const Sidebar = () => {
  const { logout, getAuthHeaders } = useAuth();
  const { currentLang, changeLang } = useTranslation();
  const navigate = useNavigate();

  const [pendingMembers, setPendingMembers] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Lấy thống kê số lượng hàng chờ duyệt
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const res = await fetch('/api/stats', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPendingMembers(data.members.pending || 0);
            setPendingPosts(data.posts.pending || 0);
          }
        }
      } catch (e) {
        console.error("Failed to load pending counts in Sidebar", e);
      }
    };

    fetchPendingCounts();
    // Tạo khoảng thời gian làm mới mỗi 30s
    const timer = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(timer);
  }, []);

  // Tìm kiếm cục bộ trong Sidebar (giống search.js cũ)
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q || q.length < 1) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    // Dữ liệu tìm kiếm giả định/tĩnh dựa trên thiết kế cũ
    const SEARCH_DATA = [
      { type: 'member', title: 'Công ty CP Vina Tech', sub: 'Công nghệ thông tin · Platinum', url: '/members' },
      { type: 'member', title: 'Hoàng Long Export', sub: 'Xuất nhập khẩu · Gold', url: '/members' },
      { type: 'member', title: 'BĐS Phú Thịnh', sub: 'Bất động sản · Silver', url: '/members' },
      { type: 'member', title: 'Dược phẩm Sao Mai', sub: 'Y tế & Sức khỏe · Platinum', url: '/members' },
      { type: 'member', title: 'Giáo dục Ánh Dương', sub: 'Giáo dục & Đào tạo · Gold', url: '/members' },
      { type: 'member', title: 'Fintech VN Partners', sub: 'Dịch vụ tài chính · Gold', url: '/members' },
      { type: 'post', title: 'Tìm đối tác triển khai ERP miền Trung', sub: 'Vina Tech · Đối tác', url: '/posts' },
      { type: 'post', title: 'Cần nhà cung cấp gạo ST25 số lượng lớn', sub: 'Hoàng Long · Cần mua', url: '/posts' },
      { type: 'post', title: 'Hội thảo dược phẩm Q3 2025', sub: 'Sao Mai · Sự kiện', url: '/posts' },
      { type: 'event', title: 'Hội nghị xuất khẩu ASEAN 2025', sub: '15/07/2025 · Hà Nội', url: '/' },
      { type: 'event', title: 'Vietnam Tech Expo 2025', sub: '22/07/2025 · TP. HCM', url: '/' }
    ];

    const hits = SEARCH_DATA.filter(r => 
      r.title.toLowerCase().includes(q.toLowerCase()) || 
      r.sub.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);

    setSearchResults(hits);
    setSearchOpen(true);
  };

  const navigateTo = (url) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(url);
  };

  return (
    <aside className="sidebar">
      <Link to="/admin-dashboard" className="sb-logo" style={{ textDecoration: 'none' }}>
        <div className="sb-logo-icon"><i className="ti ti-building-community"></i></div>
        <div>
          <div className="sb-logo-name">BizHub</div>
          <div className="sb-logo-sub">Hội viên doanh nghiệp</div>
        </div>
      </Link>
      
      <div className="sb-search">
        <div className="sb-sw">
          <i className="ti ti-search"></i>
          <input 
            type="text" 
            placeholder="Tìm nhanh..." 
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery && setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          {searchOpen && (
            <div className="search-dropdown open" style={{ display: 'block', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div className="sd-empty">Không tìm thấy kết quả</div>
              ) : (
                searchResults.map((item, idx) => (
                  <div key={idx} className="sd-item" onClick={() => navigateTo(item.url)} style={{ cursor: 'pointer' }}>
                    <i className={`ti ${item.type === 'member' ? 'ti-users' : (item.type === 'post' ? 'ti-news' : 'ti-calendar-event')}`} style={{ fontSize: '14px', color: '#185FA5' }}></i>
                    <div>
                      <div className="sd-title" style={{ fontSize: '12px', fontWeight: '600' }}>{item.title}</div>
                      <div className="sd-sub" style={{ fontSize: '10px', color: '#94A3B8' }}>{item.sub}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="sb-sec">Quản trị</div>
      
      <NavLink 
        to="/admin-dashboard" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-layout-dashboard"></i> Dashboard
      </NavLink>
      
      <NavLink 
        to="/admin-members" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-users"></i> Duyệt hội viên 
        {pendingMembers > 0 && <span className="sb-badge">{pendingMembers}</span>}
      </NavLink>
      
      <NavLink 
        to="/admin-posts" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-clipboard-check"></i> Duyệt bài viết 
        {pendingPosts > 0 && <span className="sb-badge">{pendingPosts}</span>}
      </NavLink>
      
      <NavLink 
        to="/admin-config" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-settings"></i> Cài đặt AI
      </NavLink>
      
      <Link to="/" className="sb-item" style={{ textDecoration: 'none' }}>
        <i className="ti ti-external-link"></i> Xem Trang chủ
      </Link>

      <button 
        onClick={() => {
          if (confirm('Bạn có muốn đăng xuất tài khoản Admin?')) logout();
        }}
        className="sb-item" 
        style={{ 
          background: 'none', 
          border: 'none', 
          width: '100%', 
          textAlign: 'left', 
          cursor: 'pointer',
          color: 'var(--rose)'
        }}
      >
        <i className="ti ti-logout"></i> Đăng xuất Admin
      </button>
      
      <div className="lang-section">
        <div className="lang-label">Ngôn ngữ</div>
        <div className="lang-grid">
          <button className={`lb ${currentLang === 'vi' ? 'active' : ''}`} onClick={() => changeLang('vi')}>🇻🇳 VI</button>
          <button className={`lb ${currentLang === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>🇺🇸 EN</button>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
