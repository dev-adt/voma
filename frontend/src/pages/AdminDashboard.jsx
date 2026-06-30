import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  
  // States
  const [stats, setStats] = useState({
    members: { total: 0, approved: 0, pending: 0, rejected: 0 },
    posts: { total: 0, published: 0, pending: 0 },
    events: { upcoming: 0 }
  });
  
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data);
        }
      }
    } catch (e) {
      console.error("Error loading stats", e);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      // 1. Tải thành viên chờ duyệt
      const membersRes = await fetch('/api/members?status=pending', {
        headers: getAuthHeaders()
      });
      if (membersRes.ok) {
        const data = await membersRes.json();
        setPendingMembers(data.data || []);
      }

      // 2. Tải bài viết chờ duyệt
      const postsRes = await fetch('/api/posts?status=pending', {
        headers: getAuthHeaders()
      });
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPendingPosts(data.data || []);
      }
    } catch (e) {
      console.error("Error loading pending approvals", e);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/admin/recent-activity', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setActivities(data.data || []);
        }
      }
    } catch (e) {
      console.error("Error loading activities", e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadPendingApprovals(), loadActivities()]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleApproveMember = async (id, name) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt thành viên ${name}?`)) return;

    try {
      const res = await fetch(`/api/members/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert(`Đã phê duyệt thành viên ${name}`);
        loadStats();
        loadPendingApprovals();
        loadActivities();
      } else {
        const err = await res.json();
        alert(err.error || 'Duyệt thành viên thất bại.');
      }
    } catch (e) {
      alert('Có lỗi xảy ra: ' + e.message);
    }
  };

  const handleRejectMember = async (id, name) => {
    const reason = prompt(`Nhập lý do từ chối thành viên ${name}:`);
    if (reason === null) return;

    try {
      const res = await fetch(`/api/members/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert(`Đã từ chối thành viên ${name}`);
        loadStats();
        loadPendingApprovals();
        loadActivities();
      } else {
        const err = await res.json();
        alert(err.error || 'Từ chối thành viên thất bại.');
      }
    } catch (e) {
      alert('Có lỗi xảy ra: ' + e.message);
    }
  };

  const handleApprovePost = async (id, title) => {
    if (!confirm(`Duyệt đăng tin bài: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert(`Đã duyệt đăng tin bài`);
        loadStats();
        loadPendingApprovals();
        loadActivities();
      } else {
        const err = await res.json();
        alert(err.error || 'Duyệt bài đăng thất bại.');
      }
    } catch (e) {
      alert('Có lỗi xảy ra: ' + e.message);
    }
  };

  const handleRejectPost = async (id, title) => {
    const reason = prompt(`Lý do từ chối bài đăng "${title}":`);
    if (reason === null) return;

    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert(`Đã từ chối đăng tin bài`);
        loadStats();
        loadPendingApprovals();
        loadActivities();
      } else {
        const err = await res.json();
        alert(err.error || 'Từ chối bài đăng thất bại.');
      }
    } catch (e) {
      alert('Có lỗi xảy ra: ' + e.message);
    }
  };

  return (
    <AdminLayout title="Dashboard Quản trị">
      
      {/* STATS CARD ROW WITH SPARKLINES */}
      <div className="stats-row" style={{ textAlign: 'left' }}>
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-label">Tổng hội viên</div>
          <div className="stat-val">{stats.members.total}</div>
          <div className="stat-sub" style={{ color: 'var(--emerald)' }}><i className="ti ti-trending-up"></i> {stats.members.approved} đang hoạt động</div>
          <div className="db-sparkline">
            <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
              <path d="M 0,25 Q 15,5 30,22 T 60,10 T 80,18 T 100,6" fill="none" stroke="var(--primary)" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-label">Nhu cầu mới</div>
          <div className="stat-val">{stats.posts.total}</div>
          <div className="stat-sub" style={{ color: 'var(--emerald)' }}><i className="ti ti-trending-up"></i> {stats.posts.published} đã duyệt tin</div>
          <div className="db-sparkline">
            <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
              <path d="M 0,28 Q 20,10 40,25 T 70,5 T 100,12" fill="none" stroke="var(--emerald)" stroke-width="2"/>
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-label">Chờ duyệt</div>
          <div className="stat-val" style={{ color: 'var(--amber-dark)' }}>
            {Number(stats.members.pending || 0) + Number(stats.posts.pending || 0)}
          </div>
          <div className="stat-sub" style={{ color: 'var(--amber-dark)' }}>
            <i className="ti ti-alert-circle"></i> {stats.members.pending || 0} hội viên · {stats.posts.pending || 0} bài viết
          </div>
          <div className="db-sparkline">
            <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
              <path d="M 0,15 T 25,25 T 50,15 T 75,25 T 100,15" fill="none" stroke="var(--amber)" stroke-width="2"/>
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="stat-card">
          <div className="stat-label">Sự kiện tương lai</div>
          <div className="stat-val" style={{ color: '#8B5CF6' }}>{stats.events.upcoming}</div>
          <div className="stat-sub" style={{ color: '#8B5CF6' }}><i className="ti ti-calendar"></i> Sự kiện sắp diễn ra</div>
          <div className="db-sparkline">
            <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
              <path d="M 0,25 L 20,20 L 40,15 L 60,8 L 80,12 L 100,2" fill="none" stroke="#8B5CF6" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* MIDDLE TWO-COLUMN CONTENT GRID */}
      <div className="grid2" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        {/* Left: Recent Activity Timeline */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ marginBlockStart: 0 }}><i className="ti ti-timeline"></i> Hoạt động gần đây (Recent Activity)</div>
          </div>
          <div className="card-body">
            <div className="db-activity-timeline">
              {activities.length === 0 ? (
                <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '12px' }}>Không có hoạt động nào gần đây.</div>
              ) : (
                activities.map((act, index) => {
                  const isPost = act.type === 'post';
                  const dateLabel = new Date(act.created_at).toLocaleDateString('vi-VN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div className={`db-activity-item ${isPost ? 'post' : ''}`} key={index}>
                      <div className="db-activity-time">{dateLabel}</div>
                      <div className="db-activity-text">
                        {isPost ? (
                          <>Tin giao thương mới: <strong>"{act.title}"</strong> vừa được đăng tải.</>
                        ) : (
                          <>Doanh nghiệp <strong>{act.title}</strong> vừa đăng ký gia nhập hệ thống.</>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Pending Approvals Quick view */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ marginBlockStart: 0 }}><i className="ti ti-clipboard-check"></i> Duyệt nhanh (Pending Approvals)</div>
          </div>
          <div className="card-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {pendingMembers.length === 0 && pendingPosts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light-muted)', fontSize: '12.5px' }}>
                <i className="ti ti-circle-check" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px', color: 'var(--emerald)' }}></i>
                Mọi hồ sơ và bài đăng đã được giải quyết sạch!
              </div>
            ) : (
              <div>
                {/* 1. Members waiting */}
                {pendingMembers.map(m => (
                  <div className="quick-approve-item" key={`m-${m.id}`}>
                    <div className="quick-approve-info">
                      <div className="quick-approve-title">{m.name}</div>
                      <div className="quick-approve-sub">Hội viên mới · Lĩnh vực {m.industry}</div>
                    </div>
                    <div className="quick-approve-actions">
                      <button className="quick-btn quick-btn-approve" onClick={() => handleApproveMember(m.id, m.name)}>Duyệt</button>
                      <button className="quick-btn quick-btn-reject" onClick={() => handleRejectMember(m.id, m.name)}>Từ chối</button>
                    </div>
                  </div>
                ))}

                {/* 2. Posts waiting */}
                {pendingPosts.map(p => (
                  <div className="quick-approve-item" key={`p-${p.id}`}>
                    <div className="quick-approve-info">
                      <div className="quick-approve-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {p.title}
                      </div>
                      <div className="quick-approve-sub">Nhu cầu: {p.type}</div>
                    </div>
                    <div className="quick-approve-actions">
                      <button className="quick-btn quick-btn-approve" onClick={() => handleApprovePost(p.id, p.title)}>Duyệt</button>
                      <button className="quick-btn quick-btn-reject" onClick={() => handleRejectPost(p.id, p.title)}>Từ chối</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
};
export default AdminDashboard;
