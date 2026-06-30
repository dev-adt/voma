# Kế hoạch Triển khai Toàn bộ Đề xuất Audit Report

Triển khai 5 bước nâng cấp bảo mật, phân quyền và logic nghiệp vụ theo báo cáo kiểm tra hệ thống.

---

## Proposed Changes

### Bước 1 — Bảo mật AI Chat & Phân tách lịch sử chat

#### [MODIFY] [server.js](file:///e:/ADT/bizhub-complete/server.js)

**1a. Thêm cột `member_id` vào bảng `chat_logs`:**
- Trong khối khởi tạo DB (dòng 64-87), thêm logic tự động `ALTER TABLE chat_logs ADD COLUMN member_id INT DEFAULT NULL` nếu chưa có.

**1b. Thêm middleware xác thực hỗn hợp (Admin hoặc Member):**
- Tạo hàm `anyAuthMiddleware` cho phép cả admin và member token — dùng để bảo vệ AI Chat APIs.

**1c. Bảo vệ API Chat:**
- `POST /api/chat`: Áp dụng `anyAuthMiddleware`. Lưu `member_id` (hoặc `admin_id`) vào `chat_logs` khi ghi log. Kiểm tra trạng thái hội viên phải là `approved`.
- `GET /api/chat/sessions`: Áp dụng `anyAuthMiddleware`. Lọc `WHERE member_id = ?` theo ID người dùng đang đăng nhập.
- `GET /api/chat/history/:sessionId`: Áp dụng `anyAuthMiddleware`. Kiểm tra phiên chat thuộc quyền sở hữu.
- `DELETE /api/chat/session/:sessionId`: Áp dụng `anyAuthMiddleware`. Chỉ cho phép xóa phiên thuộc sở hữu.

#### [MODIFY] [ai-chat.html](file:///e:/ADT/bizhub-complete/public/ai-chat.html)

- Thêm logic kiểm tra đăng nhập khi tải trang. Nếu không có token → hiển thị overlay yêu cầu đăng nhập thay vì hiển thị chat.
- Gửi kèm header `Authorization: Bearer <token>` trong tất cả fetch API chat (sessions, history, delete, chat).

#### [MODIFY] [app.js](file:///e:/ADT/bizhub-complete/public/js/app.js)

- Cập nhật hàm `callAI()` để gửi kèm token xác thực (ưu tiên member token, fallback admin token).

---

### Bước 2 — Bảo mật API Đăng tin B2B

#### [MODIFY] [server.js](file:///e:/ADT/bizhub-complete/server.js)

- Endpoint `POST /api/posts`: Áp dụng `memberAuthMiddleware`. Tự động gán `member_id = req.member.id` thay vì nhận từ body. Kiểm tra hội viên phải ở trạng thái `approved`.

---

### Bước 3 — Ẩn thông tin liên hệ với khách vãng lai

#### [MODIFY] [server.js](file:///e:/ADT/bizhub-complete/server.js)

- API `GET /api/members` (public, `status=approved`): Loại bỏ các cột nhạy cảm (`email`, `phone`, `contact_name`, `contact_pos`) khỏi kết quả trả về cho khách vãng lai. Nếu có token hợp lệ → trả đầy đủ.
- API `GET /api/posts` (public, `status=approved`): Che trường `contact_info` thành `"Đăng nhập hội viên để xem"` cho khách vãng lai.

#### [MODIFY] [index.html](file:///e:/ADT/bizhub-complete/public/index.html)

- Khi hiển thị Modal chi tiết cơ hội giao thương: Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập thay vì thông tin liên hệ.

---

### Bước 4 — Đăng tin giao thương trên Dashboard Hội viên

#### [MODIFY] [member-dashboard.html](file:///e:/ADT/bizhub-complete/public/member-dashboard.html)

- Thêm nút **"Đăng tin giao thương mới"** phía trên danh sách bài đăng.
- Tạo Modal đăng tin với form: Tiêu đề, Tóm tắt, Nội dung, Loại (select), Thông tin liên hệ.
- Gửi dữ liệu lên `POST /api/posts` kèm token xác thực.

---

### Bước 5 — Áp dụng Giới hạn Phân hạng (Tier Limits)

#### [MODIFY] [server.js](file:///e:/ADT/bizhub-complete/server.js)

- `POST /api/posts`: Trước khi cho đăng, đếm số bài đăng trong tháng hiện tại → so sánh với giới hạn theo tier (Silver: 3, Gold: 15, Platinum: ∞).
- `POST /api/chat`: Đếm số lượt chat trong ngày hiện tại → so sánh với giới hạn (Silver: 5, Gold: 50, Platinum: ∞).

---

## Verification Plan

### Automated Tests
- Chạy `node server.js` local để kiểm tra server khởi động không lỗi.
- `git status`, `git add .`, `git commit`, `git push origin version2`.

### Manual Verification
- Kiểm tra trên trình duyệt: Truy cập AI chat khi chưa đăng nhập → overlay chặn.
- Đăng nhập hội viên → AI chat hoạt động, lịch sử chỉ hiển thị phiên của mình.
- Thử đăng tin trên Dashboard hội viên.
- Kiểm tra thông tin liên hệ bị che khi chưa đăng nhập trên trang chủ.
