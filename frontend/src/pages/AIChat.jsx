import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export const AIChat = () => {
  const { role, token, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  // State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiConfig, setAiConfig] = useState({ provider: 'Gemini', model: '' });

  const messagesEndRef = useRef(null);

  const generateUUID = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  };

  // Tải cấu hình AI hiển thị
  useEffect(() => {
    if (role === 'guest') return;

    const loadConfig = async () => {
      try {
        const res = await fetch('/api/admin/get-config', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          const providerNames = { anthropic: 'Anthropic', openai: 'OpenAI', gemini: 'Gemini', deepseek: 'DeepSeek', openrouter: 'OpenRouter' };
          setAiConfig({
            provider: providerNames[data.provider] || data.provider,
            model: data.model || ''
          });
        }
      } catch (e) {
        console.error("Failed to load AI config in chat", e);
      }
    };
    loadConfig();
  }, [role, token]);

  // Tải danh sách session
  const loadSessions = async (selectFirst = false) => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/chat/sessions', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setSessions(list);
        
        if (selectFirst && list.length > 0) {
          selectSession(list[0].session_id);
        } else if (list.length === 0) {
          newChatSession();
        }
      }
    } catch (e) {
      console.error("Error loading chat sessions", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (role === 'guest') return;
    loadSessions(true);
  }, [role, token]);

  // Tải tin nhắn của session được chọn
  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/history/${sessionId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (e) {
      console.error("Error loading messages", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const newChatSession = () => {
    setCurrentSessionId(generateUUID());
    setMessages([]);
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) return;

    try {
      const res = await fetch(`/api/chat/session/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        if (sessionId === currentSessionId) {
          newChatSession();
        }
        loadSessions(false);
      }
    } catch (e) {
      console.error("Error deleting session", e);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    setInputText('');
    setSending(true);

    const tempUserMsg = { role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Gọi API Chat qua backend proxy
      const messagesPayload = [...messages, { role: 'user', content: text }].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'X-Session-Id': currentSessionId
        },
        body: JSON.stringify({
          provider: aiConfig.provider.toLowerCase(),
          model: aiConfig.model,
          messages: messagesPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gọi AI.');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text, created_at: new Date().toISOString() }]);
      
      // Load lại danh sách phiên để cập nhật tiêu đề/thời gian hoạt động mới nhất
      loadSessions(false);
    } catch (e) {
      alert(e.message || 'Lỗi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFriendlyDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN');
  };

  const formatAIResponse = (text) => {
    if (!text) return '';
    
    // Format markdown cơ bản
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul style="margin: 6px 0; padding-left: 20px">${m}</ul>`)
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
      
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Bộ lọc lịch sử chat
  const filteredSessions = sessions.filter(s => {
    if (!searchQuery) return true;
    return s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Nếu là Guest, hiển thị overlay yêu cầu đăng nhập
  if (role === 'guest') {
    return (
      <div className="public-body" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, background: 'rgba(8,14,30,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem' }}>
            <i className="ti ti-lock" style={{ fontSize: '48px', color: 'var(--neon-cyan)', display: 'block', marginBottom: '1.5rem' }}></i>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '22px', color: '#FFFFFF', marginBottom: '0.75rem' }}>Đăng nhập để sử dụng Trợ lý AI</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              Tính năng Trợ lý AI chỉ dành cho hội viên doanh nghiệp đã đăng nhập và được phê duyệt. Vui lòng đăng nhập tài khoản hội viên của bạn.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-login"></i> Đăng nhập ngay</Link>
              <Link to="/register" className="btn" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-user-plus"></i> Đăng ký mới</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-body" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="chat-grid-layout" style={{ flex: 1 }}>
        
        {/* Left Side: Chat History & Topics */}
        <div className="chat-left-sidebar" style={{ textAlign: 'left' }}>
          <div className="chat-hist-header">
            <div className="chat-hist-title">Lịch sử trò chuyện</div>
            <button className="chat-add-btn" onClick={newChatSession} title="Cuộc trò chuyện mới"><i className="ti ti-plus"></i></button>
          </div>
          
          <div className="chat-hist-search">
            <div style={{ position: 'relative' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm hội thoại..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '28px' }}
              />
            </div>
          </div>
          
          <div className="chat-hist-card-list">
            {loadingSessions ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '14px', display: 'block', margin: '0 auto 6px' }}></i>
                Đang tải lịch sử...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <i className="ti ti-messages" style={{ fontSize: '18px', display: 'block', margin: '0 auto 6px' }}></i>
                Không có lịch sử trò chuyện.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const activeClass = session.session_id === currentSessionId ? 'active' : '';
                const titleText = session.title ? (session.title.length > 22 ? session.title.slice(0, 22) + '...' : session.title) : 'Cuộc trò chuyện mới';
                const dateLabel = getFriendlyDate(session.last_activity);
                
                return (
                  <div 
                    className={`chat-hist-card ${activeClass}`} 
                    key={session.session_id} 
                    onClick={() => selectSession(session.session_id)}
                    style={{ position: 'relative' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div className="chat-hist-card-title" style={{ flex: 1, textAlign: 'left' }}>{titleText}</div>
                      <button 
                        className="delete-session-btn" 
                        onClick={(e) => deleteSession(e, session.session_id)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '11px', lineHeight: 1 }} 
                        title="Xóa hội thoại"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                    <div className="chat-hist-card-meta" style={{ marginTop: '4px' }}>
                      <span>{dateLabel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{ padding: '1.25rem 1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="chat-hist-title" style={{ marginBottom: '8px' }}>Chủ đề</div>
            <button className="chat-topic-btn" onClick={() => handleSend('Nghiệp vụ Kinh doanh B2B doanh nghiệp')}><i className="ti ti-briefcase" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;Kinh doanh</button>
            <button className="chat-topic-btn" onClick={() => handleSend('Cơ hội đầu tư xúc tiến mới nhất')}><i className="ti ti-chart-line" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;Đầu tư</button>
            <button className="chat-topic-btn" onClick={() => handleSend('Đối tác kết nối hội viên BizHub')}><i className="ti ti-users" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;Kết nối</button>
          </div>
        </div>

        {/* Center: Message Viewport */}
        <div className="chat-main">
          <div style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.25rem', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-robot" style={{ color: 'var(--neon-cyan)', fontSize: '18px' }}></i> Trợ lý thông minh AI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)', padding: '4px 12px', borderRadius: '99px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></span>
              <span>{aiConfig.provider} ({aiConfig.model})</span>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div id="chat-msgs" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <div className="bubble-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loadingHistory ? (
                <div style={{ padding: '3rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <i className="ti ti-loader animate-spin" style={{ fontSize: '16px', display: 'block', margin: '0 auto 6px' }}></i>
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                // Welcome Message
                <div className="chat-bubble ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', color: '#fff', fontSize: '13px', lineHeight: '1.6', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}>
                  Xin chào! Tôi là Trợ lý AI phân tích doanh nghiệp của <strong>BizHub</strong>.<br/><br/>
                  Tôi được tích hợp dữ liệu cơ sở thực của hội viên để hỗ trợ tra cứu hồ sơ năng lực, các cơ hội hợp tác và sự kiện. Bạn cần phân tích lĩnh vực nào hôm nay?
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button className="chip" onClick={() => handleSend('Phân tích xu hiện trạng doanh nghiệp B2B năm 2026')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>Phân tích thị trường B2B</button>
                    <button className="chip" onClick={() => handleSend('Tìm đối tác trong ngành Công nghệ thông tin')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>Tìm đối tác Công nghệ</button>
                    <button className="chip" onClick={() => handleSend('Sự kiện kết nối giao lưu sắp tới')} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>Sự kiện giao thương</button>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={idx}
                      className={`chat-bubble ${isUser ? 'user' : 'ai'}`} 
                      style={{ 
                        alignSelf: isUser ? 'flex-end' : 'flex-start', 
                        maxWidth: '85%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--surface-2)', 
                        color: '#fff', 
                        fontSize: '13px', 
                        lineHeight: '1.6', 
                        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        textAlign: 'left'
                      }}
                    >
                      {isUser ? msg.content : formatAIResponse(msg.content)}
                    </div>
                  );
                })
              )}
              {sending && (
                <div className="chat-bubble ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', color: '#fff', fontSize: '13px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}>
                  <i className="ti ti-loader animate-spin"></i> Trợ lý AI đang suy nghĩ...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box Container */}
          <div className="chat-input-area">
            <div className="chat-input-inner">
              <textarea 
                className="chat-ta" 
                placeholder="Nhập tin nhắn của bạn..." 
                rows="1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ height: 'auto' }}
              />
              <button 
                className="send-btn" 
                onClick={() => handleSend()}
                disabled={sending || !inputText.trim()}
              >
                <i className="ti ti-send"></i>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>Nhấn Enter để gửi · Shift+Enter để xuống dòng</span>
              <span>Truy xuất dữ liệu: <strong id="ctx-summary">Real-Time Database</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Panel Settings & Suggested Actions */}
        <div className="chat-right-sidebar" style={{ textAlign: 'left' }}>
          
          {/* AI Settings Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-settings" style={{ color: 'var(--neon-cyan)' }}></i> Cấu hình AI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span>Trạng thái: <strong style={{ color: '#ffffff' }}>Online</strong></span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
              Mô hình hiện hành có khả năng tìm kiếm chéo hồ sơ doanh nghiệp và cơ hội giao thương B2B toàn hệ thống.
            </div>
          </div>
          
          {/* Suggested Actions Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-sparkles" style={{ color: 'var(--neon-cyan)' }}></i> Hành động đề xuất
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend('Kết nối B2B doanh nghiệp Công nghệ thông tin')}>
              <div className="chat-panel-icon"><i className="ti ti-user-plus"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Kết nối B2B</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Yêu cầu giới thiệu và thông tin liên hệ</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend('Sự kiện xúc tiến thương mại sắp tới')}>
              <div className="chat-panel-icon"><i className="ti ti-calendar"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Tham gia sự kiện</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Xúc tiến kết nối giao thương trực tiếp</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend('Phân tích cơ hội đầu tư xúc tiến')}>
              <div className="chat-panel-icon"><i className="ti ti-building-handshake"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Cơ hội đầu tư</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Trợ lý phân tích dự báo giao thương</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default AIChat;
