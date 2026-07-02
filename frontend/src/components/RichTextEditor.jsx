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
    background: 'none',
    border: 'none',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    transition: 'background-color 0.2s',
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'var(--surface-2)', overflow: 'hidden', textAlign: 'left' }}>
      
      {/* Formatting Toolbar */}
      <div style={{ display: 'flex', gap: '4px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Paragraph Format Selector */}
        <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} title="Tiêu đề H1" style={btnStyle} className="hover-highlight">H1</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} title="Tiêu đề H2" style={btnStyle} className="hover-highlight">H2</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} title="Tiêu đề H3" style={btnStyle} className="hover-highlight">H3</button>
        <button type="button" onClick={() => execCommand('formatBlock', '<p>')} title="Đoạn văn" style={btnStyle} className="hover-highlight">P</button>
        
        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

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
        
        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* List formatting */}
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Danh sách gạch đầu dòng" style={btnStyle} className="hover-highlight">
          <i className="ti ti-list" style={{ fontSize: '14px' }}></i>
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Danh sách số" style={btnStyle} className="hover-highlight">
          <i className="ti ti-list-numbers" style={{ fontSize: '14px' }}></i>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

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

        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

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
          color: '#fff', 
          outline: 'none',
          fontSize: '13.5px',
          lineHeight: '1.6'
        }}
        placeholder={placeholder}
      />
      
      {/* Dynamic inline hover CSS styling */}
      <style>{`
        .hover-highlight:hover {
          background-color: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
