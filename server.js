/**
 * BizHub AI — Backend Server (MySQL version)
 * Node.js + Express + MySQL2
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const fetch   = (...a) => import('node-fetch').then(({ default: f }) => f(...a));
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// Helper đọc API key động từ config.json hoặc file .env
function getAPIKey(provider) {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (cfg[provider + '_API_KEY']) {
        return cfg[provider + '_API_KEY'];
      }
    } catch (e) {
      console.error('Lỗi đọc config.json:', e.message);
    }
  }
  // Fallback về process.env
  const keys = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  };
  return keys[provider] || '';
}

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Tự động tạo bảng admin_sessions nếu chưa có
db.query(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  ) ENGINE=InnoDB COMMENT='Phiên đăng nhập admin'
`).then(() => {
  console.log('✅ Bảng admin_sessions đã sẵn sàng');
}).catch(err => {
  console.error('❌ Lỗi tạo bảng admin_sessions:', err.message);
});

// Tự động nâng cấp bảng members và tạo bảng member_sessions
(async () => {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM members LIKE 'username'");
    if (!cols.length) {
      await db.query("ALTER TABLE members ADD COLUMN username VARCHAR(100) UNIQUE AFTER email");
      await db.query("ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) AFTER username");
      console.log('✅ Đã nâng cấp bảng members (thêm cột username, password_hash)');
    }
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS member_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      ) ENGINE=InnoDB COMMENT='Phiên đăng nhập hội viên'
    `);
    console.log('✅ Bảng member_sessions đã sẵn sàng');

    // Thêm cột member_id vào chat_logs để phân tách lịch sử chat theo tài khoản
    const [chatCols] = await db.query("SHOW COLUMNS FROM chat_logs LIKE 'member_id'");
    if (!chatCols.length) {
      await db.query("ALTER TABLE chat_logs ADD COLUMN member_id INT DEFAULT NULL AFTER session_id");
      await db.query("ALTER TABLE chat_logs ADD INDEX idx_member (member_id)");
      console.log('✅ Đã thêm cột member_id vào bảng chat_logs');
    }
  } catch (err) {
    console.error('❌ Lỗi khởi tạo DB hội viên:', err.message);
  }
})();

// Giới hạn phân hạng Tier
const TIER_LIMITS = {
  Silver:   { posts_per_month: 3,  chats_per_day: 5 },
  Gold:     { posts_per_month: 15, chats_per_day: 50 },
  Platinum: { posts_per_month: Infinity, chats_per_day: Infinity }
};

// Middleware xác thực Admin bằng token
async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc thiếu token.' });
  }

  const token = authHeader.substring(7);
  try {
    const [sessions] = await db.query(
      `SELECT s.*, a.username, a.name, a.role 
       FROM admin_sessions s 
       JOIN admins a ON s.admin_id = a.id 
       WHERE s.token = ? AND s.expires_at > NOW()`, 
      [token]
    );

    if (!sessions.length) {
      return res.status(401).json({ success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }

    req.admin = {
      id: sessions[0].admin_id,
      username: sessions[0].username,
      name: sessions[0].name,
      role: sessions[0].role,
      token: token
    };
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi xác thực: ' + err.message });
  }
}

// Middleware xác thực Hội viên bằng token
async function memberAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Chưa đăng nhập hoặc thiếu token hội viên.' });
  }

  const token = authHeader.substring(7);
  try {
    const [sessions] = await db.query(
      `SELECT s.*, m.name, m.email, m.status, m.tier
       FROM member_sessions s 
       JOIN members m ON s.member_id = m.id 
       WHERE s.token = ? AND s.expires_at > NOW()`, 
      [token]
    );

    if (!sessions.length) {
      return res.status(401).json({ success: false, error: 'Phiên đăng nhập hội viên không hợp lệ hoặc đã hết hạn.' });
    }

    req.member = {
      id: sessions[0].member_id,
      name: sessions[0].name,
      email: sessions[0].email,
      status: sessions[0].status,
      tier: sessions[0].tier,
      token: token
    };
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi xác thực hội viên: ' + err.message });
  }
}

// Middleware xác thực hỗn hợp (Admin HOẶC Member) — dùng cho AI Chat
async function anyAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để sử dụng tính năng này.' });
  }

  const token = authHeader.substring(7);
  try {
    // Thử xác thực Member trước
    const [memberSessions] = await db.query(
      `SELECT s.*, m.name, m.email, m.status, m.tier, m.id as mid
       FROM member_sessions s JOIN members m ON s.member_id = m.id
       WHERE s.token = ? AND s.expires_at > NOW()`, [token]
    );
    if (memberSessions.length) {
      req.authUser = {
        type: 'member',
        id: memberSessions[0].mid,
        name: memberSessions[0].name,
        email: memberSessions[0].email,
        status: memberSessions[0].status,
        tier: memberSessions[0].tier
      };
      return next();
    }

    // Fallback: thử xác thực Admin
    const [adminSessions] = await db.query(
      `SELECT s.*, a.username, a.name, a.role
       FROM admin_sessions s JOIN admins a ON s.admin_id = a.id
       WHERE s.token = ? AND s.expires_at > NOW()`, [token]
    );
    if (adminSessions.length) {
      req.authUser = {
        type: 'admin',
        id: adminSessions[0].admin_id,
        name: adminSessions[0].name,
        tier: 'Platinum' // Admin không bị giới hạn
      };
      return next();
    }

    return res.status(401).json({ success: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi xác thực: ' + err.message });
  }
}


// ════════════════════════════════════════════
// UNIFIED AUTH API
// ════════════════════════════════════════════

// Đăng nhập Hợp nhất (Unified Login for Admin & Member)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp tài khoản và mật khẩu.' });
    }

    // 1. Thử tìm trong bảng admins trước
    const [adminRows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        // Cấp token Admin
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ
        await db.query(
          'INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)',
          [admin.id, token, expiresAt]
        );
        await db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
        return res.json({
          success: true,
          role: 'admin',
          token,
          user: {
            username: admin.username,
            name: admin.name,
            role: admin.role
          }
        });
      }
    }

    // 2. Thử tìm trong bảng members nếu không khớp admin
    const [memberRows] = await db.query('SELECT * FROM members WHERE username = ? OR email = ?', [username, username]);
    if (memberRows.length > 0) {
      const member = memberRows[0];
      if (!member.password_hash) {
        return res.status(401).json({ success: false, error: 'Tài khoản chưa được kích hoạt mật khẩu. Vui lòng liên hệ ban quản trị.' });
      }
      const match = await bcrypt.compare(password, member.password_hash);
      if (match) {
        // Cấp token Member
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
        await db.query(
          'INSERT INTO member_sessions (member_id, token, expires_at) VALUES (?, ?, ?)',
          [member.id, token, expiresAt]
        );
        return res.json({
          success: true,
          role: 'member',
          token,
          user: {
            id: member.id,
            name: member.name,
            email: member.email,
            status: member.status,
            tier: member.tier
          }
        });
      }
    }

    // 3. Không tìm thấy hoặc mật khẩu không chính xác
    return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ════════════════════════════════════════════
// ADMIN AUTH API
// ════════════════════════════════════════════

// Đăng nhập Admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp username và password.' });
    }

    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    // Tạo token ngẫu nhiên và lưu phiên làm việc
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

    await db.query(
      'INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)',
      [admin.id, token, expiresAt]
    );

    // Cập nhật last_login
    await db.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    res.json({
      success: true,
      token,
      admin: {
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Đăng xuất Admin
app.post('/api/admin/logout', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM admin_sessions WHERE token = ?', [req.admin.token]);
    res.json({ success: true, message: 'Đăng xuất thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kiểm tra trạng thái Auth
app.get('/api/admin/check-auth', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ════════════════════════════════════════════
// MEMBER AUTH & PROFILE API
// ════════════════════════════════════════════

// Đăng nhập Hội viên
app.post('/api/member/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp tài khoản và mật khẩu.' });
    }

    const [rows] = await db.query('SELECT * FROM members WHERE username = ? OR email = ?', [username, username]);
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const member = rows[0];
    
    if (!member.password_hash) {
      return res.status(401).json({ success: false, error: 'Tài khoản chưa được kích hoạt mật khẩu. Vui lòng liên hệ ban quản trị.' });
    }

    const match = await bcrypt.compare(password, member.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

    await db.query(
      'INSERT INTO member_sessions (member_id, token, expires_at) VALUES (?, ?, ?)',
      [member.id, token, expiresAt]
    );

    res.json({
      success: true,
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        status: member.status,
        tier: member.tier
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Đăng xuất Hội viên
app.post('/api/member/logout', memberAuthMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM member_sessions WHERE token = ?', [req.member.token]);
    res.json({ success: true, message: 'Đăng xuất thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kiểm tra trạng thái Auth Hội viên
app.get('/api/member/check-auth', memberAuthMiddleware, (req, res) => {
  res.json({ success: true, member: req.member });
});

// Xem Hồ sơ Hội viên đang đăng nhập
app.get('/api/member/profile', memberAuthMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [req.member.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cập nhật Hồ sơ Hội viên
app.put('/api/member/profile', memberAuthMiddleware, async (req, res) => {
  try {
    const {
      name, tax_code, license, industry, size, address, website, social,
      description, contact_name, contact_pos, phone, goal, password
    } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Tên doanh nghiệp không được trống.' });

    let sql = `UPDATE members SET 
      name=?, tax_code=?, license=?, industry=?, size=?, address=?, website=?, social=?, 
      description=?, contact_name=?, contact_pos=?, phone=?, goal=?`;
    const params = [
      name, tax_code || '', license || '', industry || '', size || '', address || '', website || '', social || '',
      description || '', contact_name || '', contact_pos || '', phone || '', goal || ''
    ];

    if (password && password.trim() !== '') {
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Mật khẩu phải tối thiểu 8 ký tự.' });
      }
      const hash = await bcrypt.hash(password, 10);
      sql += `, password_hash=?`;
      params.push(hash);
    }

    sql += ` WHERE id=?`;
    params.push(req.member.id);

    await db.query(sql, params);
    res.json({ success: true, message: 'Đã cập nhật hồ sơ doanh nghiệp thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Xem thông tin Dashboard và tin đăng của Hội viên
app.get('/api/member/dashboard', memberAuthMiddleware, async (req, res) => {
  try {
    const memberId = req.member.id;
    const [memberRows] = await db.query('SELECT * FROM members WHERE id = ?', [memberId]);
    if (!memberRows.length) return res.status(404).json({ success: false, error: 'Không tìm thấy dữ liệu hội viên.' });

    const [postRows] = await db.query(
      'SELECT id, title, type, status, views, created_at FROM posts WHERE member_id = ? ORDER BY created_at DESC',
      [memberId]
    );

    const [[viewsStats]] = await db.query('SELECT SUM(views) AS total_views FROM posts WHERE member_id = ?', [memberId]);

    res.json({
      success: true,
      member: memberRows[0],
      posts: postRows,
      stats: {
        total_posts: postRows.length,
        approved_posts: postRows.filter(p => p.status === 'approved').length,
        pending_posts: postRows.filter(p => p.status === 'pending').length,
        total_views: viewsStats.total_views || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Lưu cấu hình và API key của AI Provider
app.post('/api/admin/save-config', authMiddleware, async (req, res) => {
  const { provider, model, apiKey } = req.body;
  if (!provider || !model) {
    return res.status(400).json({ error: 'Thiếu thông tin provider hoặc model.' });
  }

  try {
    // 1. Lưu provider/model vào bảng ai_config trong DB
    await db.query('DELETE FROM ai_config'); // chỉ lưu 1 dòng hoạt động duy nhất
    await db.query('INSERT INTO ai_config (provider, model, is_active) VALUES (?, ?, 1)', [provider, model]);

    // 2. Nếu có nhập apiKey, lưu đè vào file config.json
    if (apiKey && apiKey !== '(key đã lưu)' && apiKey !== '**************************************' && apiKey.trim() !== '') {
      const configPath = path.join(__dirname, 'config.json');
      let cfg = {};
      if (fs.existsSync(configPath)) {
        try {
          cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch {}
      }
      cfg[provider + '_API_KEY'] = apiKey.trim();
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
    }

    res.json({ success: true, message: 'Đã lưu cấu hình và API key thành công.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy cấu hình AI hiện tại
app.get('/api/admin/get-config', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT provider, model FROM ai_config WHERE is_active = 1 LIMIT 1');
    const config = rows[0] || { provider: 'anthropic', model: 'claude-sonnet-4-6' };

    let hasKey = false;
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (cfg[config.provider + '_API_KEY']) {
          hasKey = true;
        }
      } catch {}
    }
    // Check fallback process.env
    if (!hasKey) {
      const key = getAPIKey(config.provider);
      if (key) hasKey = true;
    }

    res.json({ provider: config.provider, model: config.model, hasKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════
app.get('/api/health', async (req, res) => {
  let dbOk = false;
  try { await db.query('SELECT 1'); dbOk = true; } catch {}
  res.json({
    status   : 'ok',
    time     : new Date().toISOString(),
    database : dbOk ? 'connected' : 'error',
    providers: {
      anthropic  : !!process.env.ANTHROPIC_API_KEY,
      openai     : !!process.env.OPENAI_API_KEY,
      gemini     : !!process.env.GEMINI_API_KEY,
      deepseek   : !!process.env.DEEPSEEK_API_KEY,
      openrouter : !!process.env.OPENROUTER_API_KEY,
      ollama     : !!process.env.OLLAMA_BASE_URL,
    },
  });
});

// ════════════════════════════════════════════
// MEMBERS API
// ════════════════════════════════════════════

// Lấy danh sách hội viên
app.get('/api/members', async (req, res) => {
  try {
    const { status, tier, industry, search } = req.query;

    // Kiểm tra quyền truy cập nâng cao
    let isAuthenticated = false;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const [adminSess] = await db.query('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()', [token]);
      if (adminSess.length) { isAuthenticated = true; }
      else {
        const [memberSess] = await db.query(
          `SELECT s.id FROM member_sessions s JOIN members m ON s.member_id = m.id WHERE s.token = ? AND s.expires_at > NOW() AND m.status = 'approved'`, [token]
        );
        if (memberSess.length) { isAuthenticated = true; }
      }
    }

    // Nếu muốn xem danh sách chưa duyệt/tất cả -> Chỉ cho phép admin đã xác thực
    if (status !== 'approved' && !isAuthenticated) {
      return res.status(401).json({ success: false, error: 'Cần quyền Admin để xem danh sách này.' });
    }

    let sql = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (status)   { sql += ' AND status = ?';   params.push(status); }
    if (tier)     { sql += ' AND tier = ?';     params.push(tier); }
    if (industry) { sql += ' AND industry = ?'; params.push(industry); }
    if (search)   {
      sql += ' AND (name LIKE ? OR email LIKE ? OR tax_code LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, params);

    // Ẩn thông tin liên hệ nhạy cảm cho khách vãng lai
    const safeRows = isAuthenticated ? rows : rows.map(m => {
      const { email, phone, contact_name, contact_pos, password_hash, username, ...safe } = m;
      return { ...safe, email: '***@***.***', phone: '09** *** ***', contact_name: '***', contact_pos: '***' };
    });

    res.json({ success: true, data: safeRows, total: safeRows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy 1 hội viên
app.get('/api/members/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Không tìm thấy hội viên.' });

    // Nếu hội viên chưa được duyệt, chỉ cho phép admin đã đăng nhập xem
    if (rows[0].status !== 'approved') {
      const authHeader = req.headers['authorization'];
      let isAdmin = false;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const [sessions] = await db.query('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()', [token]);
        if (sessions.length) isAdmin = true;
      }
      if (!isAdmin) {
        return res.status(401).json({ success: false, error: 'Chưa đăng ký hoặc không có quyền xem thông tin này.' });
      }
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Đăng ký hội viên mới
app.post('/api/members', async (req, res) => {
  try {
    const {
      name, tax_code, license, industry, size, address, website, social,
      description, tier, contact_name, contact_pos, email, phone, goal, referral, password
    } = req.body;

    if (!name || !email) return res.status(400).json({ success: false, error: 'Thiếu tên hoặc email.' });

    const [existing] = await db.query('SELECT id FROM members WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, error: 'Email này đã được đăng ký.' });

    let hash = null;
    if (password && password.trim() !== '') {
      hash = await bcrypt.hash(password, 10);
    }

    const [result] = await db.query(
      `INSERT INTO members (name, tax_code, license, industry, size, address, website, social,
        description, tier, status, contact_name, contact_pos, email, username, password_hash, phone, goal, referral)
       VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,?,?,?,?)`,
      [name, tax_code, license, industry, size, address, website, social,
       description, tier || 'Silver', contact_name, contact_pos, email, email, hash, phone, goal, referral]
    );
    res.json({ success: true, id: result.insertId, message: 'Đăng ký thành công! Chờ admin xét duyệt.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Duyệt hội viên
app.patch('/api/members/:id/approve', authMiddleware, async (req, res) => {
  try {
    await db.query("UPDATE members SET status='approved' WHERE id=?", [req.params.id]);
    res.json({ success: true, message: 'Đã duyệt hội viên.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Từ chối hội viên
app.patch('/api/members/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query("UPDATE members SET status='rejected', reject_reason=? WHERE id=?", [reason || '', req.params.id]);
    res.json({ success: true, message: 'Đã từ chối hội viên.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════
// POSTS API
// ════════════════════════════════════════════

// Lấy danh sách bài viết
app.get('/api/posts', async (req, res) => {
  try {
    const { status, member_id, search } = req.query;

    // Kiểm tra quyền truy cập
    let isAuthenticated = false;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const [adminSess] = await db.query('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()', [token]);
      if (adminSess.length) { isAuthenticated = true; }
      else {
        const [memberSess] = await db.query(
          `SELECT s.id FROM member_sessions s JOIN members m ON s.member_id = m.id WHERE s.token = ? AND s.expires_at > NOW() AND m.status = 'approved'`, [token]
        );
        if (memberSess.length) { isAuthenticated = true; }
      }
    }

    let sql = `SELECT p.*, m.name AS company_name, m.tier AS company_tier
               FROM posts p LEFT JOIN members m ON p.member_id = m.id WHERE 1=1`;
    const params = [];

    if (status)    { sql += ' AND p.status = ?';     params.push(status); }
    if (member_id) { sql += ' AND p.member_id = ?';  params.push(member_id); }
    if (search)    { sql += ' AND MATCH(p.title,p.summary,p.body) AGAINST(? IN BOOLEAN MODE)'; params.push(`*${search}*`); }
    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Ẩn contact_info cho khách vãng lai — chỉ trả về thông tin thật khi đã xác thực
    const safeRows = isAuthenticated ? rows : rows.map(p => ({
      ...p,
      contact_info: 'Đăng nhập hội viên để xem thông tin liên hệ'
    }));

    res.json({ success: true, data: safeRows, total: safeRows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Đăng bài mới — yêu cầu hội viên đã được duyệt
app.post('/api/posts', memberAuthMiddleware, async (req, res) => {
  try {
    if (req.member.status !== 'approved') {
      return res.status(403).json({ success: false, error: 'Hồ sơ hội viên chưa được phê duyệt. Vui lòng chờ admin duyệt trước khi đăng tin.' });
    }

    // Kiểm tra giới hạn số bài đăng trong tháng theo tier
    const tierLimit = TIER_LIMITS[req.member.tier] || TIER_LIMITS.Silver;
    if (tierLimit.posts_per_month !== Infinity) {
      const [[countRow]] = await db.query(
        `SELECT COUNT(*) AS cnt FROM posts WHERE member_id = ? AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())`,
        [req.member.id]
      );
      if (countRow.cnt >= tierLimit.posts_per_month) {
        return res.status(429).json({
          success: false,
          error: `Gói ${req.member.tier} chỉ được đăng tối đa ${tierLimit.posts_per_month} bài/tháng. Nâng cấp gói để đăng thêm.`
        });
      }
    }

    const { title, summary, body, type, category, tags, contact_info, deadline } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Tiêu đề bài đăng không được trống.' });

    const [result] = await db.query(
      `INSERT INTO posts (member_id, title, summary, body, type, category, tags, contact_info, deadline, status)
       VALUES (?,?,?,?,?,?,?,?,?,'pending')`,
      [req.member.id, title, summary, body, type, category, JSON.stringify(tags || []), contact_info, deadline || null]
    );
    res.json({ success: true, id: result.insertId, message: 'Bài viết đã gửi để admin duyệt.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Duyệt bài viết
app.patch('/api/posts/:id/approve', authMiddleware, async (req, res) => {
  try {
    await db.query("UPDATE posts SET status='approved', published_at=NOW() WHERE id=?", [req.params.id]);
    res.json({ success: true, message: 'Đã xuất bản bài viết.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Từ chối bài viết
app.patch('/api/posts/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query("UPDATE posts SET status='rejected', reject_reason=? WHERE id=?", [reason || '', req.params.id]);
    res.json({ success: true, message: 'Đã từ chối bài viết.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════
// EVENTS API
// ════════════════════════════════════════════
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE status != 'cancelled' ORDER BY event_date ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy số liệu công khai cho trang chủ
app.get('/api/public-stats', async (req, res) => {
  try {
    const [[memberStats]] = await db.query("SELECT COUNT(*) AS total FROM members WHERE status='approved'");
    const [[postStats]]   = await db.query("SELECT COUNT(*) AS total FROM posts WHERE status='approved'");
    const [[eventStats]]  = await db.query("SELECT COUNT(*) AS total FROM events WHERE status='upcoming' AND event_date >= CURDATE()");

    res.json({
      members: memberStats.total,
      posts: postStats.total,
      events: eventStats.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
// STATS API (Dashboard)
// ════════════════════════════════════════════
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const [[memberStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status='approved') AS approved,
        SUM(status='pending') AS pending,
        SUM(status='rejected') AS rejected
      FROM members`);
    const [[postStats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status='approved') AS published,
        SUM(status='pending') AS pending
      FROM posts`);
    const [[eventStats]] = await db.query(`
      SELECT COUNT(*) AS upcoming FROM events WHERE status='upcoming' AND event_date >= CURDATE()`);

    res.json({
      success: true,
      members: memberStats,
      posts  : postStats,
      events : eventStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════
// AI CHAT API
// ════════════════════════════════════════════

// Lấy danh sách các phiên chat — chỉ hiển thị phiên của người dùng đang đăng nhập
app.get('/api/chat/sessions', anyAuthMiddleware, async (req, res) => {
  try {
    const userId = req.authUser.id;
    const userType = req.authUser.type;
    const [rows] = await db.query(`
      SELECT 
        session_id, 
        MAX(created_at) as last_activity, 
        (SELECT content FROM chat_logs WHERE session_id = t.session_id ORDER BY id ASC LIMIT 1) as title
      FROM chat_logs t
      WHERE session_id != 'anonymous' AND member_id = ?
      GROUP BY session_id
      ORDER BY last_activity DESC
      LIMIT 50
    `, [userId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lấy toàn bộ lịch sử tin nhắn của một phiên chat — kiểm tra quyền sở hữu
app.get('/api/chat/history/:sessionId', anyAuthMiddleware, async (req, res) => {
  try {
    const userId = req.authUser.id;
    const [rows] = await db.query(
      'SELECT role, content, created_at FROM chat_logs WHERE session_id = ? AND member_id = ? ORDER BY id ASC',
      [req.params.sessionId, userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Xóa một phiên chat — chỉ cho phép xóa phiên thuộc sở hữu
app.delete('/api/chat/session/:sessionId', anyAuthMiddleware, async (req, res) => {
  try {
    const userId = req.authUser.id;
    await db.query('DELETE FROM chat_logs WHERE session_id = ? AND member_id = ?', [req.params.sessionId, userId]);
    res.json({ success: true, message: 'Đã xóa lịch sử trò chuyện thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chat', anyAuthMiddleware, async (req, res) => {
  // Kiểm tra hội viên phải được phê duyệt
  if (req.authUser.type === 'member' && req.authUser.status !== 'approved') {
    return res.status(403).json({ error: 'Hồ sơ hội viên chưa được phê duyệt. Vui lòng chờ admin duyệt trước khi sử dụng Trợ lý AI.' });
  }

  // Kiểm tra giới hạn chat theo tier
  const tierLimit = TIER_LIMITS[req.authUser.tier] || TIER_LIMITS.Silver;
  if (tierLimit.chats_per_day !== Infinity) {
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM chat_logs WHERE member_id = ? AND role = 'user' AND DATE(created_at) = CURDATE()`,
      [req.authUser.id]
    );
    if (countRow.cnt >= tierLimit.chats_per_day) {
      return res.status(429).json({
        error: `Gói ${req.authUser.tier} chỉ được hỏi tối đa ${tierLimit.chats_per_day} câu/ngày. Nâng cấp gói để sử dụng thêm.`
      });
    }
  }

  const { provider, model, messages, system, apiKey } = req.body;
  if (!provider || !model || !messages) {
    return res.status(400).json({ error: 'Thiếu provider, model hoặc messages.' });
  }

  const getRequestKey = (prov) => {
    if (apiKey && apiKey !== '(key đã lưu)' && apiKey !== '**************************************' && apiKey.trim() !== '') {
      return apiKey.trim();
    }
    return getAPIKey(prov);
  };

  // Lấy context hội viên từ DB cho AI
  let memberContext = system || '';
  if (!system) {
    try {
      const [members] = await db.query("SELECT name,tier,industry,description,email,phone FROM members WHERE status='approved'");
      const [posts]   = await db.query("SELECT p.title,p.type,p.contact_info,m.name AS company FROM posts p JOIN members m ON p.member_id=m.id WHERE p.status='approved' ORDER BY p.created_at DESC LIMIT 10");
      const [events]  = await db.query("SELECT title,event_date,location,organizer FROM events WHERE status='upcoming' ORDER BY event_date ASC LIMIT 5");

      memberContext = `Bạn là trợ lý AI của BizHub — nền tảng hội viên doanh nghiệp Việt Nam. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.

HỘI VIÊN (${members.length} thành viên):
${members.map(m => `• ${m.name} [${m.tier}] — ${m.industry}: ${m.description} Liên hệ: ${m.email} | ${m.phone}`).join('\n')}

BÀI VIẾT MỚI:
${posts.map(p => `• [${p.type}] "${p.title}" — ${p.company} (${p.contact_info})`).join('\n')}

SỰ KIỆN SẮP TỚI:
${events.map(e => `• ${e.title} — ${new Date(e.event_date).toLocaleDateString('vi-VN')} tại ${e.location}`).join('\n')}`;
    } catch (dbErr) {
      console.error('DB error building context:', dbErr.message);
    }
  }

  try {
    let result;

    if (provider === 'anthropic') {
      const activeKey = getRequestKey('anthropic');
      if (!activeKey) throw new Error('Chưa cấu hình API Key cho Anthropic.');
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': activeKey, 'anthropic-version': '2023-06-01' },
        body   : JSON.stringify({ model, max_tokens: 1024, system: memberContext, messages }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      result = { text: d.content?.[0]?.text || '', usage: { input: d.usage?.input_tokens, output: d.usage?.output_tokens } };
    }
    else if (provider === 'openai') {
      const activeKey = getRequestKey('openai');
      if (!activeKey) throw new Error('Chưa cấu hình API Key cho OpenAI.');
      const msgs = [{ role: 'system', content: memberContext }, ...messages];
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + activeKey },
        body   : JSON.stringify({ model, max_tokens: 1024, messages: msgs }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      result = { text: d.choices?.[0]?.message?.content || '', usage: { input: d.usage?.prompt_tokens, output: d.usage?.completion_tokens } };
    }
    else if (provider === 'gemini') {
      const activeKey = getRequestKey('gemini');
      if (!activeKey) throw new Error('Chưa cấu hình API Key cho Gemini.');
      const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ system_instruction: { parts: [{ text: memberContext }] }, contents, generationConfig: { maxOutputTokens: 1024 } }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      result = { text: d.candidates?.[0]?.content?.parts?.[0]?.text || '', usage: { input: d.usageMetadata?.promptTokenCount, output: d.usageMetadata?.candidatesTokenCount } };
    }
    else if (provider === 'deepseek') {
      const activeKey = getRequestKey('deepseek');
      if (!activeKey) throw new Error('Chưa cấu hình API Key cho DeepSeek.');
      const msgs = [{ role: 'system', content: memberContext }, ...messages];
      const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + activeKey },
        body   : JSON.stringify({ model, max_tokens: 1024, messages: msgs }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      result = { text: d.choices?.[0]?.message?.content || '', usage: { input: d.usage?.prompt_tokens, output: d.usage?.completion_tokens } };
    }
    else if (provider === 'openrouter') {
      const activeKey = getRequestKey('openrouter');
      if (!activeKey) throw new Error('Chưa cấu hình API Key cho OpenRouter.');
      const msgs = [{ role: 'system', content: memberContext }, ...messages];
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + activeKey, 'HTTP-Referer': process.env.SITE_URL || 'https://bizhub.vn', 'X-Title': 'BizHub AI' },
        body   : JSON.stringify({ model, max_tokens: 1024, messages: msgs }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      result = { text: d.choices?.[0]?.message?.content || '', usage: { input: d.usage?.prompt_tokens, output: d.usage?.completion_tokens } };
    }
    else if (provider === 'ollama') {
      const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const msgs = [{ role: 'system', content: memberContext }, ...messages];
      const r = await fetch(`${base}/api/chat`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ model, stream: false, messages: msgs }),
      });
      const d = await r.json();
      result = { text: d.message?.content || '', usage: { input: d.prompt_eval_count, output: d.eval_count } };
    }
    else {
      return res.status(400).json({ error: `Provider "${provider}" không hỗ trợ.` });
    }

    // Lưu chat log kèm member_id để phân tách lịch sử
    try {
      const sessionId = req.headers['x-session-id'] || 'anonymous';
      const userId = req.authUser.id;
      const lastMsg = messages[messages.length - 1];
      await db.query('INSERT INTO chat_logs (session_id,member_id,role,content,provider,model,tokens_in,tokens_out) VALUES (?,?,?,?,?,?,?,?)',
        [sessionId, userId, 'user', lastMsg?.content || '', provider, model, 0, 0]);
      await db.query('INSERT INTO chat_logs (session_id,member_id,role,content,provider,model,tokens_in,tokens_out) VALUES (?,?,?,?,?,?,?,?)',
        [sessionId, userId, 'assistant', result.text, provider, model, result.usage?.input || 0, result.usage?.output || 0]);
    } catch {}

    res.json(result);
  } catch (err) {
    console.error(`[${provider}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
// SPA Fallback
// ════════════════════════════════════════════
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ BizHub server đang chạy tại http://localhost:${PORT}`);
});
