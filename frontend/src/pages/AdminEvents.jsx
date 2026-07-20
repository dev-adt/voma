import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminEvents = () => {
  const { getAuthHeaders } = useAuth();
  
  // States
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    organizer: '',
    capacity: '',
    status: 'upcoming',
    description: ''
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Không thể tải danh sách sự kiện.');
      const data = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      event_date: '',
      location: '',
      organizer: '',
      capacity: '',
      status: 'upcoming',
      description: ''
    });
    setEditingEventId(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setFormData({
      title: event.title || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().substring(0, 10) : '',
      location: event.location || '',
      organizer: event.organizer || '',
      capacity: event.capacity || '',
      status: event.status || 'upcoming',
      description: event.description || ''
    });
    setEditingEventId(event.id);
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date) {
      alert('Vui lòng điền tiêu đề và ngày tổ chức.');
      return;
    }

    const payload = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : null
    };

    const url = editingEventId ? `/api/admin/events/${editingEventId}` : '/api/admin/events';
    const method = editingEventId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingEventId ? 'Cập nhật sự kiện thành công!' : 'Thêm sự kiện mới thành công!');
        setModalOpen(false);
        loadEvents();
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện: "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert('Đã xóa sự kiện thành công!');
        loadEvents();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <span className="badge pending">Sắp diễn ra</span>;
      case 'ongoing':
        return <span className="badge approved" style={{ background: '#3B82F6', borderColor: '#3B82F6' }}>Đang diễn ra</span>;
      case 'completed':
        return <span className="badge approved">Đã kết thúc</span>;
      case 'cancelled':
        return <span className="badge rejected">Đã hủy</span>;
      default:
        return <span className="badge pending">Chưa rõ</span>;
    }
  };

  return (
    <AdminLayout title="Quản Lý Sự Kiện">
      <div className="card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '15px', color: '#0F172A', fontWeight: 700, margin: 0 }}>Danh sách Sự kiện giao thương</h2>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <i className="ti ti-plus"></i> Thêm Sự kiện mới
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách sự kiện...
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Lỗi tải dữ liệu: {error}
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-calendar" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Chưa có sự kiện nào được tạo.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                  <th style={{ padding: '12px 16px' }}>Tên Sự Kiện</th>
                  <th style={{ padding: '12px 16px' }}>Ngày Tổ Chức</th>
                  <th style={{ padding: '12px 16px' }}>Địa Điểm</th>
                  <th style={{ padding: '12px 16px' }}>Đơn Vị Tổ Chức</th>
                  <th style={{ padding: '12px 16px' }}>Sức Chứa / Quan Tâm</th>
                  <th style={{ padding: '12px 16px' }}>Trạng Thế</th>
                  <th style={{ padding: '12px 16px', textAction: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A', maxWidth: '250px' }}>{e.title}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{new Date(e.event_date).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{e.location || 'Chưa thiết lập'}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{e.organizer || 'Chưa thiết lập'}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      <div>Sức chứa: {e.capacity ? `${e.capacity} khách` : 'Không giới hạn'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '2px' }}>
                        <i className="ti ti-star-filled"></i> {e.interest_count || 0} lượt quan tâm
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(e.status)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="quick-btn" onClick={() => handleOpenEditModal(e)} style={{ padding: '4px 8px', fontSize: '11px', background: '#3B82F6', color: '#fff', border: '1px solid #3B82F6', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                        <button className="quick-btn" onClick={() => handleDelete(e.id, e.title)} style={{ padding: '4px 8px', fontSize: '11px', background: '#EF4444', color: '#fff', border: '1px solid #EF4444', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Sự Kiện */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '1.5rem', background: '#fff', color: '#1E293B', textAlign: 'left', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                {editingEventId ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện giao thương mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Tên sự kiện <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" id="title" value={formData.title} onChange={handleFormChange} required style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Ngày tổ chức <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="date" id="event_date" value={formData.event_date} onChange={handleFormChange} required style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Trạng thái</label>
                    <select id="status" value={formData.status} onChange={handleFormChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px', height: '31.5px' }}>
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="ongoing">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Địa điểm tổ chức</label>
                  <input type="text" id="location" value={formData.location} onChange={handleFormChange} placeholder="Ví dụ: GEM Center, Quận 1, TP. HCM..." style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Đơn vị tổ chức</label>
                    <input type="text" id="organizer" value={formData.organizer} onChange={handleFormChange} placeholder="Ví dụ: Ban thư ký Voma..." style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Sức chứa tối đa (Khách)</label>
                    <input type="number" id="capacity" value={formData.capacity} onChange={handleFormChange} placeholder="Bỏ trống nếu không giới hạn..." style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Mô tả sự kiện</label>
                  <textarea id="description" value={formData.description} onChange={handleFormChange} placeholder="Mô tả tóm tắt nội dung chương trình sự kiện..." style={{ width: '100%', height: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '12.5px', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}>Hủy</button>
                <button type="submit" style={{ padding: '6px 12px', background: '#1E88E5', border: '1px solid #1E88E5', borderRadius: '6px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Lưu sự kiện</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminEvents;
