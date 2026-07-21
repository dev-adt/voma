import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import { useTranslation } from '../contexts/LanguageContext';

export const MemberDashboard = () => {
  const { user, token, getAuthHeaders, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [profileData, setProfileData] = useState({
    name: '', tax_code: '', license: '', industry: '', size: '', address: '', city: '',
    website: '', social: '', description: '', contact_name: '', contact_pos: '',
    phone: '', goal: '', password: '',
    status: '', tier: '', tier_expires_at: null, pending_tier_upgrade: null
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
    image_url: '', featured_requested: 0
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
            city: m.city || '',
            website: m.website || '',
            social: m.social || '',
            description: m.description || '',
            contact_name: m.contact_name || '',
            contact_pos: m.contact_pos || '',
            phone: m.phone || '',
            goal: m.goal || '',
            password: '',
            status: m.status || 'pending',
            tier: m.tier || 'Silver',
            tier_expires_at: m.tier_expires_at || null,
            pending_tier_upgrade: m.pending_tier_upgrade || null
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
        throw new Error(data.error || t('error_occurred'));
      }
      setMessage({ text: t('profile_update_success'), type: 'success' });
      // Clear password input
      setProfileData(prev => ({ ...prev, password: '' }));
      loadDashboardData();
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleRequestUpgrade = async (targetTier) => {
    if (!confirm(t('upgrade_confirm_msg')(targetTier))) return;

    try {
      const res = await fetch('/api/member/upgrade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tier: targetTier })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(t('upgrade_request_success'));
        loadDashboardData();
      } else {
        alert(data.error || t('upgrade_request_fail'));
      }
    } catch (err) {
      alert(t('error_occurred') + ': ' + err.message);
    }
  };

  const handleDeletePost = async (id, title) => {
    if (!confirm(t('delete_post_confirm')(title))) return;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert(t('delete_post_success'));
        loadDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || t('error_occurred'));
      }
    } catch (err) {
      alert(t('error_occurred') + ': ' + err.message);
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
      alert(t('err_image_size'));
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
          alert(data.error || t('error_occurred'));
        }
      } catch (err) {
        alert(t('error_occurred') + ': ' + err.message);
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
            type: p.type || t('type_find_partner'),
            category: p.category || '',
            tags: parsedTags,
            contact_info: p.contact_info || '',
            deadline: formattedDeadline,
            image_url: p.image_url || '',
            featured_requested: p.featured_requested || 0
          });
          setEditingPostId(id);
          setModalOpen(true);
        }
      } else {
        const err = await res.json();
        alert(err.error || t('error_load_post'));
      }
    } catch (e) {
      alert(t('error_occurred') + ': ' + e.message);
    }
  };

  const handleSubmitAction = async (isDraft) => {
    if (!newPostData.title) {
      alert(t('alert_enter_title'));
      return;
    }
    if (!newPostData.body) {
      alert(t('alert_enter_body'));
      return;
    }
    if (!newPostData.contact_info) {
      alert(t('alert_enter_contact'));
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
        throw new Error(data.error || t('error_occurred'));
      }

      alert(isDraft ? t('save_draft_success') : t('publish_post_success'));
      setModalOpen(false);
      setEditingPostId(null);
      setNewPostData({
        title: '', summary: '', body: '', type: t('type_find_partner'),
        category: '', tags: '', contact_info: '', deadline: '', image_url: '',
        featured_requested: 0
      });
      loadDashboardData();
    } catch (err) {
      alert(t('error_occurred') + ': ' + err.message);
    } finally {
      setCreatingPost(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', marginBottom: '12px', color: 'var(--primary-light)' }}></i>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Đang tải dữ liệu Dashboard...</div>
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
        <div style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
          <div className="public-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {t('dashboard_title')}
                </h1>
                <span className={`badge ${userTier === 'Platinum' ? 'b-platinum' : userTier === 'Gold' ? 'b-gold' : 'b-silver'}`} style={{ marginRight: '8px' }}>
                  {userTier === 'Platinum' ? '💎 ' + t('tier_platinum') : userTier === 'Gold' ? '🏅 ' + t('tier_gold') : '🪙 ' + t('tier_silver')}
                </span>
                {profileData.tier_expires_at && userTier !== 'Silver' && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <i className="ti ti-calendar-event"></i> {t('tier_expiry_label')}: {new Date(profileData.tier_expires_at).toLocaleDateString('vi-VN')}
                  </span>
                )}
                {profileData.pending_tier_upgrade && (
                  <span style={{ fontSize: '11px', color: 'var(--amber)', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px dashed rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <i className="ti ti-loader animate-spin" style={{ fontSize: '10px' }}></i> {t('pending_upgrade_status')(profileData.pending_tier_upgrade)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {t('manage_account_desc')(profileData.name)}
              </p>
            </div>
            
            <button 
              onClick={() => {
                setEditingPostId(null);
                setNewPostData({
                  title: '', summary: '', body: '', type: t('type_find_partner'),
                  category: '', tags: '', contact_info: '', deadline: '', image_url: ''
                });
                setModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              disabled={userStatus !== 'approved'}
              title={userStatus !== 'approved' ? 'Tài khoản chưa được duyệt, không thể đăng tin bài.' : ''}
            >
              <i className="ti ti-plus"></i> {t('btn_create_new_post')}
            </button>
          </div>
        </div>

        <div className="dash-container" style={{ textAlign: 'left' }}>
          {/* Left Column: Edit profile */}
          <div style={{ minWidth: 0 }}>
            {userStatus === 'pending' && (
              <div className="status-banner pending">
                <i className="ti ti-clock status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{t('pending_account_status_title')}</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>{t('pending_account_status_desc')}</div>
                </div>
              </div>
            )}

            {userStatus === 'approved' && (
              <div className="status-banner approved">
                <i className="ti ti-circle-check status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{t('approved_account_status_title')}</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>{t('approved_account_status_desc')}</div>
                </div>
              </div>
            )}

            {userStatus === 'rejected' && (
              <div className="status-banner rejected">
                <i className="ti ti-circle-x status-icon"></i>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{t('rejected_account_status_title')}</div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>{t('rejected_account_status_desc')}</div>
                </div>
              </div>
            )}

            <div className="dash-card">
              <div className="card-title">
                <i className="ti ti-edit"></i> {t('update_profile_title')}
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
                    <label>{t('label_company_name')}</label>
                    <input type="text" id="name" value={profileData.name} onChange={handleProfileChange} required />
                  </div>
                  <div className="fg">
                    <label>{t('label_tax_code')}</label>
                    <input type="text" id="tax_code" value={profileData.tax_code} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_business_license')}</label>
                    <input type="text" id="license" value={profileData.license} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_industry')}</label>
                    <input type="text" id="industry" value={profileData.industry} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_employee_scale')}</label>
                    <input type="text" id="size" value={profileData.size} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_website')}</label>
                    <input type="text" id="website" value={profileData.website} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_address')}</label>
                    <input type="text" id="address" value={profileData.address} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_city')}</label>
                    <input type="text" id="city" list="cities-list" value={profileData.city || ''} onChange={handleProfileChange} placeholder={t('label_city')} />
                    <datalist id="cities-list">
                      <option value="An Giang" />
                      <option value="Bà Rịa - Vũng Tàu" />
                      <option value="Bắc Giang" />
                      <option value="Bắc Kạn" />
                      <option value="Bạc Liêu" />
                      <option value="Bắc Ninh" />
                      <option value="Bến Tre" />
                      <option value="Bình Định" />
                      <option value="Bình Dương" />
                      <option value="Bình Phước" />
                      <option value="Bình Thuận" />
                      <option value="Cà Mau" />
                      <option value="Cần Thơ" />
                      <option value="Cao Bằng" />
                      <option value="Đà Nẵng" />
                      <option value="Đắk Lắk" />
                      <option value="Đắk Nông" />
                      <option value="Điện Biên" />
                      <option value="Đồng Nai" />
                      <option value="Đồng Tháp" />
                      <option value="Gia Lai" />
                      <option value="Hà Giang" />
                      <option value="Hà Nam" />
                      <option value="Hà Nội" />
                      <option value="Hà Tĩnh" />
                      <option value="Hải Dương" />
                      <option value="Hải Phòng" />
                      <option value="Hậu Giang" />
                      <option value="Hòa Bình" />
                      <option value="Hưng Yên" />
                      <option value="Khánh Hòa" />
                      <option value="Kiên Giang" />
                      <option value="Kon Tum" />
                      <option value="Lai Châu" />
                      <option value="Lâm Đồng" />
                      <option value="Lạng Sơn" />
                      <option value="Lào Cai" />
                      <option value="Long An" />
                      <option value="Nam Định" />
                      <option value="Nghệ An" />
                      <option value="Ninh Bình" />
                      <option value="Ninh Thuận" />
                      <option value="Phú Thọ" />
                      <option value="Phú Yên" />
                      <option value="Quảng Bình" />
                      <option value="Quảng Nam" />
                      <option value="Quảng Ngãi" />
                      <option value="Quảng Ninh" />
                      <option value="Quảng Trị" />
                      <option value="Sóc Trăng" />
                      <option value="Sơn La" />
                      <option value="Tây Ninh" />
                      <option value="Thái Bình" />
                      <option value="Thái Nguyên" />
                      <option value="Thanh Hóa" />
                      <option value="Thừa Thiên Huế" />
                      <option value="Tiền Giang" />
                      <option value="TP Hồ Chí Minh" />
                      <option value="Trà Vinh" />
                      <option value="Tuyên Quang" />
                      <option value="Vĩnh Long" />
                      <option value="Vĩnh Phúc" />
                      <option value="Yên Bái" />
                    </datalist>
                  </div>
                  <div className="fg">
                    <label>{t('label_social_media')}</label>
                    <input type="text" id="social" value={profileData.social} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_contact_person')}</label>
                    <input type="text" id="contact_name" value={profileData.contact_name} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_contact_position')}</label>
                    <input type="text" id="contact_pos" value={profileData.contact_pos} onChange={handleProfileChange} />
                  </div>
                  <div className="fg">
                    <label>{t('label_phone_number')}</label>
                    <input type="text" id="phone" value={profileData.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2' }}>
                    <label>{t('label_joining_goal')}</label>
                    <input type="text" id="goal" value={profileData.goal} onChange={handleProfileChange} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2' }}>
                    <label>{t('label_short_description')}</label>
                    <textarea id="description" value={profileData.description} onChange={handleProfileChange} style={{ height: '80px', resize: 'vertical' }} />
                  </div>
                  <div className="fg" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <label style={{ color: 'var(--amber)' }}>{t('label_reset_password_desc')}</label>
                    <input type="password" id="password" value={profileData.password} onChange={handleProfileChange} placeholder={t('placeholder_password_min_8')} />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                    {updatingProfile ? <><i className="ti ti-loader animate-spin"></i> {t('btn_saving')}</> : <><i className="ti ti-save"></i> {t('btn_save_profile')}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Statistics & opportunities list */}
          <div style={{ minWidth: 0 }}>
            {userTier !== 'Platinum' && (
              <div className="dash-card" style={{ padding: '1.25rem', border: '1px solid rgba(245,158,11,0.2)', background: 'linear-gradient(to bottom, rgba(245,158,11,0.02), rgba(0,0,0,0))', marginBottom: '1rem' }}>
                <div className="card-title" style={{ color: 'var(--amber)', marginBottom: '0.75rem' }}>
                  <i className="ti ti-arrow-big-up-lines"></i> {t('upgrade_tier_title')}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                  {t('upgrade_tier_desc')}
                </p>
                {profileData.pending_tier_upgrade ? (
                  <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11.5px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-clock"></i> {t('upgrade_request_pending_prefix')}: {profileData.pending_tier_upgrade === 'Platinum' ? '💎 ' + t('tier_platinum') : '🏅 ' + t('tier_gold')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {userTier === 'Silver' && (
                      <button 
                        onClick={() => handleRequestUpgrade('Gold')}
                        className="btn" 
                        style={{ flex: 1, fontSize: '11.5px', padding: '6px 10px', background: 'var(--amber)', borderColor: 'var(--amber)', color: '#000', fontWeight: 600 }}
                      >
                        🏅 {t('btn_upgrade_gold')}
                      </button>
                    )}
                    <button 
                      onClick={() => handleRequestUpgrade('Platinum')}
                      className="btn btn-primary" 
                      style={{ flex: 1, fontSize: '11.5px', padding: '6px 10px', fontWeight: 600 }}
                    >
                      💎 {t('btn_upgrade_platinum')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="dash-card" style={{ padding: '1.25rem' }}>
              <div className="card-title" style={{ marginBottom: '1rem' }}>
                <i className="ti ti-chart-bar"></i> {t('posts_stats_title')}
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-val">{dbStats.total_posts}</div>
                  <div className="stat-lbl">{t('stat_total_posts')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">{dbStats.approved_posts}</div>
                  <div className="stat-lbl">{t('stat_approved_posts')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">{dbStats.total_views}</div>
                  <div className="stat-lbl">{t('stat_total_views')}</div>
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="card-title">
                <i className="ti ti-list-details"></i> {t('my_published_posts_title')}
              </div>

              {memberPosts.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {t('no_posts_published')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {memberPosts.map(p => (
                    <div className="post-item" key={p.id}>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{p.type}</span>
                          <span>·</span>
                          <span><i className="ti ti-eye"></i> {p.views || 0}</span>
                          <span>·</span>
                          <button 
                            onClick={() => handleStartEditPost(p.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', outline: 'none', fontWeight: 600 }}
                          >
                            <i className="ti ti-edit"></i> {t('btn_edit')}
                          </button>
                          <span>·</span>
                          <button 
                            onClick={() => handleDeletePost(p.id, p.title)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', outline: 'none', fontWeight: 600 }}
                          >
                            <i className="ti ti-trash"></i> {t('btn_delete')}
                          </button>
                        </div>
                      </div>
                      <span className={`badge ${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : p.status === 'draft' ? 'draft' : 'pending'}`}>
                        {p.status === 'approved' ? t('status_approved') : p.status === 'rejected' ? t('status_rejected') : p.status === 'draft' ? t('status_draft') : t('status_pending')}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-plus" style={{ color: 'var(--primary)' }}></i> {editingPostId ? t('modal_edit_post_title') : t('modal_create_post_title')}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
                <div className="fg">
                  <label>{t('modal_post_title_label')} <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input type="text" id="title" value={newPostData.title} onChange={handleNewPostChange} placeholder={t('modal_post_title_placeholder')} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="fg">
                    <label>{t('modal_post_type_label')}</label>
                    <select id="type" value={newPostData.type} onChange={handleNewPostChange}>
                      <option value="Tìm kiếm đối tác">{t('type_find_partner')}</option>
                      <option value="Cần mua / Cần bán">{t('type_buy_sell')}</option>
                      <option value="Thông báo sự kiện">{t('type_event_announcement')}</option>
                      <option value="Tuyển dụng">{t('type_recruitment')}</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>{t('modal_post_category_label')}</label>
                    <input type="text" id="category" value={newPostData.category} onChange={handleNewPostChange} placeholder={t('modal_post_category_placeholder')} />
                  </div>
                </div>

                <div className="fg">
                  <label>{t('modal_post_tags_label')}</label>
                  <input type="text" id="tags" value={newPostData.tags} onChange={handleNewPostChange} placeholder={t('modal_post_tags_placeholder')} />
                </div>

                <div className="fg">
                  <label>{t('modal_post_summary_label')}</label>
                  <input type="text" id="summary" value={newPostData.summary} onChange={handleNewPostChange} placeholder={t('modal_post_summary_placeholder')} />
                </div>

                <div className="fg">
                  <label>{t('modal_post_body_label')} <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <RichTextEditor 
                    value={newPostData.body} 
                    onChange={(val) => setNewPostData(prev => ({ ...prev, body: val }))} 
                    placeholder={t('modal_post_body_label')} 
                  />
                </div>

                <div className="fg">
                  <label>{t('modal_post_contact_label')} <span style={{ color: 'var(--rose)' }}>*</span></label>
                  <input type="text" id="contact_info" value={newPostData.contact_info} onChange={handleNewPostChange} placeholder={t('modal_post_contact_placeholder')} required />
                </div>

                <div className="fg">
                  <label>{t('modal_post_deadline_label')}</label>
                  <input type="date" id="deadline" value={newPostData.deadline} onChange={handleNewPostChange} />
                </div>

                <div className="fg">
                  <label>{t('modal_post_image_label')}</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      id="image_url" 
                      value={newPostData.image_url} 
                      onChange={handleNewPostChange} 
                      placeholder={t('modal_post_image_placeholder')} 
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
                        backgroundColor: 'var(--surface-0)',
                        border: '1px solid var(--border-strong)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    >
                      <i className="ti ti-upload"></i> {t('btn_choose_file')}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                  {uploadingImage && <div style={{ fontSize: '11px', color: 'var(--primary-light)', marginTop: '2px' }}><i className="ti ti-loader animate-spin"></i> {t('status_uploading_image')}</div>}
                </div>

                {profileData.tier === 'Platinum' && (
                  <div className="fg" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', background: 'var(--amber-bg)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <input 
                      type="checkbox" 
                      id="featured_requested" 
                      checked={newPostData.featured_requested === 1}
                      onChange={(e) => setNewPostData(prev => ({ ...prev, featured_requested: e.target.checked ? 1 : 0 }))} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="featured_requested" style={{ margin: 0, cursor: 'pointer', fontSize: '13px', fontWeight: 650, color: 'var(--amber-dark)' }}>
                      <i className="ti ti-star-filled"></i> {t('modal_request_featured_label')}
                    </label>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button type="button" className="btn" onClick={() => setModalOpen(false)} style={{ background: '#FFFFFF', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>{t('btn_cancel')}</button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitAction(true)} 
                  className="btn" 
                  style={{ backgroundColor: 'var(--surface-0)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 600 }}
                  disabled={creatingPost || uploadingImage}
                >
                  {t('btn_save_draft')}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitAction(false)} 
                  className="btn btn-primary" 
                  disabled={creatingPost || uploadingImage}
                >
                  {creatingPost ? <><i className="ti ti-loader animate-spin"></i> {t('btn_sending')}</> : (editingPostId ? <><i className="ti ti-save"></i> {t('btn_update_publish')}</> : <><i className="ti ti-plus"></i> {t('btn_publish')}</>)}
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
