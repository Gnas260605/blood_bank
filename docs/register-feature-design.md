# Tính Năng Đăng Ký — Android Blood Bank System

---

## 1. Tổng Quan

Tính năng **Đăng ký tài khoản** thuộc **Authentication Module**, cho phép người dùng mới tạo tài khoản. Sau khi đăng ký thành công, hệ thống kích hoạt **Notification Module** để gửi email xác thực qua **External Email Gateway**. Tài khoản chỉ được kích hoạt khi người dùng xác nhận email.

---

# PHẦN I — MODULE VIEW

> Module View mô tả hệ thống theo đơn vị **module** (đơn vị trách nhiệm tĩnh, không quan tâm runtime). Gồm 3 style: Decomposition → Uses → Layered, kèm Module Interface và Mapping sang C&C View.

---

## MV-1. Decomposition Style

> Phân rã hệ thống thành module và sub-module theo trách nhiệm chức năng.

### MV-1.1 Cây Phân Rã Module

```
Android Blood Bank System
│
├── Authentication Module
│   ├── Trách nhiệm: Xử lý toàn bộ logic đăng ký, xác thực danh tính người dùng
│   └── Register Sub-module
│       ├── Input Validation
│       │     Trách nhiệm: Kiểm tra định dạng email, độ mạnh mật khẩu, trường bắt buộc
│       ├── Duplicate Check
│       │     Trách nhiệm: Gọi User Repository để kiểm tra email đã tồn tại chưa
│       ├── Account Creation
│       │     Trách nhiệm: Tạo tài khoản mới với trạng thái PENDING
│       ├── Token Generation
│       │     Trách nhiệm: Sinh verification token (UUID, TTL 24h), lưu vào Token Repository
│       └── Email Verification Handler
│             Trách nhiệm: Nhận token từ người dùng, xác thực, cập nhật trạng thái ACTIVE
│
├── Notification Module
│   ├── Trách nhiệm: Xử lý logic thông báo, build nội dung, điều phối gửi đi
│   ├── Email Notification Sub-module
│   │     Trách nhiệm: Build email template xác thực, gọi Email Gateway Adapter
│   └── Notification Persistence Sub-module
│         Trách nhiệm: Ghi log trạng thái thông báo vào Notification Repository
│
├── User Management Module
│   ├── Trách nhiệm: Quản lý hồ sơ người dùng sau khi tài khoản được tạo
│   └── Manage User Profile Sub-module
│         Trách nhiệm: Khởi tạo và cập nhật thông tin hồ sơ người dùng
│
├── Repository Module
│   ├── Trách nhiệm: Trừu tượng hóa truy cập dữ liệu, cách ly Business Logic khỏi DB
│   ├── User Repository
│   │     Trách nhiệm: CRUD tài khoản người dùng, kiểm tra email tồn tại
│   ├── Verification Token Repository
│   │     Trách nhiệm: Lưu, truy vấn, vô hiệu hóa token xác thực
│   └── Notification Repository
│         Trách nhiệm: Ghi và truy vấn lịch sử log thông báo
│
├── Authentication UI Module
│   ├── Trách nhiệm: Trình bày giao diện đăng ký, thu thập và hiển thị phản hồi
│   ├── Register Form Component
│   ├── Register Success Component
│   └── Email Verified Component
│
└── Admin Module
    ├── Trách nhiệm: Giám sát và quản trị tài khoản người dùng
    └── Manage Users Sub-module
          Trách nhiệm: Xem, khoá, mở khoá tài khoản người dùng
```

### MV-1.2 Bảng Trách Nhiệm Module

| Module                       | Trách Nhiệm Chính                                      | Sub-module                                                 |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| **Authentication Module**    | Xử lý logic đăng ký, sinh token, xác thực email        | Register, Email Verification Handler                       |
| **Notification Module**      | Build template email, điều phối gửi thông báo, ghi log | Email Notification, Notification Persistence               |
| **User Management Module**   | Quản lý hồ sơ người dùng                               | Manage User Profile                                        |
| **Repository Module**        | Trừu tượng hóa truy cập dữ liệu                        | User Repository, Token Repository, Notification Repository |
| **Authentication UI Module** | Giao diện đăng ký, hiển thị phản hồi                   | Register Form, Success, Verified                           |
| **Admin Module**             | Giám sát và quản trị tài khoản                         | Manage Users                                               |

---

## MV-2. Uses Style

> Mô tả quan hệ **"Module A uses Module B"** — A phụ thuộc B để hoàn thành trách nhiệm của mình.

### MV-2.1 Bảng Uses Relationship

| Module Sử Dụng (A)       | Sử Dụng (B)                                 | Mục Đích                                    |
| ------------------------ | ------------------------------------------- | ------------------------------------------- |
| Authentication UI Module | Authentication Module                       | Gọi logic đăng ký, xác thực email           |
| Authentication Module    | Repository Module (User Repository)         | Kiểm tra email trùng, lưu tài khoản mới     |
| Authentication Module    | Repository Module (Token Repository)        | Lưu và truy vấn verification token          |
| Authentication Module    | Notification Module                         | Yêu cầu gửi email xác thực sau đăng ký      |
| Notification Module      | Repository Module (Notification Repository) | Ghi log trạng thái gửi thông báo            |
| Notification Module      | Email Gateway Adapter (External)            | Thực thi gửi email qua SMTP/API ngoài       |
| User Management Module   | Repository Module (User Repository)         | Khởi tạo và cập nhật hồ sơ người dùng       |
| Authentication Module    | User Management Module                      | Tạo profile sau khi tài khoản được khởi tạo |

### MV-2.2 Sơ Đồ Uses

```
Authentication UI Module
         │
         └── uses ──► Authentication Module
                              │
                  ┌───────────┼────────────────────┐
                  │           │                    │
              uses         uses                uses
                  │           │                    │
                  ▼           ▼                    ▼
          User Repository  Token Repository  Notification Module
          (check email,    (save/query       │
           save account)    token)           ├── uses ──► Notification Repository
                                             │            (log status)
                                             │
                                             └── uses ──► Email Gateway Adapter
                                                          [External System]

Authentication Module
         │
         └── uses ──► User Management Module
                              │
                              └── uses ──► User Repository
```

### MV-2.3 Ràng Buộc Uses

| Ràng Buộc                                                         | Lý Do                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| Authentication Module **không** gọi thẳng Email Gateway Adapter   | Phải qua Notification Module để tách biệt trách nhiệm |
| Authentication Module **không** gọi thẳng Notification Repository | Log thông báo là trách nhiệm của Notification Module  |
| Repository Module **không** gọi ngược lên Business Logic          | Tránh dependency vòng                                 |
| Không có dependency vòng giữa các module                          | Đảm bảo khả năng test và thay thế độc lập             |

---

## MV-3. Layered Style

> Tổ chức module theo tầng. Tầng trên chỉ được gọi xuống tầng dưới, không gọi ngược.

### MV-3.1 Cấu Trúc Tầng

```
┌──────────────────────────────────────────────────────────────┐
│  TẦNG 1 — PRESENTATION LAYER                                 │
│                                                              │
│  Authentication UI Module                                    │
│  ├── Register Form Component                                 │
│  ├── Register Success Component                              │
│  └── Email Verified Component                                │
│                                                              │
│  Notification UI Module                                      │
│  └── Toast / Inline Error Component                         │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses (chỉ gọi xuống)
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 2 — BUSINESS LOGIC LAYER                               │
│                                                              │
│  Authentication Module                                       │
│  ├── Register Sub-module                                     │
│  │   ├── Input Validation                                    │
│  │   ├── Duplicate Check                                     │
│  │   ├── Account Creation                                    │
│  │   └── Token Generation                                    │
│  └── Email Verification Handler                              │
│                                                              │
│  Notification Module                                         │
│  ├── Email Notification Sub-module                           │
│  └── Notification Persistence Sub-module                     │
│                                                              │
│  User Management Module                                      │
│  └── Manage User Profile Sub-module                         │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses (chỉ gọi xuống)
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 3 — DATA LAYER                                         │
│                                                              │
│  Repository Module                                           │
│  ├── User Repository          (CRUD tài khoản)              │
│  ├── Verification Token Repository  (lưu/query token)       │
│  └── Notification Repository  (log lịch sử thông báo)      │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses (chỉ gọi xuống)
┌────────────────────────────▼─────────────────────────────────┐
│  TẦNG 4 — EXTERNAL LAYER                                     │
│                                                              │
│  Email Gateway Adapter                                       │
│  └── Wrapper gọi External Email Service (SMTP / API)        │
│                                                              │
│  External Email Service  [Third-party — ngoài hệ thống]     │
│  └── SMTP Provider (SendGrid / Mailgun / ...)               │
└──────────────────────────────────────────────────────────────┘
```

### MV-3.2 Nguyên Tắc Phân Tầng

| Quy Tắc                     | Diễn Giải                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- |
| Tầng trên → tầng dưới       | Presentation gọi Business Logic, không gọi thẳng Data Layer                   |
| Business Logic → Data Layer | Authentication Module gọi Repository, không gọi DB trực tiếp                  |
| Không gọi ngược             | Repository không gọi lên Business Logic                                       |
| External System ở tầng đáy  | Email Gateway Adapter là cầu nối duy nhất ra ngoài                            |
| Screen không phải module    | UI Component thuộc Authentication UI Module, không liệt kê tên màn hình ở đây |

---

## MV-4. Module Interface

> Mỗi module công bố interface gì cho module khác sử dụng.

### Authentication Module

| Interface                   | Input                                          | Output                      | Ghi Chú                                            |
| --------------------------- | ---------------------------------------------- | --------------------------- | -------------------------------------------------- |
| `register(userInfo)`        | full_name, email, phone, password, blood_group | `{status, message, userId}` | Tạo tài khoản PENDING, trigger Notification Module |
| `verifyEmail(token)`        | verification_token: UUID                       | `{status, message}`         | Cập nhật PENDING → ACTIVE, vô hiệu hóa token       |
| `resendVerification(email)` | email: String                                  | `{status, message}`         | Gửi lại email, reset TTL token 24h                 |

### Notification Module

| Interface                        | Input                   | Output                    | Ghi Chú                                    |
| -------------------------------- | ----------------------- | ------------------------- | ------------------------------------------ |
| `sendVerificationEmail(payload)` | email, full_name, token | `{status: SENT / FAILED}` | Build template + gọi Email Gateway Adapter |

### User Management Module

| Interface                         | Input                                        | Output        | Ghi Chú                               |
| --------------------------------- | -------------------------------------------- | ------------- | ------------------------------------- |
| `createProfile(userId, userInfo)` | userId, full_name, email, phone, blood_group | `{profileId}` | Khởi tạo hồ sơ người dùng sau đăng ký |

### Repository Module — User Repository

| Interface                      | Input                | Output               | Ghi Chú                              |
| ------------------------------ | -------------------- | -------------------- | ------------------------------------ |
| `isEmailExist(email)`          | email: String        | `{exists: Boolean}`  | Kiểm tra email trùng lặp             |
| `saveUser(userRecord)`         | userRecord object    | `{userId}`           | Lưu tài khoản mới với status PENDING |
| `updateStatus(userId, status)` | userId, status: Enum | `{success: Boolean}` | Cập nhật PENDING → ACTIVE            |

### Repository Module — Verification Token Repository

| Interface                             | Input                                    | Output                          | Ghi Chú                  |
| ------------------------------------- | ---------------------------------------- | ------------------------------- | ------------------------ |
| `saveToken(userId, token, expiredAt)` | userId, token: UUID, expiredAt: DateTime | `{success: Boolean}`            | Lưu token mới            |
| `findToken(token)`                    | token: UUID                              | `{userId, expiredAt}` hoặc null | Truy vấn token           |
| `invalidateToken(token)`              | token: UUID                              | `{success: Boolean}`            | Vô hiệu hóa sau khi dùng |

---

## MV-5. Module → Component Mapping

> Bảng liên kết Module View với C&C View. Giúp truy vết từ thiết kế tĩnh sang runtime.

| Module (Module View)                        | Runtime Component (C&C View)            | Ghi Chú                            |
| ------------------------------------------- | --------------------------------------- | ---------------------------------- |
| Authentication Module                       | Authentication Service                  | Microservice xử lý đăng ký         |
| Notification Module                         | Notification Service                    | Microservice gửi thông báo         |
| User Management Module                      | User Service                            | Microservice quản lý hồ sơ         |
| Repository Module — User Repository         | User DB                                 | Database lưu tài khoản             |
| Repository Module — Token Repository        | User DB (bảng verify_tokens)            | Cùng DB, bảng riêng                |
| Repository Module — Notification Repository | Notification DB                         | Database log thông báo             |
| Authentication UI Module                    | Mobile App (Android)                    | Client component                   |
| Email Gateway Adapter                       | Notification Service (internal adapter) | Wrapper trong Notification Service |
| External Email Service                      | Email Service (External)                | Third-party SMTP/API               |

---

# PHẦN II — C&C VIEW

> C&C View mô tả hệ thống theo **component** (đơn vị thực thi khi runtime) và **connector** (cách chúng giao tiếp).

---

## CC-1. Các Component & Connector

### CC-1.1 Danh Sách Component

| Component                  | Loại                 | Ánh Xạ Từ Module                   |
| -------------------------- | -------------------- | ---------------------------------- |
| **Mobile App (Android)**   | Client Component     | Authentication UI Module           |
| **Authentication Service** | Processing Component | Authentication Module              |
| **User Service**           | Processing Component | User Management Module             |
| **Notification Service**   | Processing Component | Notification Module                |
| **User DB**                | Data Component       | User Repository + Token Repository |
| **Notification DB**        | Data Component       | Notification Repository            |
| **External Email Service** | External Component   | Email Gateway Adapter → SMTP       |

### CC-1.2 Danh Sách Connector

| Connector           | Từ                     | Đến                    | Kiểu                                 |
| ------------------- | ---------------------- | ---------------------- | ------------------------------------ |
| REST HTTPS          | Mobile App             | Authentication Service | Request-Response đồng bộ             |
| Internal Call       | Authentication Service | User Service           | Request-Response đồng bộ             |
| Service Call        | Authentication Service | Notification Service   | Request-Response (async khuyến nghị) |
| DB Query/Write      | Authentication Service | User DB                | Read/Write đồng bộ                   |
| SMTP / External API | Notification Service   | External Email Service | Request-Response đồng bộ             |
| DB Write            | Notification Service   | Notification DB        | Write đồng bộ                        |

---

## CC-2. Luồng Xử Lý Đăng Ký (Happy Path)

```
[1] Người dùng nhập thông tin → nhấn "ĐĂNG KÝ NGAY"
     │
     ▼
[2] Mobile App validate client-side (format, required fields)
     │ pass
     ▼
[3] POST /api/auth/register  ──(REST HTTPS)──►  Authentication Service
                                                        │
                                           ┌────────────┤
                                           │            │
                                     [4] Validate   [5] User DB
                                     server-side    isEmailExist(email)
                                           │            │
                                           │   ◄────────┘ exists = false
                                           │
                                     [6] Hash password (bcrypt)
                                     [7] Tạo User {status: PENDING}  → save User DB
                                     [8] Sinh verify_token (UUID, TTL 24h) → save User DB
                                           │
                                           ▼
                                    [9] Gọi User Service
                                        createProfile(userId, userInfo)
                                           │
                                           ▼
                                   [10] Gọi Notification Service
                                        sendVerificationEmail({email, name, token})
                                           │
                                           ▼
                                   Notification Service
                                   [11] Build email template
                                         link: /verify?token={UUID}
                                   [12] Gọi External Email Service (SMTP)
                                   [13] Ghi log → Notification DB (SENT/FAILED)
                                           │
                                           ▼
                                   External Email Service
                                   [14] Gửi email đến hộp thư người dùng
                                           │
                                           ▼
[15] Authentication Service trả response 201
     { message: "Vui lòng kiểm tra email để xác thực tài khoản" }
     │
     ▼
[16] Mobile App → hiển thị Register Success Component
```

---

## CC-3. Luồng Xác Thực Email

```
[1] Người dùng nhấn link trong email
     │
     ▼
[2] GET /api/auth/verify?token={UUID}  ──►  Authentication Service
                                                   │
                                          [3] Query Token Repository
                                              findToken(token)
                                                   │
                                          [4] Kiểm tra expired_at > now?
                                                   │
                               ┌───────────────────┤
                               │                   │
                            Hết hạn             Còn hiệu lực
                               │                   │
                      [5a] Trả 400            [5b] updateStatus(ACTIVE)
                      "Link đã hết hạn"            invalidateToken(token)
                      Hiện nút Resend              │
                               │                   ▼
                               ▼            Email Verified Component
                      Toast đỏ + nút        "Tài khoản đã kích hoạt!"
                      [Gửi lại email]
```

---

## CC-4. Luồng Xử Lý Lỗi

| Tình Huống              | Component Phát Hiện      | Response             | Hiển Thị UI                            |
| ----------------------- | ------------------------ | -------------------- | -------------------------------------- |
| Field rỗng / sai format | Mobile App (client-side) | —                    | Inline error dưới field, viền đỏ       |
| Email đã tồn tại        | Authentication Service   | 409 Conflict         | Toast đỏ "Email đã được đăng ký"       |
| Server lỗi              | Authentication Service   | 500                  | Toast vàng "Lỗi hệ thống, thử lại sau" |
| Email Service lỗi       | Notification Service     | Retry x3, log FAILED | Toast "Email chưa đến, thử gửi lại"    |
| Token hết hạn           | Authentication Service   | 400                  | Toast đỏ + nút "Gửi lại email"         |
| Token không tồn tại     | Authentication Service   | 404                  | Toast đỏ "Link không hợp lệ"           |
| Mất kết nối mạng        | Mobile App               | —                    | Toast vàng "Không có kết nối mạng"     |

---

# PHẦN III — GIAO DIỆN

> Thuộc Authentication UI Module — Presentation Layer.

---

## UI-1. Register Form Component

```
┌─────────────────────────────────────┐
│                                     │
│        🩸  Blood Bank               │
│         Tạo tài khoản mới           │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 👤  Họ và tên *              │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 📧  Email *                  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 📱  Số điện thoại *          │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 🔒  Mật khẩu *         👁   │   │
│  └──────────────────────────────┘   │
│  ▓▓░░  Độ mạnh: Trung bình         │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 🔒  Xác nhận mật khẩu * 👁  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ 🩸  Nhóm máu (tùy chọn)  ▼  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ☐  Tôi đồng ý với Điều khoản      │
│     sử dụng và Chính sách BM        │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  ●  ĐĂNG KÝ NGAY →          │   │
│  └──────────────────────────────┘   │
│                                     │
│    Đã có tài khoản? [Đăng nhập]    │
│                                     │
└─────────────────────────────────────┘
```

| Thành Phần            | Hành Vi                                        |
| --------------------- | ---------------------------------------------- |
| Field lỗi             | Viền đỏ + text lỗi nhỏ bên dưới ngay khi blur  |
| Nút ĐĂNG KÝ NGAY      | Disabled nếu chưa tick điều khoản              |
| Loading state         | Spinner, disable toàn bộ form khi đang gọi API |
| Trường Số điện thoại  | Bàn phím số tự động                            |
| Password strength bar | Đổi màu đỏ → vàng → xanh theo độ mạnh          |

---

## UI-2. Register Success Component

```
┌─────────────────────────────────────┐
│                                     │
│               ✅                    │
│                                     │
│      Đăng ký thành công!            │
│                                     │
│  Chúng tôi đã gửi email xác thực   │
│  đến:  📧  user@example.com         │
│                                     │
│  Vui lòng kiểm tra hộp thư và      │
│  nhấn vào link để kích hoạt tài     │
│  khoản của bạn.                     │
│                                     │
│  ─────────────────────────────      │
│  Không nhận được email?             │
│  [ Gửi lại email ]  ⏱ 00:45        │
│                                     │
│  ┌──────────────────────────────┐   │
│  │      Về trang Đăng nhập      │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

| Thành Phần          | Hành Vi                                         |
| ------------------- | ----------------------------------------------- |
| Nút "Gửi lại email" | Countdown 60 giây, disabled trong thời gian đếm |
| Sau khi gửi lại     | Toast xanh "Email xác thực đã được gửi lại"     |

---

## UI-3. Email Verified Component

```
┌─────────────────────────────────────┐
│                                     │
│              🎉                     │
│                                     │
│    Tài khoản đã được                │
│    xác thực thành công!             │
│                                     │
│  Bạn có thể đăng nhập và sử dụng   │
│  đầy đủ tính năng của Blood Bank.  │
│                                     │
│  ┌──────────────────────────────┐   │
│  │        ĐĂNG NHẬP NGAY       │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## UI-4. Bảng Thông Báo (Notification UI Module)

| Tình Huống               | Loại                       | Nội Dung                                      |
| ------------------------ | -------------------------- | --------------------------------------------- |
| Đăng ký thành công       | Chuyển component           | Register Success Component                    |
| Email đã tồn tại         | Toast đỏ + highlight field | "Email này đã được đăng ký. Thử đăng nhập?"   |
| Field để trống           | Inline error dưới field    | "Vui lòng điền đầy đủ thông tin"              |
| Mật khẩu không khớp      | Inline error               | "Mật khẩu xác nhận không khớp"                |
| Gửi lại email thành công | Toast xanh                 | "Email xác thực đã được gửi lại"              |
| Token hết hạn            | Toast đỏ + nút gửi lại     | "Link xác thực đã hết hạn. Vui lòng gửi lại." |
| Xác thực email OK        | Chuyển component           | Email Verified Component                      |
| Lỗi mạng                 | Toast vàng                 | "Không có kết nối mạng. Vui lòng thử lại."    |
| Lỗi server               | Toast vàng                 | "Đã có lỗi xảy ra. Vui lòng thử lại sau."     |

---

# PHẦN IV — PHỤ LỤC

---

## A. Validate Rules

| Trường            | Quy Tắc                                        |
| ----------------- | ---------------------------------------------- |
| Họ và tên         | Không rỗng, 2–100 ký tự                        |
| Email             | Đúng định dạng email, không trùng trong DB     |
| Số điện thoại     | 9–11 chữ số, bắt đầu bằng 0                    |
| Mật khẩu          | Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa + 1 số |
| Xác nhận mật khẩu | Phải khớp với trường mật khẩu                  |
| Điều khoản        | Bắt buộc tick trước khi submit                 |

---

## B. API Endpoints

| Method | Endpoint                        | Mô Tả                     |
| ------ | ------------------------------- | ------------------------- |
| `POST` | `/api/auth/register`            | Tạo tài khoản mới         |
| `GET`  | `/api/auth/verify?token=`       | Xác thực email bằng token |
| `POST` | `/api/auth/resend-verification` | Gửi lại email xác thực    |

---

## C. Data Model

```
User {
  id              : UUID        (PK)
  full_name       : String
  email           : String      (unique, indexed)
  phone           : String
  password_hash   : String      (bcrypt)
  blood_group     : Enum        (A/B/AB/O — optional)
  status          : Enum        [PENDING, ACTIVE, BANNED]
  created_at      : DateTime
  updated_at      : DateTime
}

VerifyToken {
  id              : UUID        (PK)
  user_id         : UUID        (FK → User)
  token           : String      (UUID, indexed)
  expired_at      : DateTime    (TTL 24h)
  used            : Boolean     (default false)
  created_at      : DateTime
}

NotificationLog {
  id              : UUID        (PK)
  user_id         : UUID        (FK → User)
  type            : Enum        [EMAIL_VERIFICATION, ...]
  status          : Enum        [SENT, FAILED, PENDING]
  sent_at         : DateTime
  error_message   : String      (nullable)
}
```
