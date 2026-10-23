# BÁO CÁO KIẾN TRÚC VÀ LUỒNG DỮ LIỆU — BLOOD BANK SYSTEM

Tài liệu này mô tả chi tiết kiến trúc hệ thống Blood Bank System theo **Module View** (Decomposition, Uses, Layered Style) để phục vụ cho việc báo cáo bài tập lớn đại học.

---

## I. KIẾN TRÚC HỆ THỐNG (MODULE VIEW)

Hệ thống được phát triển theo mô hình kiến trúc phân tầng (Layered Architecture) kết hợp phân rã các khối chức năng độc lập (Decomposition Style) nhằm đảm bảo tính tái sử dụng và dễ kiểm thử.

```
┌──────────────────────────────────────────────────────────────┐
│  TẦNG 1 — PRESENTATION LAYER (Giao diện người dùng)          │
│  - Authentication UI Module (ReactJS Components)             │
│    ├── RegisterForm, RegisterSuccess, EmailVerified          │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 2 — BUSINESS LOGIC LAYER (Xử lý nghiệp vụ chính)       │
│  - Authentication Module (Logic đăng ký & kích hoạt token)   │
│  - Notification Module (Logic build nội dung, phối hợp gửi)  │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 3 — DATA LAYER (Trừu tượng hóa truy cập dữ liệu)       │
│  - Repository Module (Spring Data JPA Repositories)          │
│    ├── User Repository, Token Repository, Notification Log   │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 4 — EXTERNAL LAYER (Cổng kết nối dịch vụ ngoài)       │
│  - Email Gateway Adapter (JavaMailSender kết nối SMTP Gmail) │
└──────────────────────────────────────────────────────────────┘
```

---

## II. PHÂN RÃ HỆ THỐNG THÀNH CÁC MODULE (DECOMPOSITION STYLE)

Mỗi Module tĩnh trong Module View được ánh xạ trực tiếp sang cấu trúc thư mục của dự án thực tế:

### 1. Presentation Layer (ReactJS Frontend)
* **Authentication UI Module** (Thư mục: `blood-bank-frontend/src/pages/`)
  * `RegisterPage.jsx`: Tiếp nhận thông tin đăng ký của người dùng, thực hiện validate client-side (độ dài tên, định dạng Email, độ mạnh mật khẩu, đầu số điện thoại).
  * `RegisterSuccessPage.jsx`: Hiển thị thông thông báo đăng ký thành công, tích hợp bộ đếm ngược 60 giây để yêu cầu gửi lại thư xác thực.
  * `EmailVerifiedPage.jsx`: Tiếp nhận tham số token từ URL, gọi API Backend để xác thực tài khoản và dẫn người dùng tới màn hình đăng nhập.
  * `LoginPage.jsx` & `DashboardPage.jsx`: Hỗ trợ đăng nhập và hiển thị thông tin hồ sơ của tài khoản đã kích hoạt.

### 2. Business Logic & Data Layer (Spring Boot Backend)
Tổ chức Package trong `blood-bank-backend/src/main/java/com/bloodbank/app/` tuân thủ nghiêm ngặt ranh giới tĩnh:

* **Authentication Module**:
  * **Controller** (`controller/AuthController.java`): Cung cấp các REST API cho phía giao diện gọi xuống gồm:
    * `POST /api/auth/register` (Đăng ký mới).
    * `GET /api/auth/verify?token=...` (Kích hoạt tài khoản).
    * `POST /api/auth/resend-verification` (Gửi lại mã xác thực).
    * `POST /api/auth/login` (Đăng nhập).
  * **Service** (`service/UserService.java` & `UserServiceImpl.java`): Xử lý thuật toán mã hóa mật khẩu bằng **BCrypt**, sinh mã thông báo UUID thời hạn 24h và điều phối sang Notification Module.
* **Notification Module**:
  * **Service** (`service/NotificationService.java` & `NotificationServiceImpl.java`): Thiết lập định dạng Mail HTML, thực thi gọi Gateway gửi và ghi nhận lịch sử gửi thư.
* **Repository Module**:
  * **Repository** (`repository/`): Trừu tượng hóa truy cập Database gồm `UserRepository`, `VerifyTokenRepository`, `NotificationLogRepository`.
  * **Entity** (`entity/`): Định nghĩa ánh xạ dữ liệu xuống MySQL gồm `User`, `VerifyToken`, `NotificationLog`.

---

## III. LUỒNG DỮ LIỆU THỰC TẾ (DATA FLOW RUNTIME)

Luồng hoạt động tuần tự khi người dùng đăng ký tài khoản mới diễn ra như sau:

```
[1] Người dùng nhập thông tin -> Click "ĐĂNG KÝ NGAY" (Giao diện React)
     │
     ▼
[2] Giao diện kiểm tra định dạng dữ liệu (Client-side Validation)
     │
     ▼
[3] Gọi REST API: POST /api/auth/register -> Gửi tới AuthController
     │
     ▼
[4] AuthController nhận dữ liệu, gọi sang UserServiceImpl (Authentication Module)
     │
     ├─► [5] UserServiceImpl gọi UserRepository truy vấn kiểm tra trùng lặp Email
     │
     ├─► [6] Thực hiện mã hóa mật khẩu bằng BCrypt (Bảo mật thông tin)
     │
     ├─► [7] Lưu thông tin User mới xuống Database với trạng thái 'PENDING'
     │
     ├─► [8] Sinh ngẫu nhiên mã Verification Token (UUID) với thời hạn 24 giờ và lưu vào DB
     │
     ▼
[9] UserServiceImpl yêu cầu gửi thư -> Gọi sang NotificationServiceImpl (Notification Module)
     │
     ├─► [10] NotificationServiceImpl gọi Email Gateway Adapter (JavaMailSender)
     │         gửi email thật qua SMTP Gmail (smtp.gmail.com:587)
     │
     ├─► [11] Ghi nhận nhật ký trạng thái (SENT hoặc FAILED) vào bảng notification_logs
     │
     ▼
[12] Trả về HTTP Status 201 Created -> React hiển thị màn hình chúc mừng thành công
```

---

## IV. BẢNG MẪU DỮ LIỆU CƠ SỞ DỮ LIỆU (DATA MODEL)

### 1. Bảng `users` (Thông tin tài khoản)
* Lưu trữ hồ sơ người dùng, mật khẩu đã được băm an toàn và trạng thái tài khoản.
* Khi đăng ký mới, trạng thái mặc định là `PENDING`. Khi người dùng xác thực, trạng thái cập nhật thành `ACTIVE`.

### 2. Bảng `verify_tokens` (Mã kích hoạt)
* Lưu trữ mã UUID kích hoạt tài khoản.
* Có cột liên kết khóa ngoại `user_id` chỉ tới bảng `users` với thuộc tính `ON DELETE CASCADE` (Khi xóa người dùng, mã xác thực tự động bị xóa theo).

### 3. Bảng `notification_logs` (Nhật ký gửi thư)
* Lưu trữ thông tin lịch sử gửi thư xác thực để giám sát luồng đi của hệ thống.
* Ghi lại chi tiết mã lỗi (`error_message`) trong trường hợp gửi email thất bại giúp dễ dàng kiểm tra hệ thống.
