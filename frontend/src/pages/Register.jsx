import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Register = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    tax_code: '',
    city: '',
    address: '',
    zip: '',
    social: '',
    description: '',
    contact_name: '',
    contact_pos: '',
    email: '',
    phone: '',
    goal: '',
    referral: '',
    password: '',
    tier: 'Silver'
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    // Map r-field to key in formData
    const key = id.replace('r-', '');
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectTier = (tierName) => {
    setFormData(prev => ({
      ...prev,
      tier: tierName
    }));
  };

  const validateStep1 = () => {
    if (!formData.name) return 'Vui lòng điền tên doanh nghiệp';
    if (!formData.industry) return 'Vui lòng chọn lĩnh vực hoạt động';
    if (!formData.size) return 'Vui lòng chọn quy mô nhân sự';
    if (!formData.tax_code) return 'Vui lòng điền mã số thuế';
    if (!formData.city) return 'Vui lòng chọn tỉnh thành';
    if (!formData.address) return 'Vui lòng điền địa chỉ chi tiết';
    if (!formData.description) return 'Vui lòng điền mô tả ngắn hoạt động kinh doanh';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.contact_name) return 'Vui lòng điền tên người đại diện';
    if (!formData.contact_pos) return 'Vui lòng điền chức vụ người đại diện';
    if (!formData.email) return 'Vui lòng điền email liên hệ';
    if (!formData.phone) return 'Vui lòng điền số điện thoại';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.password) return 'Vui lòng thiết lập mật khẩu';
    if (formData.password.length < 8) return 'Mật khẩu phải tối thiểu 8 ký tự';
    return null;
  };

  const handleNext = (nextStep) => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
    }
    setStep(nextStep);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validateStep3();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);

    try {
      // Chuẩn bị dữ liệu gửi lên backend
      const payload = {
        ...formData,
        license: formData.tax_code // Dùng tax_code thay thế giấy phép nếu cần
      };

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký không thành công.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-body">
      <Navbar />

      <div className="register-split-layout">
        
        {/* Left Side Sidebar */}
        <div className="register-sidebar">
          <div className="circular-text-wrap">
            <svg className="circular-svg" viewBox="0 0 300 300">
              <path id="textCircle" d="M 150,150 m -115,0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0" fill="none" />
              <text fill="rgba(255, 255, 255, 0.75)" fontSize="9.5" fontFamily="var(--font-title)" fontWeight="600" letterSpacing="0.065em">
                <textPath href="#textCircle">
                  AVG — MỞ RỘNG MẠNG LƯỚI, TỐI ĐA HÓA CƠ HỘI. KẾT NỐI TOÀN CẦU, PHÁT TRIỂN BỀN VỮNG.
                </textPath>
              </text>
            </svg>
            <img src="/images/hero_network.png" className="circular-inner-img" alt="Digital connections" />
          </div>
          
          <div className="register-sidebar-text">
            <h2>AVG Connection</h2>
            <p>Khởi tạo doanh nghiệp, xây dựng hồ sơ uy tín và mở rộng mạng lưới giao lưu kinh doanh rộng khắp toàn quốc.</p>
          </div>
        </div>

        {/* Right Side Form Wizard Panel */}
        <div className="register-form-panel" style={{ textAlign: 'left' }}>
          
          {!success ? (
            <>
              <div className="reg-wizard-header">
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>Gia nhập AVG</div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={`reg-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                    <div className="reg-step-num">1</div>
                    <span>Doanh nghiệp</span>
                  </div>
                  <div className={`reg-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                    <div className="reg-step-num">2</div>
                    <span>Người đại diện</span>
                  </div>
                  <div className={`reg-step-item ${step === 3 ? 'active' : ''}`}>
                    <div className="reg-step-num">3</div>
                    <span>Tài khoản</span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="ti ti-circle-x" style={{ fontSize: '16px' }}></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                
                {/* STEP 1: Thông tin Doanh nghiệp */}
                {step === 1 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B', marginBottom: '1.25rem' }}><i className="ti ti-building" style={{ color: 'var(--primary)' }}></i> 1. Kê khai thông tin doanh nghiệp</div>
                    
                    <div className="fg" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Tên Doanh nghiệp <span style={{ color: 'var(--rose)' }}>*</span></label>
                      <input type="text" id="r-name" value={formData.name} onChange={handleInputChange} placeholder="Ví dụ: Công ty Cổ phần Công nghệ Vina Tech" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                    </div>
                    
                    <div className="fg" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Địa chỉ Website doanh nghiệp</label>
                      <input type="text" id="r-website" value={formData.website} onChange={handleInputChange} placeholder="Ví dụ: https://vinatech.vn" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Lĩnh vực hoạt động <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input 
                          type="text" 
                          id="r-industry" 
                          list="industries-list" 
                          value={formData.industry} 
                          onChange={handleInputChange} 
                          placeholder="Chọn hoặc tự điền lĩnh vực..."
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }} 
                        />
                        <datalist id="industries-list">
                          <option value="Công nghệ thông tin" />
                          <option value="Xuất nhập khẩu" />
                          <option value="Bất động sản" />
                          <option value="Sản xuất & Chế biến" />
                          <option value="Dịch vụ tài chính" />
                          <option value="Du lịch & Khách sạn" />
                          <option value="Giáo dục & Đào tạo" />
                          <option value="Y tế & Sức khỏe" />
                          <option value="Nông nghiệp" />
                          <option value="Xây dựng" />
                          <option value="Thời trang & May mặc" />
                          <option value="Logistics & Vận tải" />
                          <option value="Năng lượng & Môi trường" />
                          <option value="Thực phẩm & Đồ uống" />
                        </datalist>
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Quy mô (Nhân sự) <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <select id="r-size" value={formData.size} onChange={handleInputChange} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                          <option value="">-- Chọn quy mô --</option>
                          <option value="Dưới 10 người">Dưới 10 người</option>
                          <option value="10 – 50 người">10 – 50 người</option>
                          <option value="50 – 200 người">50 – 200 người</option>
                          <option value="200 – 500 người">200 – 500 người</option>
                          <option value="Trên 500 người">Trên 500 người</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Mã số thuế doanh nghiệp <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input type="text" id="r-tax_code" value={formData.tax_code} onChange={handleInputChange} placeholder="Mã số thuế gồm 10 chữ số" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Tỉnh/Thành phố trụ sở <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input 
                          type="text" 
                          id="r-city" 
                          list="cities-list" 
                          value={formData.city} 
                          onChange={handleInputChange} 
                          placeholder="Chọn hoặc tự điền tỉnh thành..." 
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                        />
                        <datalist id="cities-list">
                          <option value="Hà Nội" />
                          <option value="TP. Hồ Chí Minh" />
                          <option value="Đà Nẵng" />
                          <option value="Bình Dương" />
                          <option value="Đồng Nai" />
                          <option value="Hải Phòng" />
                          <option value="Cần Thơ" />
                          <option value="An Giang" />
                          <option value="Bà Rịa - Vũng Tàu" />
                          <option value="Bắc Giang" />
                          <option value="Bắc Kạn" />
                          <option value="Bạc Liêu" />
                          <option value="Bắc Ninh" />
                          <option value="Bến Tre" />
                          <option value="Bình Định" />
                          <option value="Bình Phước" />
                          <option value="Bình Thuận" />
                          <option value="Cà Mau" />
                          <option value="Cao Bằng" />
                          <option value="Đắk Lắk" />
                          <option value="Đắk Nông" />
                          <option value="Điện Biên" />
                          <option value="Đồng Tháp" />
                          <option value="Gia Lai" />
                          <option value="Hà Giang" />
                          <option value="Hà Nam" />
                          <option value="Hà Tĩnh" />
                          <option value="Hải Dương" />
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
                          <option value="Trà Vinh" />
                          <option value="Tuyên Quang" />
                          <option value="Vĩnh Long" />
                          <option value="Vĩnh Phúc" />
                          <option value="Yên Bái" />
                        </datalist>
                      </div>
                    </div>

                    <div className="fg" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Địa chỉ chi tiết trụ sở chính <span style={{ color: 'var(--rose)' }}>*</span></label>
                      <input type="text" id="r-address" value={formData.address} onChange={handleInputChange} placeholder="Ví dụ: 45 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Mã Bưu điện (ZIP code)</label>
                        <input type="text" id="r-zip" value={formData.zip} onChange={handleInputChange} placeholder="Ví dụ: 100000" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Fanpage / LinkedIn doanh nghiệp</label>
                        <input type="text" id="r-social" value={formData.social} onChange={handleInputChange} placeholder="facebook.com/company" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>

                    <div className="fg" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Mô tả ngắn hoạt động kinh doanh <span style={{ color: 'var(--rose)' }}>*</span></label>
                      <textarea id="r-description" value={formData.description} onChange={handleInputChange} placeholder="Giới thiệu sơ lược sản phẩm, dịch vụ..." style={{ width: '100%', height: '100px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none', resize: 'vertical' }}></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-primary" onClick={() => handleNext(2)}>Tiếp tục <i className="ti ti-chevron-right"></i></button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Người đại diện */}
                {step === 2 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B', marginBottom: '1.25rem' }}><i className="ti ti-user" style={{ color: 'var(--primary)' }}></i> 2. Thông tin người đại diện giao thương</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Tên người đại diện <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input type="text" id="r-contact_name" value={formData.contact_name} onChange={handleInputChange} placeholder="Họ và tên người liên hệ" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Chức vụ tại doanh nghiệp <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input type="text" id="r-contact_pos" value={formData.contact_pos} onChange={handleInputChange} placeholder="Ví dụ: Giám đốc kinh doanh" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Email doanh nghiệp <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input type="email" id="r-email" value={formData.email} onChange={handleInputChange} placeholder="email@company.vn" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Số điện thoại liên hệ <span style={{ color: 'var(--rose)' }}>*</span></label>
                        <input type="tel" id="r-phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại di động" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                      </div>
                    </div>

                    <div className="fg" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Mục tiêu lớn nhất khi gia nhập AVG</label>
                      <input type="text" id="r-goal" value={formData.goal} onChange={handleInputChange} placeholder="Ví dụ: Tìm đối tác xuất khẩu nông sản sang Nhật" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div className="fg" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Biết tới AVG qua kênh nào?</label>
                      <select id="r-referral" value={formData.referral} onChange={handleInputChange} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                        <option value="">-- Chọn kênh giới thiệu --</option>
                        <option value="Mạng xã hội (Facebook, LinkedIn...)">Mạng xã hội (Facebook, LinkedIn...)</option>
                        <option value="Báo chí, truyền thông">Báo chí, truyền thông</option>
                        <option value="Được hội viên AVG giới thiệu">Được hội viên AVG giới thiệu</option>
                        <option value="Tìm kiếm Google">Tìm kiếm Google</option>
                        <option value="Hội thảo, sự kiện">Hội thảo, sự kiện</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button type="button" className="btn" onClick={() => setStep(1)}><i className="ti ti-chevron-left"></i> Quay lại</button>
                      <button type="button" className="btn btn-primary" onClick={() => handleNext(3)}>Tiếp tục <i className="ti ti-chevron-right"></i></button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Tài khoản & Chọn Gói */}
                {step === 3 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1E293B', marginBottom: '1.25rem' }}><i className="ti ti-lock" style={{ color: 'var(--primary)' }}></i> 3. Thiết lập tài khoản bảo mật & gói hội viên</div>

                    <div className="fg" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Email đăng nhập (Username) <span style={{ color: 'var(--rose)' }}>*</span></label>
                      <input type="text" value={formData.email} disabled style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', backgroundColor: '#F1F5F9', color: '#64748B' }} />
                      <div style={{ fontSize: '11px', color: 'var(--text-light-muted)', marginTop: '4px' }}>AVG sử dụng Email doanh nghiệp ở Bước 2 làm tên đăng nhập tài khoản.</div>
                    </div>

                    <div className="fg" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>Thiết lập Mật khẩu <span style={{ color: 'var(--rose)' }}>*</span></label>
                      <input type="password" id="r-password" value={formData.password} onChange={handleInputChange} placeholder="Mật khẩu chứa tối thiểu 8 ký tự" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '10px', display: 'block' }}>Chọn Gói dịch vụ gia nhập</label>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div 
                          onClick={() => handleSelectTier('Silver')}
                          style={{
                            border: formData.tier === 'Silver' ? '2px solid var(--primary)' : '1px solid #D8E2EF',
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: formData.tier === 'Silver' ? 'rgba(30,136,229,0.03)' : '#fff'
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>🪙 Silver</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Miễn phí</div>
                        </div>

                        <div 
                          onClick={() => handleSelectTier('Gold')}
                          style={{
                            border: formData.tier === 'Gold' ? '2px solid var(--amber)' : '1px solid #D8E2EF',
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: formData.tier === 'Gold' ? 'rgba(245,158,11,0.03)' : '#fff'
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>🏅 Gold</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>5.000.000đ/năm</div>
                        </div>

                        <div 
                          onClick={() => handleSelectTier('Platinum')}
                          style={{
                            border: formData.tier === 'Platinum' ? '2px solid var(--primary-light)' : '1px solid #D8E2EF',
                            borderRadius: '10px',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: formData.tier === 'Platinum' ? 'rgba(99,102,241,0.03)' : '#fff'
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>💎 Platinum</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>15.000.000đ/năm</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button type="button" className="btn" onClick={() => setStep(2)}><i className="ti ti-chevron-left"></i> Quay lại</button>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                          <>
                            <i className="ti ti-loader animate-spin"></i> Đang đăng ký...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-circle-check"></i> Đăng ký ngay
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 1.5rem' }}>
                <i className="ti ti-circle-check"></i>
              </div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Đăng ký hồ sơ thành công!</h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Hồ sơ doanh nghiệp <strong>{formData.name}</strong> đã được lưu trữ trên hệ thống AVG AI và đang chờ quản trị viên phê duyệt. Chúng tôi sẽ liên hệ sớm qua email <strong>{formData.email}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Quay lại Trang chủ</Link>
                <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}><i className="ti ti-login"></i> Đăng nhập ngay</Link>
              </div>
            </div>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
};
export default Register;
