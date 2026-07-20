import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from '../contexts/LanguageContext';

export const Events = () => {
  const { role, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch('/api/events', { headers });
      if (!res.ok) throw new Error(t('error_loading_events'));
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
  }, [token]);

  const filteredEvents = events.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || (e.organizer && e.organizer.toLowerCase().includes(q));
  });

  const openEventModal = (event) => {
    if (!token) {
      if (confirm(t('login_required_event_confirm'))) {
        navigate('/login');
      }
      return;
    }
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setModalOpen(false);
  };

  const handleToggleEventInterest = async (eventId) => {
    if (!token) {
      alert(t('login_required_feature'));
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
        alert(data.error || t('error_occurred'));
      }
    } catch (err) {
      alert(t('error_occurred') + ': ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('status_upcoming')}</span>;
      case 'ongoing':
        return <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('status_ongoing')}</span>;
      case 'completed':
        return <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('status_completed')}</span>;
      case 'cancelled':
        return <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t('status_cancelled')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="public-body">
      <Navbar />

      {/* Decorative background blobs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(245,158,11,0.03) 0%, rgba(245,158,11,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.02) 0%, rgba(16,185,129,0) 70%)', zIndex: -1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="public-container" style={{ minHeight: '60vh', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <i className="ti ti-calendar-event" style={{ color: 'var(--amber)' }}></i> {t('events_title')}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBlockEnd: 0 }}>{t('events_subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder={t('search_events_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '12px', width: '260px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.01)', color: '#fff' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i> {t('loading_events_list')}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', color: 'var(--rose)' }}></i> {t('error_loading_events_prefix')} {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <i className="ti ti-calendar" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> {t('no_events_found')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredEvents.map((e) => {
              const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString('vi-VN') : '';
              return (
                <div className="opp-card" key={e.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'left' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      {getStatusBadge(e.status)}
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
                    <h3 className="opp-title" style={{ minHeight: 'unset', marginBottom: '8px', fontSize: '15px' }}>{e.title}</h3>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}><i className="ti ti-calendar"></i> Ngày: {dateStr}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}><i className="ti ti-users"></i> Tổ chức: {e.organizer || 'Voma'}</div>
                    {!token && (
                      <div style={{ fontSize: '11px', color: 'var(--rose)', marginTop: '8px', background: 'rgba(244,63,94,0.05)', padding: '6px', borderRadius: '4px', border: '1px dashed rgba(244,63,94,0.15)' }}>
                        <i className="ti ti-lock"></i> {t('login_required_location')}
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="opp-btn" onClick={() => openEventModal(e)}>{t('btn_view_details')}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* Modal chi tiết sự kiện */}
      {modalOpen && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', borderColor: 'var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '16px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-calendar-event" style={{ color: 'var(--amber)' }}></i> {t('event_details_title')}
              </h3>
              <button onClick={closeEventModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}><i className="ti ti-x"></i></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto', textAlign: 'left' }}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_name')}</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.title}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_organizer')}</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.organizer || 'Voma'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_date')}</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{new Date(selectedEvent.event_date).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_max_capacity')}</span>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.capacity ? t('capacity_people')(selectedEvent.capacity) : t('capacity_unlimited')}</div>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_location')}</span>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>{selectedEvent.location || t('location_default')}</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{t('label_event_description')}</span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedEvent.description || t('no_event_desc')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => handleToggleEventInterest(selectedEvent.id)}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', background: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.05)', color: selectedEvent.is_interested ? '#000' : '#fff', borderColor: selectedEvent.is_interested ? 'var(--amber)' : 'rgba(255,255,255,0.1)', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
              >
                <i className={selectedEvent.is_interested ? "ti ti-star-filled" : "ti ti-star"}></i>
                {selectedEvent.is_interested ? t('status_interested') : t('btn_interest')} ({selectedEvent.interest_count || 0})
              </button>
              <button className="btn btn-primary" onClick={closeEventModal}>{t('btn_close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Events;
