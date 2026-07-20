-- ── Bảng hội viên ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL COMMENT 'Tên doanh nghiệp',
  tax_code      VARCHAR(20)  COMMENT 'Mã số thuế',
  license       VARCHAR(50)  COMMENT 'Số giấy phép kinh doanh',
  industry      VARCHAR(100) COMMENT 'Ngành nghề',
  size          VARCHAR(50)  COMMENT 'Quy mô nhân sự',
  address       TEXT         COMMENT 'Địa chỉ',
  website       VARCHAR(255) COMMENT 'Website',
  social        VARCHAR(255) COMMENT 'Fanpage / LinkedIn',
  description   TEXT         COMMENT 'Mô tả hoạt động',
  tier          ENUM('Silver','Gold','Platinum') DEFAULT 'Silver' COMMENT 'Gói hội viên',
  status        ENUM('pending','approved','rejected') DEFAULT 'pending',
  contact_name  VARCHAR(100) COMMENT 'Tên người đại diện',
  contact_pos   VARCHAR(100) COMMENT 'Chức vụ',
  email         VARCHAR(255) NOT NULL COMMENT 'Email liên hệ',
  phone         VARCHAR(20)  COMMENT 'Số điện thoại',
  goal          TEXT         COMMENT 'Mục tiêu tham gia',
  referral      VARCHAR(100) COMMENT 'Biết đến qua kênh nào',
  reject_reason TEXT         COMMENT 'Lý do từ chối',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_tier (tier),
  INDEX idx_industry (industry)
) ENGINE=InnoDB COMMENT='Danh sách hội viên';

-- ── Bảng bài viết ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL COMMENT 'ID hội viên đăng bài',
  title         VARCHAR(500) NOT NULL COMMENT 'Tiêu đề bài viết',
  summary       TEXT         COMMENT 'Tóm tắt',
  body          LONGTEXT     COMMENT 'Nội dung chi tiết',
  type          VARCHAR(100) COMMENT 'Loại bài (Tìm đối tác, Sự kiện...)',
  category      VARCHAR(100) COMMENT 'Danh mục ngành',
  tags          TEXT         COMMENT 'Từ khoá (JSON array)',
  contact_info  VARCHAR(255) COMMENT 'Thông tin liên hệ',
  deadline      DATE         COMMENT 'Hạn liên hệ',
  status        ENUM('draft','pending','approved','rejected') DEFAULT 'pending',
  views         INT DEFAULT 0,
  reject_reason TEXT         COMMENT 'Lý do từ chối',
  published_at  TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_member (member_id),
  FULLTEXT idx_search (title, summary, body)
) ENGINE=InnoDB COMMENT='Bài viết của hội viên';

-- ── Bảng sự kiện ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  event_date    DATE         NOT NULL,
  location      VARCHAR(255),
  organizer     VARCHAR(255) COMMENT 'Đơn vị tổ chức',
  capacity      INT          COMMENT 'Số lượng tham dự tối đa',
  status        ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Sự kiện của hội';

-- ── Bảng admin ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  name          VARCHAR(100),
  email         VARCHAR(255),
  role          ENUM('superadmin','admin','moderator') DEFAULT 'admin',
  last_login    TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Tài khoản admin';

-- ── Bảng cấu hình AI ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_config (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  provider      VARCHAR(50)  NOT NULL COMMENT 'anthropic/openai/gemini...',
  model         VARCHAR(100) NOT NULL COMMENT 'Model ID',
  is_active     TINYINT(1) DEFAULT 1,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Cấu hình AI provider';

-- ── Bảng chat logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_id    VARCHAR(100) COMMENT 'Session ID',
  role          ENUM('user','assistant') NOT NULL,
  content       TEXT NOT NULL,
  provider      VARCHAR(50),
  model         VARCHAR(100),
  tokens_in     INT DEFAULT 0,
  tokens_out    INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id)
) ENGINE=InnoDB COMMENT='Lịch sử chat AI';

-- ============================================
-- DATA MẪU (xoá đi khi dùng thật)
-- ============================================

-- Admin mặc định (password: Admin@123)
INSERT INTO admins (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$3luJFH.EMVPnxeH8BdXn9.5tnCQ9huv13yzOzHrwYGiRhgV7dcufq', 'Quản trị viên', 'admin@bizhub.vn', 'superadmin');

-- Cấu hình AI mặc định
INSERT INTO ai_config (provider, model, is_active) VALUES ('openrouter', 'google/gemini-3-flash-preview', 1);
