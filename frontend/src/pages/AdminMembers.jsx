import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminMembers = () => {
  const { getAuthHeaders } = useAuth();
  
  // States
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Gọi API tải tất cả hội viên (không truyền status lọc trên API để tự lọc ở frontend hoặc gọi tùy trạng thái)
      // Để tiện lợi và đồng bộ, ta gọi API không lọc status (hoặc lọc theo statusFilter nếu statusFilter !== 'all')
      const statusParam = statusFilter !== 'all' ? `status=${statusFilter}` : '';
      const queryParam = [statusParam].filter(Boolean).join('&');
      
      const res = await fetch(`/api/members?${queryParam}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Không thể tải danh sách hội viên');
      const data = await res.json();
      setMembers(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [statusFilter]);

  const handleApprove = async (id, name) => {
    if (!confirm(`Duyệt hội viên chính thức: "${name}"?`)) return;

    try {
      const res = await fetch(`/api/members/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã phê duyệt hội viên thành công!');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleReject = async (id, name) => {
    const reason = prompt(`Nhập lý do từ chối hội viên "${name}":`);
    if (reason === null) return; // Hủy bấm prompt

    try {
      const res = await fetch(`/api/members/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert('Đã từ chối hội viên.');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleApproveUpgrade = async (id, name, newTier) => {
    if (!confirm(`Duyệt nâng cấp gói hội viên cho "${name}" lên gói ${newTier}?`)) return;

    try {
      const res = await fetch(`/api/admin/members/${id}/approve-upgrade`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã phê duyệt nâng cấp gói thành công!');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleRejectUpgrade = async (id, name) => {
    if (!confirm(`Từ chối yêu cầu nâng cấp gói của "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/members/${id}/reject-upgrade`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã từ chối nâng cấp gói.');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleLock = async (id, name) => {
    if (!confirm(`Tạm khóa tài khoản hội viên: "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/members/${id}/lock`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã tạm khóa tài khoản thành công!');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleUnlock = async (id, name) => {
    if (!confirm(`Mở khóa tài khoản hội viên: "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/members/${id}/unlock`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã mở khóa tài khoản thành công!');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản hội viên "${name}" cùng toàn bộ bài viết và lịch sử của họ? Thao tác này không thể hoàn tác!`)) return;

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã xóa vĩnh viễn hội viên thành công!');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id, isCurrentlyFeatured, name) => {
    try {
      const targetState = isCurrentlyFeatured ? 0 : 1;
      const res = await fetch(`/api/admin/members/${id}/featured`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_featured: targetState })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Thao tác không thành công.');
        return;
      }
      alert(targetState ? `Đã ghim hội viên "${name}" nổi bật.` : `Đã bỏ ghim hội viên "${name}".`);
      loadMembers();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
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

  // Lọc thêm theo tìm kiếm
  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || 
           (m.industry && m.industry.toLowerCase().includes(q)) || 
           (m.email && m.email.toLowerCase().includes(q));
  });

  return (
    <AdminLayout title="Duyệt Hội Viên">
      <div className="card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          {/* Tabs bộ lọc */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('all')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tất cả</button>
            <button className={`btn ${statusFilter === 'pending' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('pending')} style={{ fontSize: '12px', padding: '6px 12px' }}>Chờ duyệt</button>
            <button className={`btn ${statusFilter === 'approved' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('approved')} style={{ fontSize: '12px', padding: '6px 12px' }}>Đã duyệt</button>
            <button className={`btn ${statusFilter === 'suspended' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('suspended')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tạm khóa</button>
            <button className={`btn ${statusFilter === 'rejected' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('rejected')} style={{ fontSize: '12px', padding: '6px 12px' }}>Từ chối</button>
          </div>

          {/* Ô tìm kiếm */}
          <input 
            type="text" 
            placeholder="Tìm kiếm doanh nghiệp..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', width: '240px', outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách hội viên...
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Lỗi tải dữ liệu: {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-users" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Không có hội viên nào phù hợp bộ lọc.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px' }}>Doanh nghiệp</th>
                  <th style={{ padding: '12px 16px' }}>Mã số thuế</th>
                  <th style={{ padding: '12px 16px' }}>Người đại diện</th>
                  <th style={{ padding: '12px 16px' }}>Ngành nghề</th>
                  <th style={{ padding: '12px 16px' }}>Phân hạng</th>
                  <th style={{ padding: '12px 16px' }}>Nổi bật</th>
                  <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const colors = getInitialsColors(m.name);
                  const initials = m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="av-circle" style={{ background: colors.bg, color: colors.fg, width: '32px', height: '32px', fontSize: '11px', fontWeight: 600 }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{m.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>Đăng ký ngày {new Date(m.created_at).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{m.tax_code || 'Chưa cập nhật'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '500' }}>{m.contact_name}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>{m.phone} | {m.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <div>{m.industry || 'Chưa chọn'}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>Quy mô: {m.size}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver'}`}>
                          {m.tier === 'Platinum' ? '💎 Platinum' : m.tier === 'Gold' ? '🏅 Gold' : '🪙 Silver'}
                        </span>
                        {m.tier_expires_at && m.tier !== 'Silver' && (
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                            Hạn: {new Date(m.tier_expires_at).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                        {m.pending_tier_upgrade && (
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px dashed var(--amber)', padding: '6px', borderRadius: '4px', background: 'rgba(245,158,11,0.05)', maxWidth: '130px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: '600' }}>
                              <i className="ti ti-arrow-big-up-lines"></i> Lên {m.pending_tier_upgrade === 'Platinum' ? '💎 Plat' : '🏅 Gold'}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                              <button 
                                className="quick-btn quick-btn-approve" 
                                onClick={() => handleApproveUpgrade(m.id, m.name, m.pending_tier_upgrade)}
                                style={{ padding: '2px 6px', fontSize: '10px', width: '48px', cursor: 'pointer' }}
                              >
                                Duyệt
                              </button>
                              <button 
                                className="quick-btn quick-btn-reject" 
                                onClick={() => handleRejectUpgrade(m.id, m.name)}
                                style={{ padding: '2px 6px', fontSize: '10px', width: '48px', cursor: 'pointer' }}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {m.status === 'approved' ? (
                          <button 
                            onClick={() => handleToggleFeatured(m.id, m.is_featured === 1, m.name)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: m.is_featured === 1 ? '#F59E0B' : '#CBD5E1',
                              cursor: 'pointer',
                              fontSize: '16px',
                              outline: 'none',
                              padding: 0
                            }}
                            title={m.is_featured === 1 ? "Bỏ ghim nổi bật" : "Ghim nổi bật (Tối đa 3 hội viên)"}
                          >
                            <i className={m.is_featured === 1 ? "ti ti-star-filled" : "ti ti-star"}></i>
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '11px' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${m.status === 'approved' ? 'approved' : (m.status === 'rejected' || m.status === 'suspended') ? 'rejected' : 'pending'}`}>
                          {m.status === 'approved' ? 'Đã duyệt' : m.status === 'rejected' ? 'Từ chối' : m.status === 'suspended' ? 'Tạm khóa' : 'Chờ duyệt'}
                        </span>
                        {m.status === 'rejected' && m.reject_reason && (
                          <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>Lý do: {m.reject_reason}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {m.status === 'pending' && (
                            <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Duyệt</button>
                          )}
                          {m.status === 'rejected' && (
                            <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Duyệt lại</button>
                          )}
                          {m.status === 'approved' && (
                            <button className="quick-btn" onClick={() => handleLock(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', background: '#F59E0B', color: '#fff', border: '1px solid #F59E0B', borderRadius: '4px', cursor: 'pointer' }}>Khóa</button>
                          )}
                          {m.status === 'suspended' && (
                            <button className="quick-btn quick-btn-approve" onClick={() => handleUnlock(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Mở khóa</button>
                          )}
                          {m.status === 'pending' && (
                            <button className="quick-btn quick-btn-reject" onClick={() => handleReject(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Từ chối</button>
                          )}
                          <button className="quick-btn" onClick={() => handleDelete(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', background: '#EF4444', color: '#fff', border: '1px solid #EF4444', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminMembers;
