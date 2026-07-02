import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminPosts = () => {
  const { getAuthHeaders } = useAuth();

  // States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `status=${statusFilter}` : '';
      const res = await fetch(`/api/posts?${statusParam}`, {
        headers: getAuthHeaders()
      });
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

  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const handleApprove = async (id, title) => {
    if (!confirm(`Duyệt đăng tin bài: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã xuất bản bài viết thành công!');
        loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleReject = async (id, title) => {
    const reason = prompt(`Nhập lý do từ chối bài viết "${title}":`);
    if (reason === null) return;

    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert('Đã từ chối bài viết.');
        loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await fetch(`/api/posts/${id}/featured`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_featured: currentFeatured ? 0 : 1 })
      });
      if (res.ok) {
        alert(currentFeatured ? 'Đã bỏ ghim bài viết nổi bật.' : 'Đã ghim bài viết nổi bật thành công!');
        loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Tìm kiếm cục bộ
  const filteredPosts = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || 
           (p.company_name && p.company_name.toLowerCase().includes(q));
  });

  return (
    <AdminLayout title="Duyệt Tin Giao Thương">
      <div className="card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          
          {/* Tabs bộ lọc */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('all')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tất cả</button>
            <button className={`btn ${statusFilter === 'pending' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('pending')} style={{ fontSize: '12px', padding: '6px 12px' }}>Chờ duyệt</button>
            <button className={`btn ${statusFilter === 'approved' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('approved')} style={{ fontSize: '12px', padding: '6px 12px' }}>Đã duyệt</button>
            <button className={`btn ${statusFilter === 'rejected' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('rejected')} style={{ fontSize: '12px', padding: '6px 12px' }}>Từ chối</button>
          </div>

          {/* Tìm kiếm */}
          <input 
            type="text" 
            placeholder="Tìm kiếm tin đăng..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', width: '240px', outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải bài viết...
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Lỗi tải dữ liệu: {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-news" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Không tìm thấy bài đăng nào phù hợp.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px' }}>Doanh nghiệp</th>
                  <th style={{ padding: '12px 16px', width: '30%' }}>Tiêu đề tin đăng</th>
                  <th style={{ padding: '12px 16px' }}>Phân loại</th>
                  <th style={{ padding: '12px 16px' }}>Nổi bật</th>
                  <th style={{ padding: '12px 16px' }}>Lượt xem</th>
                  <th style={{ padding: '12px 16px' }}>Ngày đăng</th>
                  <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.company_name || 'Hội viên ẩn danh'}</div>
                      <span className={`badge ${p.company_tier === 'Platinum' ? 'b-platinum' : p.company_tier === 'Gold' ? 'b-gold' : 'b-silver'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {p.company_tier}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px', textAlign: 'left' }}>
                        {p.summary}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{p.type || 'Nhu cầu'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.status === 'approved' ? (
                        <button 
                          onClick={() => handleToggleFeatured(p.id, p.is_featured === 1)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: p.is_featured === 1 ? '#F59E0B' : '#CBD5E1',
                            fontSize: '18px',
                            padding: 0
                          }}
                          title={p.is_featured === 1 ? "Bỏ ghim bài nổi bật" : "Ghim nổi bật (Tối đa 3 bài)"}
                        >
                          <i className={`ti ${p.is_featured === 1 ? 'ti-star-filled' : 'ti-star'}`}></i>
                        </button>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '11px' }}>Chờ duyệt</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}><i className="ti ti-eye"></i> {p.views || 0}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>
                      {new Date(p.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'}`}>
                        {p.status === 'approved' ? 'Đã duyệt' : p.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                      {p.status === 'rejected' && p.reject_reason && (
                        <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>Lý do: {p.reject_reason}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.status !== 'approved' && (
                          <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px' }}>Duyệt</button>
                        )}
                        {p.status !== 'rejected' && (
                          <button className="quick-btn quick-btn-reject" onClick={() => handleReject(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px' }}>Từ chối</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminPosts;
