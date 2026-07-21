import React, { useRef, useEffect } from 'react';

export const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  // Sync content from prop value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Nhập địa chỉ hình ảnh (URL):', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const btnStyle = {
    background: '#FFFFFF',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    transition: 'var(--transition)',
    fontWeight: 600
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ border: '1px solid var(--border-strong)', borderRadius: '8px', background: '#FFFFFF', overflow: 'hidden', textAlign: 'left' }}>
      
      {/* Formatting Toolbar */}
      <div style={{ display: 'flex', gap: '4px', padding: '8px', background: 'var(--surface-0)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Paragraph Format Selector */}
        <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} title="Tiêu đề H1" style={btnStyle} className="hover-highlight">H1</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} title="Tiêu đề H2" style={btnStyle} className="hover-highlight">H2</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} title="Tiêu đề H3" style={btnStyle} className="hover-highlight">H3</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<p>')} title="Đoạn văn" style={btnStyle} className="hover-highlight">P</button>
        
        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Text styling */}
        <button type="button" onClick={() => execCommand('bold')} title="In đậm" style={btnStyle} className="hover-highlight">
          <i className="ti ti-bold" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="In nghiêng" style={btnStyle} className="hover-highlight">
          <i className="ti ti-italic" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('underline')} title="Gạch chân" style={btnStyle} className="hover-highlight">
          <i className="ti ti-underline" style={{ fontSize: '14px' }}></i>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Font Size & Color controls */}
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            outline: 'none',
            margin: '0 4px',
            height: '28px',
            fontWeight: 600
          }}
          title="Cỡ chữ"
        >
          <option value="3">Cỡ chữ</option>
          <option value="1">Rất nhỏ</option>
          <option value="2">Nhỏ</option>
          <option value="3">Bình thường</option>
          <option value="4">Lớn</option>
          <option value="5">Rất lớn</option>
          <option value="6">Cực lớn</option>
          <option value="7">Khổng lồ</option>
        </select>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 6px', position: 'relative' }} title="Màu chữ">
          <i className="ti ti-palette" style={{ fontSize: '14px', color: 'var(--primary)' }}></i>
          <input 
            type="color" 
            onChange={(e) => execCommand('foreColor', e.target.value)}
            defaultValue="#083331"
            style={{
              width: '20px',
              height: '20px',
              border: 'none',
              padding: 0,
              background: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

        {/* List formatting */}
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Danh sách gạch đầu dòng" style={btnStyle} className="hover-highlight">
          <i className="ti ti-list" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Danh sách số" style={btnStyle} className="hover-highlight">
          <i className="ti ti-list-numbers" style={{ fontSize: '14px' }}></i>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Alignments */}
        <button type="button" onClick={() => execCommand('justifyLeft')} title="Căn trái" style={btnStyle} className="hover-highlight">
          <i className="ti ti-align-left" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Căn giữa" style={btnStyle} className="hover-highlight">
          <i className="ti ti-align-center" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Căn phải" style={btnStyle} className="hover-highlight">
          <i className="ti ti-align-right" style={{ fontSize: '14px' }}></i>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Links and Media */}
        <button type="button" onClick={insertLink} title="Chèn liên kết" style={btnStyle} className="hover-highlight">
          <i className="ti ti-link" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={insertImage} title="Chèn hình ảnh" style={btnStyle} className="hover-highlight">
          <i className="ti ti-photo" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('removeFormat')} title="Xóa định dạng" style={btnStyle} className="hover-highlight">
          <i className="ti ti-eraser" style={{ fontSize: '14px' }}></i>
        </button>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{ 
          minHeight: '220px', 
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '16px', 
          color: 'var(--text-primary)', 
          backgroundColor: '#FFFFFF',
          outline: 'none',
          fontSize: '13.5px',
          lineHeight: '1.6'
        }}
        placeholder={placeholder}
      />
      
      {/* Dynamic inline hover CSS styling */}
      <style>{`
        .hover-highlight:hover {
          background-color: var(--primary-glow) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
