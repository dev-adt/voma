import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../contexts/LanguageContext';

export const AIChat = () => {
  const { role, token, user, getAuthHeaders } = useAuth();
  const { t } = useTranslation();
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
  const [aiConfig, setAiConfig] = useState({ provider: 'Gemini', model: 'gemini-1.5-flash' });
  const [selectedModelOverride, setSelectedModelOverride] = useState(() => {
    return localStorage.getItem('voma_chat_model_override') || '';
  });

  const handleModelOverrideChange = (val) => {
    setSelectedModelOverride(val);
    localStorage.setItem('voma_chat_model_override', val);
  };

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
          const defaultModels = {
            openai: 'gpt-4o-mini',
            anthropic: 'claude-3-5-sonnet-20240620',
            gemini: 'gemini-1.5-flash',
            deepseek: 'deepseek-chat',
            openrouter: 'google/gemini-2.0-flash-001',
            ollama: 'llama3'
          };
          const provKey = (data.provider || 'gemini').toLowerCase();
          setAiConfig({
            provider: providerNames[provKey] || data.provider,
            model: data.model || defaultModels[provKey] || ''
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
        
        if (selectFirst) {
          newChatSession();
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
    if (!confirm(t('confirm_delete_session'))) return;

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

      // Xác định provider và model dựa trên override của Gold/Platinum
      let requestProvider = aiConfig.provider.toLowerCase();
      let requestModel = aiConfig.model;
      
      const isPremiumTier = user && (user.tier === 'Gold' || user.tier === 'Platinum');
      if (isPremiumTier && selectedModelOverride) {
        requestProvider = 'openrouter';
        requestModel = selectedModelOverride;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'X-Session-Id': currentSessionId
        },
        body: JSON.stringify({
          provider: requestProvider,
          model: requestModel,
          messages: messagesPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('error_ai_call'));
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text, created_at: new Date().toISOString() }]);
      
      // Load lại danh sách phiên để cập nhật tiêu đề/thời gian hoạt động mới nhất
      loadSessions(false);
    } catch (e) {
      alert(e.message || t('error_sending_message'));
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
    if (diffDays === 0) return t('date_today');
    if (diffDays === 1) return t('date_yesterday');
    return date.toLocaleDateString('vi-VN');
  };

  const formatAIResponse = (text) => {
    if (!text) return '';
    
    // Split lines
    const lines = text.split('\n');
    let inList = false;
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      
      // Escape HTML to prevent XSS
      trimmed = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      // Inline formatting (bold)
      trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      trimmed = trimmed.replace(/__(.*?)__/g, '<strong>$1</strong>');
      
      // Headings
      if (trimmed.startsWith('### ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h4 style="font-size: 14.5px; font-weight: 700; margin: 12px 0 6px; color: #ffffff;">${trimmed.substring(4)}</h4>`);
      } else if (trimmed.startsWith('## ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h3 style="font-size: 16px; font-weight: 700; margin: 14px 0 8px; color: #ffffff;">${trimmed.substring(3)}</h3>`);
      } else if (trimmed.startsWith('# ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h2 style="font-size: 18px; font-weight: 700; margin: 16px 0 10px; color: #ffffff;">${trimmed.substring(2)}</h2>`);
      } 
      // Horizontal Rule
      else if (trimmed === '---' || trimmed === '***') {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push('<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 14px 0;" />');
      }
      // List items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          formattedLines.push('<ul style="margin: 6px 0; padding-left: 20px; list-style-type: disc;">');
          inList = true;
        }
        formattedLines.push(`<li style="margin: 4px 0;">${trimmed.substring(2)}</li>`);
      }
      // Empty line
      else if (trimmed === '') {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push('<div style="height: 6px;"></div>');
      }
      // Plain text line
      else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(`<p style="margin: 4px 0; line-height: 1.6; font-size: 13px; color: rgba(255,255,255,0.9);">${trimmed}</p>`);
      }
    }
    
    if (inList) {
      formattedLines.push('</ul>');
    }
    
    return <div style={{ fontSize: '13px', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: formattedLines.join('') }} />;
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
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '22px', color: '#FFFFFF', marginBottom: '0.75rem' }}>{t('login_ai_chat_title')}</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {t('login_ai_chat_desc')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-login"></i> {t('login_now')}</Link>
              <Link to="/register" className="btn" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-user-plus"></i> {t('register_new')}</Link>
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
            <div className="chat-hist-title">{t('chat_history_title')}</div>
            <button className="chat-add-btn" onClick={newChatSession} title={t('new_chat_btn_tooltip')}><i className="ti ti-plus"></i></button>
          </div>
          
          <div className="chat-hist-search">
            <div style={{ position: 'relative' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                placeholder={t('search_chat_placeholder')} 
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
                {t('loading_chat_history')}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <i className="ti ti-messages" style={{ fontSize: '18px', display: 'block', margin: '0 auto 6px' }}></i>
                {t('no_chat_history')}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const activeClass = session.session_id === currentSessionId ? 'active' : '';
                const titleText = session.title ? (session.title.length > 22 ? session.title.slice(0, 22) + '...' : session.title) : t('new_chat_session_title');
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
                        title={t('delete_chat_tooltip')}
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
            <div className="chat-hist-title" style={{ marginBottom: '8px' }}>{t('label_topics')}</div>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_1_val'))}><i className="ti ti-briefcase" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_business')}</button>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_2_val'))}><i className="ti ti-chart-line" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_investment')}</button>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_3_val'))}><i className="ti ti-users" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_connection')}</button>
          </div>
        </div>

        {/* Center: Message Viewport */}
        <div className="chat-main">
          <div style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.25rem', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-robot" style={{ color: 'var(--neon-cyan)', fontSize: '18px' }}></i> {t('ai_assistant_title')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)', padding: '4px 12px', borderRadius: '99px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></span>
              <span>
                {user && (user.tier === 'Gold' || user.tier === 'Platinum') && selectedModelOverride 
                  ? `OpenRouter (${selectedModelOverride.split('/').pop()})` 
                  : `${aiConfig.provider} (${aiConfig.model})`}
              </span>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div id="chat-msgs" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <div className="bubble-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loadingHistory ? (
                <div style={{ padding: '3rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <i className="ti ti-loader animate-spin" style={{ fontSize: '16px', display: 'block', margin: '0 auto 6px' }}></i>
                  {t('loading_messages')}
                </div>
              ) : messages.length === 0 ? (
                // Welcome Message
                <div className="chat-bubble ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', color: '#fff', fontSize: '13px', lineHeight: '1.6', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left' }}>
                  {t('ai_welcome_1')}<br/><br/>
                  {t('ai_welcome_2')}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_1_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>{t('ai_suggestion_1_lbl')}</button>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_2_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>{t('ai_suggestion_2_lbl')}</button>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_3_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>{t('ai_suggestion_3_lbl')}</button>
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
                  <i className="ti ti-loader animate-spin"></i> {t('ai_thinking')}
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
                placeholder={t('chat_input_placeholder')} 
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
              <span>{t('chat_help_tip')}</span>
              <span>{t('data_retrieval_label')}: <strong id="ctx-summary">Real-Time Database</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Panel Settings & Suggested Actions */}
        <div className="chat-right-sidebar" style={{ textAlign: 'left' }}>
          
          {/* AI Settings Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-settings" style={{ color: 'var(--neon-cyan)' }}></i> {t('ai_config_title')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span>{t('status_label')}: <strong style={{ color: '#ffffff' }}>{t('status_online')}</strong></span>
            </div>
            
            {user && (user.tier === 'Gold' || user.tier === 'Platinum') ? (
              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  <i className="ti ti-crown" style={{ color: 'var(--amber)', marginRight: '4px' }}></i>
                  {t('premium_model_label')(user.tier)}
                </label>
                <select
                  value={selectedModelOverride}
                  onChange={(e) => handleModelOverrideChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'var(--surface-3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('system_default_model')}</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 (Chat)</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1 (Suy luận)</option>
                  <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                  <option value="anthropic/claude-opus-4">Claude Opus 4</option>
                  <option value="google/gemini-3-flash-preview">Gemini 3 Flash</option>
                </select>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                {t('free_model_desc')}
                {user && (
                  <div style={{ marginTop: '6px', color: 'var(--amber)', fontWeight: 500 }}>
                    <i className="ti ti-crown"></i> {t('upgrade_to_change_models')}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Suggested Actions Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-sparkles" style={{ color: 'var(--neon-cyan)' }}></i> {t('suggested_actions_title')}
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_1_title') + ' ' + t('category_default'))}>
              <div className="chat-panel-icon"><i className="ti ti-user-plus"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{t('suggested_action_1_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_1_desc')}</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_2_title'))}>
              <div className="chat-panel-icon"><i className="ti ti-calendar"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{t('suggested_action_2_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_2_desc')}</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_3_title'))}>
              <div className="chat-panel-icon"><i className="ti ti-building-handshake"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{t('suggested_action_3_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_3_desc')}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default AIChat;
