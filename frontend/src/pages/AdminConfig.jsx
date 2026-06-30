import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminConfig = () => {
  const { getAuthHeaders } = useAuth();

  // States
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  // Model suggestions for each provider
  const modelSuggestions = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20240620',
    gemini: 'gemini-1.5-flash',
    deepseek: 'deepseek-chat',
    openrouter: 'google/gemini-2.0-flash-001',
    ollama: 'llama3'
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/get-config', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProvider(data.provider || 'gemini');
        setModel(data.model || '');
        setHasStoredKey(data.hasKey || false);
        if (data.hasKey) {
          setApiKey('**************************************');
        }
      }
    } catch (e) {
      console.error("Error loading AI config", e);
      setMessage({ text: 'Không thể tải cấu hình AI hiện tại.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleProviderChange = (e) => {
    const p = e.target.value;
    setProvider(p);
    setModel(modelSuggestions[p] || '');
    setApiKey('');
    setHasStoredKey(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/save-config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ provider, model, apiKey })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lưu cấu hình thất bại.');
      }
      setMessage({ text: 'Đã lưu cấu hình AI và API Key thành công!', type: 'success' });
      loadConfig();
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Cấu hình Trợ Lý AI">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div className="card-title" style={{ marginBlockStart: 0 }}><i className="ti ti-settings"></i> Thiết lập AI Model & Key</div>
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

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải cấu hình AI...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="fg">
              <label>AI Provider (Nhà cung cấp)</label>
              <select value={provider} onChange={handleProviderChange} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#fff', outline: 'none' }}>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
                <option value="deepseek">DeepSeek AI</option>
                <option value="openrouter">OpenRouter (Multi-model proxy)</option>
                <option value="ollama">Ollama (Local Offline AI)</option>
              </select>
            </div>

            <div className="fg">
              <label>Model ID (Mã mô hình)</label>
              <input 
                type="text" 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                placeholder="Ví dụ: gemini-1.5-flash..." 
                required 
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Gợi ý cho {provider}: <strong>{modelSuggestions[provider]}</strong>
              </span>
            </div>

            <div className="fg">
              <label>API Key {hasStoredKey && <span style={{ color: 'var(--emerald)', fontSize: '11px' }}>(Đã cấu hình trước đó)</span>}</label>
              <input 
                type={hasStoredKey ? 'text' : 'password'}
                value={apiKey} 
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setHasStoredKey(false);
                }} 
                placeholder={hasStoredKey ? '**************************************' : 'Nhập API key mới...'} 
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                API key được lưu trữ mã hóa và proxy an toàn từ server. Không bao giờ hiển thị trực tiếp cho phía khách.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><i className="ti ti-loader animate-spin"></i> Đang lưu...</> : <><i className="ti ti-save"></i> Lưu cấu hình AI</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminConfig;
