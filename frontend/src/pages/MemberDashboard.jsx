import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export const MemberDashboard = () => {
  const { user, token, getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [profileData, setProfileData] = useState({
    name: '', tax_code: '', license: '', industry: '', size: '', address: '',
    website: '', social: '', description: '', contact_name: '', contact_pos: '',
    phone: '', goal: '', password: '',
    status: '', tier: ''
  });
  
  const [dbStats, setDbStats] = useState({
    total_posts: 0,
    approved_posts: 0,
    pending_posts: 0,
    total_views: 0
  });

  const [memberPosts, setMemberPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal State for new Post
  const [modalOpen, setModalOpen] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '', summary: '', body: '', type: 'Tìm kiếm đối tác',
    category: '', tags: '', contact_info: '', deadline: '',
    image_url: ''
  });
  const [creatingPost, setCreatingPost] = useState(false);

  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/member/dashboard', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const m = data.member;
          setProfileData({
            name: m.name || '',
            tax_code: m.tax_code || '',
            license: m.license || '',
            industry: m.industry || '',
            size: m.size || '',
            address: m.address || '',
            website: m.website || '',
            social: m.social || '',
            description: m.description || '',
            contact_name: m.contact_name || '',
            contact_pos: m.contact_pos || '',
            phone: m.phone || '',
            goal: m.goal || '',
            password: '',
            status: m.status || 'pending',
            tier: m.tier || 'Silver'
          });
          setDbStats(data.stats);
          setMemberPosts(data.posts || []);
        }
      }
    } catch (e) {
      console.error("Error loading member dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại.');
      }
      setMessage({ text: 'Đã cập nhật thông tin doanh nghiệp thành công!', type: 'success' });
      // Clear password input
      setProfileData(prev => ({ ...prev, password: '' }));
      loadDashboardData();
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleNewPostChange = (e) => {
    const { id, value } = e.target;
    setNewPostData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Vui lòng chọn file ảnh nhỏ hơn 2MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNewPostData(prev => ({ ...prev, image_url: data.url }));
        } else {
          alert(data.error || 'Tải tệp ảnh thất bại.');
        }
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + err.message);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditPost = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const p = data.data;
          let parsedTags = '';
          if (p.tags) {
            try {
              const tagsArray = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags;
              parsedTags = Array.isArray(tagsArray) ? tagsArray.join(', ') : '';
            } catch (err) {
              parsedTags = '';
            }
          }
          let formattedDeadline = '';
          if (p.deadline) {
            formattedDeadline = new Date(p.deadline).toISOString().substring(0, 10);
          }
          setNewPostData({
            title: p.title || '',
            summary: p.summary || '',
            body: p.body || '',
            type: p.type || 'Tìm kiếm đối tác',
            category: p.category || '',
            tags: parsedTags,
            contact_info: p.contact_info || '',
            deadline: formattedDeadline,
            image_url: p.image_url || ''
          });
          setEditingPostId(id);
          setModalOpen(true);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Không thể tải chi tiết bài viết.');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleSubmitAction = async (isDraft) => {
    if (!newPostData.title) {
      alert('Vui lòng nhập tiêu đề bài đăng');
      return;
    }
    if (!newPostData.body) {
      alert('Vui lòng nhập nội dung chi tiết bài đăng');
      return;
    }
    if (!newPostData.contact_info) {
      alert('Vui lòng cung cấp thông tin liên hệ trực tiếp');
      return;
    }

    setCreatingPost(true);
    try {
      const tagsArray = newPostData.tags 
        ? newPostData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const payload = {
        ...newPostData,
        tags: tagsArray,
        isDraft
      };

      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Giao dịch không thành công.');
      }

      alert(isDraft ? 'Đã lưu bản nháp thành công!' : 'Đã đăng tin thành công! Tin đăng đang chờ Admin duyệt.');
      setModalOpen(false);
      setEditingPostId(null);
      setNewPostData({
        title: '', summary: '', body: '', type: 'Tìm kiếm đối tác',
        category: '', tags: '', contact_info: '', deadline: '', image_url: ''
      });
      loadDashboardData();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setCreatingPost(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', marginBottom: '12px', color: '#1E88E5' }}></i>
        <div style={{ fontSize: '13px', color: '#64748B' }}>Đang tải dữ liệu Dashboard...</div>
      </div>
    );
  }

  const userStatus = profileData.status || user?.status || 'pending';
  const userTier = profileData.tier || user?.tier || 'Silver';

  return (
    <div className="public-body">
      <Navbar />

      <div className="dashboard-wrap">
        
        {/* Top Header Banner */}
        <div style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
          <div className="public-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Dashboard Hội viên
                </h1>
                <span className={`badge ${userTier === 'Platinum' ? 'b-platinum' : userTier === 'Gold' ? 'b-gold' : 'b-silver'}`}>
                  {userTier === 'Platinum' ? '💎 Platinum' : userTier === 'Gold' ? '🏅 Gold' : '🪙 Silver'}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Quản trị tài khoản doanh nghiệp thành viên <strong>{profileData.name}</strong>
              </p>
            </div>
            
            <button 
              onClick={() => {
                setEditingPostId(null);
                setNewPostData({
                  title: '', summary: '', body: '', type: 'Tìm kiếm đối tác',
                  category: '', tags: '', contact_info: '', deadline: '', image_url: ''
                });
                setModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              disabled={userStatus !== 'approved'}
              title={userStatus !== 'approved' ? 'Tài khoản chưa được duyệt, không thể đăng tin bài.' : ''}
            >
              <i className="ti ti-plus"></i> Đăng tin giao thương mới
            </button>
          </div>
        </div>

        <div className="dash-container" style={{ textAlign: 'left' }}>
          {/* Left Column: Edit profile */}
          <div>
            {userStatus === 'pending' && (
              <div className="status-banner pending">
                <i className="ti ti-clock status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Tài khoản đang chờ duyệt</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Hồ sơ doanh nghiệp đang được admin kiểm tra. Các chức năng đăng bài và AI Chat sẽ hoạt động sau khi được phê duyệt.</div>
                </div>
              </div>
            )}

            {userStatus === 'approved' && (
              <div className="status-banner approved">
                <i className="ti ti-circle-check status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Hội viên chính thức</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Tài khoản của bạn đã được phê duyệt. Bạn đã được cấp toàn quyền giao dịch và sử dụng Trợ lý AI.</div>
                </div>
              </div>
            )}

            {userStatus === 'rejected' && (
              <div className="status-banner rejected">
                <i className="ti ti-circle-x status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Hồ sơ bị từ chối</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Doanh nghiệp chưa đạt yêu cầu kiểm duyệt. Vui lòng cập nhật lại hồ sơ chi tiết.</div>
                </div>
              </div>
            )}

            <div className="dash-card">
              <div className="card-title">
                <i className="ti ti-edit"></i> Cập nhật hồ sơ doanh nghiệp
              </div>

              {message.text && (
                <div style={{ 
                  background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                  border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, 
                  color: message.type === 'success' ? '#A7F3D0' : '#FCA5A5',
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px'
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="fg">
                    <label>Tên Doanh nghiệp</label>
                    <input type="text" id="name" value={profileData.name} onChange={handleProfileChange} required />
                  </div>
                  <div className="fg">
                    <label>Mã số thuế</label>
                    <input type="text" id="tax_code" value={profileData.tax_code} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Giấy phép KD</label>
                    <input type="text" id="license" value={profileData.license} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Ngành nghề</label>
                    <input type="text" id="industry" value={profileData.industry} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Quy mô nhân sự</label>
                    <input type="text" id="size" value={profileData.size} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Website</label>
                    <input type="text" id="website" value={profileData.website} onChange={handleProfileChange} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2' }}>
                    <label>Địa chỉ</label>
                    <input type="text" id="address" value={profileData.address} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Mạng xã hội (Fanpage / LinkedIn)</label>
                    <input type="text" id="social" value={profileData.social} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Tên người liên hệ</label>
                    <input type="text" id="contact_name" value={profileData.contact_name} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Chức vụ người liên hệ</label>
                    <input type="text" id="contact_pos" value={profileData.contact_pos} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>Số điện thoại</label>
                    <input type="text" id="phone" value={profileData.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2' }}>
                    <label>Mục tiêu tham gia</label>
                    <input type="text" id="goal" value={profileData.goal} onChange={handleProfileChange} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2' }}>
                    <label>Mô tả ngắn hoạt động</label>
                    <textarea id="description" value={profileData.description} onChange={handleProfileChange} style={{ height: '80px', resize: 'vertical' }} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <label style={{ color: 'var(--amber)' }}>Thiết lập lại Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                    <input type="password" id="password" value={profileData.password} onChange={handleProfileChange} placeholder="Mật khẩu tối thiểu 8 ký tự..." />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                    {updatingProfile ? <><i className="ti ti-loader animate-spin"></i> Đang lưu...</> : <><i className="ti ti-save"></i> Lưu hồ sơ</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Statistics & opportunities list */}
          <div>
            <div className="dash-card" style={{ padding: '1.25rem' }}>
              <div className="card-title" style={{ marginBottom: '1rem' }}>
                <i className="ti ti-chart-bar"></i> Thống kê tin đăng
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-val">{dbStats.total_posts}</div>
                  <div className="stat-lbl">Tin bài</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">{dbStats.approved_posts}</div>
                  <div className="stat-lbl">Đã duyệt</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">{dbStats.total_views}</div>
                  <div className="stat-lbl">Lượt xem</div>
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="card-title">
                <i className="ti ti-list-details"></i> Tin bài đã đăng của bạn
              </div>

              {memberPosts.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Bạn chưa đăng tin bài cơ hội giao thương nào.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {memberPosts.map(p => (
                    <div className="post-item" key={p.id}>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{p.type}</span>
                          <span>·</span>
                          <span><i className="ti ti-eye"></i> {p.views || 0}</span>
                          <span>·</span>
                          <button 
                            onClick={() => handleStartEditPost(p.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', outline: 'none' }}
                          >
                            <i className="ti ti-edit"></i> Sửa
                          </button>
                        </div>
                      </div>
                      <span className={`badge ${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : p.status === 'draft' ? 'draft' : 'pending'}`}>
                        {p.status === 'approved' ? 'Đã duyệt' : p.status === 'rejected' ? 'Từ chối' : p.status === 'draft' ? 'Bản nháp' : 'Chờ duyệt'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal đăng cơ hội giao thương mới */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderColor: 'var(--border-strong)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-plus" style={{ color: 'var(--neon-cyan)' }}></i> Đăng tin cơ hội giao thương mới
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
                <div className="fg">
                  <label>Tiêu đề bài đăng <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input type="text" id="title" value={newPostData.title} onChange={handleNewPostChange} placeholder="Ví dụ: Cần tìm nhà cung cấp hạt điều xuất khẩu..." required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="fg">
                    <label>Loại tin bài</label>
                    <select id="type" value={newPostData.type} onChange={handleNewPostChange}>
                      <option value="Tìm kiếm đối tác">Tìm kiếm đối tác</option>
                      <option value="Cần mua / Cần bán">Cần mua / Cần bán</option>
                      <option value="Thông báo sự kiện">Thông báo sự kiện</option>
                      <option value="Tuyển dụng">Tuyển dụng</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Danh mục ngành</label>
                    <input type="text" id="category" value={newPostData.category} onChange={handleNewPostChange} placeholder="Ví dụ: Nông nghiệp, CNTT..." />
                  </div>
                </div>

                <div className="fg">
                  <label>Tags từ khoá (phân tách bằng dấu phẩy)</label>
                  <input type="text" id="tags" value={newPostData.tags} onChange={handleNewPostChange} placeholder="Ví dụ: nông sản, xuất khẩu, b2b" />
                </div>

                <div className="fg">
                  <label>Tóm tắt bài đăng</label>
                  <input type="text" id="summary" value={newPostData.summary} onChange={handleNewPostChange} placeholder="Tóm tắt ngắn gọn nhu cầu trong 1-2 câu..." />
                </div>

                <div className="fg">
                  <label>Nội dung chi tiết cơ hội giao thương <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <textarea id="body" value={newPostData.body} onChange={handleNewPostChange} placeholder="Mô tả chi tiết sản phẩm, dịch vụ, tiêu chí đối tác cần tìm kiếm..." style={{ height: '100px', resize: 'vertical' }} required />
                </div>

                <div className="fg">
                  <label>Thông tin liên hệ trực tiếp <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input type="text" id="contact_info" value={newPostData.contact_info} onChange={handleNewPostChange} placeholder="Ví dụ: email@vinatech.vn | 0901 111 222 (Mr. Đức)" required />
                </div>

                <div className="fg">
                  <label>Hạn liên hệ (Hạn đăng bài)</label>
                  <input type="date" id="deadline" value={newPostData.deadline} onChange={handleNewPostChange} />
                </div>

                <div className="fg">
                  <label>Ảnh minh họa</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      id="image_url" 
                      value={newPostData.image_url} 
                      onChange={handleNewPostChange} 
                      placeholder="Dán link ảnh hoặc chọn tệp tải lên..." 
                      style={{ flex: 1 }} 
                    />
                    <label 
                      className="btn" 
                      style={{ 
                        fontSize: '11px', 
                        padding: '9px 12px', 
                        cursor: 'pointer', 
                        margin: 0, 
                        flexShrink: 0,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#FFF'
                      }}
                    >
                      <i className="ti ti-upload"></i> Chọn tệp
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                  {uploadingImage && <div style={{ fontSize: '11px', color: 'var(--primary-light)', marginTop: '2px' }}><i className="ti ti-loader animate-spin"></i> Đang tải ảnh lên...</div>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitAction(true)} 
                  className="btn" 
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                  disabled={creatingPost || uploadingImage}
                >
                  Lưu nháp
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitAction(false)} 
                  className="btn btn-primary" 
                  disabled={creatingPost || uploadingImage}
                >
                  {creatingPost ? <><i className="ti ti-loader animate-spin"></i> Đang gửi...</> : (editingPostId ? <><i className="ti ti-save"></i> Cập nhật & Đăng</> : <><i className="ti ti-plus"></i> Đăng tin</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MemberDashboard;
