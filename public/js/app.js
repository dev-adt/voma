/* BizHub — App JS (shared data + API helper) */

// ── Shared Data ──────────────────────────────────────────────
window.MEMBERS = [
  {id:1,name:'Công ty CP Vina Tech',initials:'VT',bg:'#E6F1FB',fg:'#0C447C',tier:'Platinum',industry:'Công nghệ thông tin',contact:'Trần Minh Đức',email:'duc@vinatech.vn',phone:'0901 111 222',address:'45 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',web:'vinatech.vn',desc:'Phát triển phần mềm ERP, CRM cho thị trường Đông Nam Á. Đội ngũ 120 kỹ sư.',status:'pending',date:'24/06/2025'},
  {id:2,name:'Hoàng Long Export',initials:'HL',bg:'#EAF3DE',fg:'#27500A',tier:'Gold',industry:'Xuất nhập khẩu',contact:'Nguyễn Thu Hà',email:'ha@hoanglong.com',phone:'0912 333 444',address:'123 Lê Duẩn, Hai Bà Trưng, Hà Nội',web:'hoanglong.com',desc:'Xuất khẩu nông sản, thủy sản sang EU, Nhật Bản, Hàn Quốc. Kim ngạch 5 triệu USD/năm.',status:'pending',date:'23/06/2025'},
  {id:3,name:'BĐS Phú Thịnh',initials:'PT',bg:'#FAEEDA',fg:'#633806',tier:'Silver',industry:'Bất động sản',contact:'Lê Quang Khải',email:'khai@phuthinhbds.vn',phone:'0933 555 666',address:'89 Nguyễn Chí Thanh, Đống Đa, Hà Nội',web:'',desc:'Phân phối BĐS khu vực Hà Nội và các tỉnh phía Bắc.',status:'pending',date:'22/06/2025'},
  {id:4,name:'Dược phẩm Sao Mai',initials:'SM',bg:'#EEEDFE',fg:'#3C3489',tier:'Platinum',industry:'Y tế & Sức khỏe',contact:'Phạm Lan Anh',email:'lananh@saomai.vn',phone:'0944 777 888',address:'56 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',web:'saomai.vn',desc:'Sản xuất và phân phối dược phẩm, thực phẩm chức năng toàn quốc.',status:'approved',date:'18/06/2025'},
  {id:5,name:'Giáo dục Ánh Dương',initials:'AD',bg:'#E1F5EE',fg:'#085041',tier:'Gold',industry:'Giáo dục & Đào tạo',contact:'Hoàng Văn Minh',email:'minh@anhdung.edu.vn',phone:'0955 888 999',address:'12 Nguyễn Du, Hai Bà Trưng, Hà Nội',web:'anhdung.edu.vn',desc:'Hệ thống giáo dục K12 và luyện thi đại học với 15 cơ sở toàn quốc.',status:'approved',date:'15/06/2025'},
  {id:6,name:'Fintech VN Partners',initials:'FV',bg:'#FAECE7',fg:'#712B13',tier:'Gold',industry:'Dịch vụ tài chính',contact:'Vũ Thị Mai',email:'mai@fintechvn.com',phone:'0966 999 000',address:'78 Kim Mã, Ba Đình, Hà Nội',web:'fintechvn.com',desc:'Cung cấp giải pháp thanh toán số, cho vay P2P và quản lý tài sản.',status:'approved',date:'20/06/2025'},
];

window.POSTS = [
  {id:1,memberId:1,company:'Vina Tech',initials:'VT',bg:'#E6F1FB',fg:'#0C447C',title:'Tìm đối tác triển khai ERP khu vực miền Trung',summary:'Vina Tech cần đối tác có kinh nghiệm CNTT để triển khai ERP tại Đà Nẵng.',body:'Vina Tech đang tìm kiếm đối tác chiến lược để cùng triển khai giải pháp ERP tại khu vực miền Trung.\n\nYêu cầu đối tác:\n- Có đội ngũ kỹ thuật từ 5 người trở lên\n- Kinh nghiệm triển khai phần mềm doanh nghiệp\n- Có văn phòng tại Đà Nẵng\n\nChúng tôi cung cấp hoa hồng hấp dẫn và đào tạo kỹ thuật miễn phí.',type:'Tìm kiếm đối tác',contact:'duc@vinatech.vn | 0901 111 222',tags:['ERP','phần mềm','B2B'],status:'pending',date:'22/06/2025'},
  {id:2,memberId:2,company:'Hoàng Long',initials:'HL',bg:'#EAF3DE',fg:'#27500A',title:'Cần nhà cung cấp gạo ST25 số lượng lớn',summary:'Thu mua gạo ST25 chất lượng cao để xuất khẩu, 50 tấn/tháng.',body:'Công ty Hoàng Long đang thu mua gạo ST25 phục vụ xuất khẩu sang Nhật Bản và Hàn Quốc.\n\nYêu cầu:\n- Gạo ST25 đúng chủng loại, có giấy chứng nhận\n- Số lượng tối thiểu 50 tấn/tháng\n- Độ ẩm ≤ 14%',type:'Cần mua / Cần bán',contact:'ha@hoanglong.com | 0912 333 444',tags:['gạo ST25','xuất khẩu'],status:'pending',date:'21/06/2025'},
  {id:3,memberId:4,company:'Sao Mai',initials:'SM',bg:'#EEEDFE',fg:'#3C3489',title:'Hội thảo dược phẩm Q3 2025 — 15/07 tại Hà Nội',summary:'Mời hội viên tham dự hội thảo dược phẩm quy mô 500 người.',body:'Kính mời các hội viên tham dự Hội thảo Dược phẩm Q3 2025.\n\nThời gian: 8h00 ngày 15/07/2025\nĐịa điểm: Trung tâm Hội nghị Quốc gia, Hà Nội\nQuy mô: 500+ đại biểu',type:'Thông báo sự kiện',contact:'lananh@saomai.vn',tags:['sự kiện','dược phẩm'],status:'approved',date:'20/06/2025'},
  {id:4,memberId:5,company:'Ánh Dương',initials:'AD',bg:'#E1F5EE',fg:'#085041',title:'Tuyển giáo viên tiếng Anh cấp THPT',summary:'Tuyển 5 giáo viên tiếng Anh THPT, thu nhập 20-35 triệu/tháng.',body:'Hệ thống Ánh Dương tuyển dụng giáo viên tiếng Anh.\n\nYêu cầu:\n- Bằng đại học sư phạm Anh hoặc tương đương\n- IELTS 7.0+ hoặc TOEFL 100+\n- Kinh nghiệm giảng dạy THPT từ 2 năm',type:'Tuyển dụng',contact:'minh@anhdung.edu.vn',tags:['tuyển dụng','giáo viên'],status:'approved',date:'19/06/2025'},
];

window.EVENTS = [
  {title:'Hội nghị xuất khẩu ASEAN 2025',date:'15/07/2025',loc:'Hà Nội',org:'Hoàng Long Export'},
  {title:'Vietnam Tech Expo 2025',date:'22/07/2025',loc:'TP. Hồ Chí Minh',org:'Vina Tech'},
  {title:'Diễn đàn doanh nhân BizHub Q3',date:'05/08/2025',loc:'Đà Nẵng',org:'BizHub'},
];

// ── AI Config (lưu trong localStorage) ───────────────────────
window.getAIConfig = () => JSON.parse(localStorage.getItem('bizhub_ai_config') || '{"provider":"anthropic","model":"claude-sonnet-4-6"}');
window.setAIConfig = (cfg) => localStorage.setItem('bizhub_ai_config', JSON.stringify(cfg));

// ── Gọi AI qua backend proxy ──────────────────────────────────
window.callAI = async (messages, systemPrompt, sessionId) => {
  const cfg = window.getAIConfig();
  const headers = { 'Content-Type': 'application/json' };
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      provider: cfg.provider,
      model:    cfg.model,
      system:   systemPrompt,
      messages: messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json(); // { text, usage }
};

// ── Build system prompt từ dữ liệu hội viên ──────────────────
window.buildSysPrompt = () => `Bạn là trợ lý AI của BizHub — nền tảng hội viên doanh nghiệp Việt Nam. Trả lời ngắn gọn, thân thiện, đúng trọng tâm bằng tiếng Việt.

HỘI VIÊN (${MEMBERS.length} thành viên đang hoạt động):
${MEMBERS.map(m=>`• ${m.name} [${m.tier}] — ${m.industry}: ${m.desc} Liên hệ: ${m.email} | ${m.phone}`).join('\n')}

BÀI VIẾT MỚI NHẤT:
${POSTS.map(p=>`• [${p.type}] "${p.title}" — ${p.company} (${p.contact})`).join('\n')}

SỰ KIỆN SẮP TỚI:
${EVENTS.map(e=>`• ${e.title} — ${e.date} tại ${e.loc} (${e.org})`).join('\n')}

GÓI HỘI VIÊN:
• Silver: Miễn phí — 3 bài/tháng, hồ sơ cơ bản
• Gold: 5.000.000đ/năm — 15 bài/tháng, sự kiện VIP, kết nối ưu tiên
• Platinum: 15.000.000đ/năm — không giới hạn bài, hồ sơ premium, AI riêng, đại sứ hội

Khi giới thiệu hội viên: nêu đủ tên, ngành, mô tả, liên hệ. Nếu không có thông tin: thành thật và gợi ý liên hệ admin@bizhub.vn.`;

// ── Helpers ───────────────────────────────────────────────────
window.tierBadge = (tier) => {
  const m={Platinum:['b-platinum','💎 Platinum'],Gold:['b-gold','🏅 Gold'],Silver:['b-silver','🪙 Silver']};
  const [cls,label]=m[tier]||['b-silver','Silver'];
  return `<span class="badge ${cls}">${label}</span>`;
};
window.statusBadge = (s) => {
  const m={pending:['b-pending','Chờ duyệt'],approved:['b-approved','Đã duyệt'],rejected:['b-rejected','Từ chối']};
  const [cls,label]=m[s]||['b-pending',s];
  return `<span class="badge ${cls}">${label}</span>`;
};
window.showToast = (msg,type='info') => {
  if(typeof showToast!=='undefined') return;
  let el=document.getElementById('global-toast');
  if(!el){el=document.createElement('div');el.id='global-toast';el.className='toast';document.body.appendChild(el);}
  el.className='toast show '+type;
  el.innerHTML=`<i class="ti ti-${type==='success'?'circle-check':type==='danger'?'circle-x':'info-circle'}"></i> ${msg}`;
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2800);
};

// ── Auth Management Helpers ────────────────────────────────────
window.getAuthToken = () => localStorage.getItem('bizhub_admin_token') || '';
window.setAuthToken = (token) => localStorage.setItem('bizhub_admin_token', token);
window.clearAuthToken = () => {
  localStorage.removeItem('bizhub_admin_token');
  localStorage.removeItem('bizhub_admin_user');
};
window.authHeaders = () => {
  const token = window.getAuthToken();
  return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};
window.checkAuthOrRedirect = async () => {
  const token = window.getAuthToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  try {
    const res = await fetch('/api/admin/check-auth', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      window.clearAuthToken();
      window.location.href = 'login.html';
      return false;
    }
    const data = await res.json();
    return data.admin;
  } catch {
    window.clearAuthToken();
    window.location.href = 'login.html';
    return false;
  }
};
window.logoutAdmin = async () => {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: window.authHeaders()
    });
  } catch {}
  window.clearAuthToken();
  window.location.href = 'login.html';
};

// Khởi tạo các tương tác Admin & Member trên DOM
document.addEventListener('DOMContentLoaded', () => {
  const av = document.getElementById('nav-av') || document.querySelector('.av-sm');
  if (av) {
    const adminToken = window.getAuthToken();
    const memberToken = localStorage.getItem('bizhub_member_token');

    if (adminToken) {
      // 1. Nếu là Admin đăng nhập
      av.style.cursor = 'pointer';
      av.title = 'Đăng xuất Admin';
      av.addEventListener('click', (e) => {
        // Nếu click vào thẻ a mà đang ở trang admin, thực hiện logout
        if (window.location.pathname.includes('admin')) {
          e.preventDefault();
          if (confirm('Bạn có muốn đăng xuất tài khoản Admin?')) {
            window.logoutAdmin();
          }
        }
      });
      
      const userStr = localStorage.getItem('bizhub_admin_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            av.textContent = initials;
          }
        } catch {}
      }
    } else if (memberToken) {
      // 2. Nếu là Hội viên đăng nhập
      av.style.cursor = 'pointer';
      av.title = 'Bảng điều khiển Hội viên';
      av.href = 'member-dashboard.html';
      
      const memberUserStr = localStorage.getItem('bizhub_member_user');
      if (memberUserStr) {
        try {
          const user = JSON.parse(memberUserStr);
          if (user && user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            av.textContent = initials;
          }
        } catch {}
      }
    } else {
      // 3. Nếu chưa đăng nhập ai cả, hướng người dùng về trang đăng nhập Hội viên
      av.href = 'member-login.html';
      av.title = 'Đăng nhập Hội viên';
      
      // Hướng cả icon chuông thông báo hoặc nút đăng nhập khác về member-login.html
      const bell = document.querySelector('.nav-right a[href="login.html"]');
      if (bell) {
        bell.href = 'member-login.html';
      }
      const navAv = document.getElementById('nav-av');
      if (navAv) {
        navAv.href = 'member-login.html';
      }
    }
  }
});
