# Voma AI — Hệ thống Kết nối Doanh nghiệp & Trợ lý AI

Voma là nền tảng kết nối giao thương B2B số hóa, chia sẻ cơ hội hợp tác đầu tư và tích hợp Trợ lý AI nghiệp vụ thông minh 24/7. Dự án hỗ trợ phân hạng thành viên (Silver, Gold, Platinum) linh hoạt và đa ngôn ngữ tự động (Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Nhật).

Dưới đây là tài liệu chi tiết giúp bạn cài đặt, phát triển và sao chép (clone) dự án này một cách nhanh chóng nhất.

---

## 🛠️ Yêu cầu Hệ thống
- **Hệ điều hành**: Ubuntu 20.04+ (hoặc Windows Server/Debian)
- **Node.js**: Phiên bản `>= 18`
- **Database**: MySQL `>= 5.7`
- **Quản lý quy trình**: PM2
- **Web Server**: Nginx

---

## 📁 Cấu trúc Thư mục Dự án

```text
voma.today/
├── server.js               # Express Backend API, xử lý Database & AI Proxy chính
├── schema.sql              # Cấu trúc bảng MySQL của toàn bộ hệ thống
├── .env.example            # Bản mẫu cấu hình biến môi trường
├── .env                    # Biến môi trường thực tế (Bị ignore, không commit lên git)
├── .gitignore              # Danh sách các tệp tin được Git bỏ qua
├── ecosystem.config.js     # Cấu hình khởi chạy và quản lý bằng PM2
├── nginx.conf              # Cấu hình reverse proxy mẫu cho Nginx
├── package.json            # Cấu hình dependencies của Backend
│
├── frontend/               # Mã nguồn ứng dụng Client (React Single Page App)
│   ├── src/                # Toàn bộ components, pages và contexts của React
│   ├── public/             # Tài nguyên tĩnh của React (Icon, Ảnh chụp màn hình Guide)
│   ├── vite.config.js      # Cấu hình trình biên dịch Vite
│   └── package.json        # Dependencies của React Frontend
│
├── public/                 # Thư mục đích nhận bundle biên dịch của React (Vite build)
│                           # Thư mục này được server.js phục vụ tĩnh trực tiếp.
└── img_guide/              # Thư mục chứa ảnh chụp màn hình cục bộ của trang Hướng dẫn
```

---

## 🚀 Quy trình Triển khai & Cài đặt (Deploy)

### Bước 1: Clone mã nguồn từ GitHub
```bash
git clone <url-repository-cua-ban> /var/www/voma.today
cd /var/www/voma.today
```

### Bước 2: Thiết lập Cơ sở dữ liệu MySQL
1. Đăng nhập vào trình quản lý MySQL của bạn (hoặc thông qua aaPanel / phpMyAdmin).
2. Tạo một cơ sở dữ liệu mới (ví dụ tên là: `voma_db`).
3. Import cấu trúc bảng từ tệp [schema.sql](schema.sql) để khởi tạo các bảng: `members`, `member_sessions`, `posts`, `events`, `event_interests`, v.v.

### Bước 3: Cấu hình Biến môi trường (.env)
Sao chép tệp cấu hình mẫu:
```bash
cp .env.example .env
nano .env
```
Điền đầy đủ thông tin kết nối MySQL và các API key cho AI:
- `PORT`: Cổng chạy backend server (mặc định: `3000`).
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Thông tin kết nối MySQL database của bạn.
- `OPENAI_API_KEY`, `OPENROUTER_API_KEY`...: Điền API key dịch vụ AI bạn muốn cung cấp.

### Bước 4: Cài đặt Dependencies & Biên dịch Frontend
Chạy lệnh cài đặt thư viện cho Backend và sau đó biên dịch mã nguồn Frontend:

```bash
# 1. Cài đặt thư viện của Backend tại thư mục gốc
npm install

# 2. Di chuyển vào thư mục frontend, cài đặt và build React thành tệp tĩnh
cd frontend
npm install
npm run build
cd ..
```
*Lưu ý*: Lệnh `npm run build` của Vite sẽ tự động xuất ra thư mục tĩnh `/public` ở thư mục gốc để `server.js` phục vụ trực tiếp cho Client.

### Bước 5: Khởi chạy ứng dụng với PM2
```bash
# Khởi chạy dịch vụ Node.js backend
pm2 start ecosystem.config.js

# Lưu trạng thái và cấu hình tự khởi động khi reboot VPS
pm2 save
pm2 startup
```
Kiểm tra trạng thái chạy:
```bash
pm2 status
pm2 logs voma-ai
```

### Bước 6: Cấu hình Nginx và SSL (HTTPS)
Sử dụng file mẫu [nginx.conf](nginx.conf) để cấu hình reverse proxy chuyển tiếp yêu cầu từ cổng `80` / `443` về cổng chạy nội bộ của Node.js (ví dụ: `3000`).
Cài đặt SSL miễn phí thông qua Let's Encrypt / Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ten-mien-cua-ban.com
```

---

## 📌 Các Tính năng Độc đáo Hỗ trợ Sao chép nhanh

### 1. Đa ngôn ngữ và Quy đổi ngoại tệ linh hoạt (`LanguageContext.jsx`)
Dự án tích hợp cơ chế đổi ngôn ngữ cục bộ bằng React context, không tốn token AI khi đổi ngôn ngữ.
- Khi chuyển đổi ngôn ngữ (VI, EN, ZH, JA), toàn bộ giao diện từ menu, chân trang, mô tả tính năng cho tới **giá tiền đăng ký các gói** đều được quy đổi sang đơn vị tiền tệ tương ứng theo tỷ giá thực tế (VND, USD, CNY, JPY) giúp hỗ trợ giao thương đa quốc gia.

### 2. Trang Hướng dẫn sử dụng Bản địa hóa (`Guide.jsx`)
- Trang hướng dẫn dạng tab chuyên nghiệp không dùng iframe Notion, giúp load trang siêu nhanh.
- Tích hợp hiệu ứng phóng to hình ảnh lightbox mượt mà khi click vào bất kỳ ảnh minh họa nào. Các ảnh được lấy trực tiếp tại thư mục tĩnh `/img_guide/`.

### 3. Tự động kiểm tra đồng bộ Cơ sở dữ liệu
- File `server.js` tích hợp các khối lệnh tự động kiểm tra xem các cột dữ liệu quan trọng như `city` (thành phố), `is_featured` (ghim nổi bật), `tier_expires_at` (thời hạn gói) đã tồn tại trong các bảng MySQL chưa. Nếu chưa có, server sẽ tự động chạy truy vấn `ALTER TABLE` để thêm cột mà không cần sếp phải chạy tay.

---

## 💡 Mẹo quản lý mã nguồn Git hữu ích khi phát triển

### Cách gỡ bỏ các file cấu hình hoặc hướng dẫn cục bộ khỏi Git (Không bị đẩy lên Github)
Nếu sếp có các tệp tin lưu ghi chú cá nhân (như file `.env`, file hướng dẫn deploy VPS, file test API) và đã lỡ commit lên GitHub, sếp hãy thực hiện:

1. Thêm tên file vào [.gitignore](.gitignore).
2. Chạy lệnh gỡ chỉ mục theo dõi của Git (không làm mất file vật lý trên máy):
   ```bash
   git rm --cached TÊN_FILE_CỦA_BẠN.md
   ```
3. Commit và push lại lên GitHub:
   ```bash
   git commit -m "Stop tracking ignored files"
   git push origin version3
   ```

### Khôi phục lại file cục bộ bị xóa nhầm do checkout nhánh
Nếu sau khi chuyển đổi nhánh, các file cục bộ đã bị bỏ qua (untracked) bị xóa mất, sếp chỉ cần chạy lệnh sau để kéo chúng lại từ lịch sử commit cũ:
```bash
git checkout <MÃ_COMMIT_TRƯỚC_ĐÓ> -- TÊN_FILE_1.md TÊN_FILE_2.js
git reset HEAD TÊN_FILE_1.md TÊN_FILE_2.js
```
Lúc này file sẽ xuất hiện trở lại trên máy tính của sếp và vẫn được bỏ qua hoàn toàn đối với Git!
