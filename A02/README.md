# Báo Cáo – A02: Xây Dựng Hệ Thống Xác Thực (Authentication)

## 1. Giới thiệu

**A02** là ứng dụng React Native (Expo) đầu tiên trong chuỗi bài thực hành, tập trung vào việc xây dựng luồng xác thực người dùng hoàn chỉnh cho hệ thống **KeBook** – ứng dụng thương mại điện tử sách.

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React Native | 0.81.5 | Framework phát triển ứng dụng đa nền tảng |
| React | 19.1 | Thư viện UI |
| Expo | ~54 | Bộ công cụ phát triển React Native |
| Expo Router | ~6 | Điều hướng dựa trên file (file-based routing) |
| React Native Paper | 5.x | Bộ UI component Material Design 3 |
| NativeWind | 4.x | Tailwind CSS cho React Native |
| Tailwind CSS | 3.4 | Framework CSS tiện ích |
| AsyncStorage | latest | Lưu trữ token và thông tin người dùng |
| TypeScript | strict | Ngôn ngữ lập trình có kiểu dữ liệu tĩnh |

---

## 3. Cấu trúc thư mục

```
A02/
├── app/                    # Các màn hình (Expo Router – file-based)
│   ├── _layout.tsx         # Layout gốc (PaperProvider + AuthProvider)
│   ├── index.tsx           # Màn hình chào mừng
│   ├── login.tsx           # Đăng nhập
│   ├── register.tsx        # Đăng ký
│   ├── verify-otp.tsx      # Xác thực OTP
│   ├── forgot-password.tsx # Quên mật khẩu
│   ├── reset-password.tsx  # Đặt lại mật khẩu
│   └── home.tsx            # Trang chủ (sau đăng nhập)
├── context/
│   └── AuthContext.tsx      # Context quản lý trạng thái xác thực
├── lib/
│   ├── api.ts              # HTTP client chung
│   └── auth.ts             # Các hàm gọi API xác thực
├── global.css              # Tailwind base imports
└── package.json
```

---

## 4. Các bước triển khai

### Bước 1: Khởi tạo dự án

- Tạo project Expo mới với template TypeScript.
- Cài đặt các dependency: `react-native-paper`, `nativewind`, `@react-native-async-storage/async-storage`.
- Cấu hình `babel.config.js`, `metro.config.js`, `tailwind.config.js`.

### Bước 2: Xây dựng HTTP Client (`lib/api.ts`)

- Tạo hàm `apiFetch<T>()` cho các request JSON với header `Content-Type: application/json`.
- Tạo hàm `apiFormFetch<T>()` cho request dạng `application/x-www-form-urlencoded` (dùng cho đăng nhập OAuth).
- Xử lý lỗi từ API (parse `detail` từ response).
- Base URL: `https://kebook.apn.leapcell.app/api/v1`.

### Bước 3: Xây dựng Auth API (`lib/auth.ts`)

Triển khai các hàm gọi API:
- `login(username, password)` – Đăng nhập bằng form POST.
- `register(data)` – Đăng ký tài khoản mới.
- `verifyOtp(email, otp_code)` – Xác thực OTP sau đăng ký.
- `resendOtp(email)` – Gửi lại mã OTP.
- `forgotPassword(email)` – Yêu cầu OTP đặt lại mật khẩu.
- `resetPassword(email, otp_code, new_password)` – Đặt lại mật khẩu.

### Bước 4: Tạo Auth Context (`context/AuthContext.tsx`)

- Quản lý state: `token`, `user`, `isLoading`, `isReady`.
- Lưu trữ token và user vào AsyncStorage (`@kebook_token`, `@kebook_user`).
- Cung cấp các method: `login`, `logout`, `setAuth`.
- Tạo hook `useAuth()` để các component con truy cập trạng thái xác thực.

### Bước 5: Cấu hình điều hướng (`app/_layout.tsx`)

- Sử dụng Expo Router với `Stack` navigator.
- Wrap toàn bộ ứng dụng trong `PaperProvider` và `AuthProvider`.

### Bước 6: Xây dựng các màn hình

| Màn hình | Chức năng chính |
|----------|-----------------|
| **Welcome** (`index.tsx`) | Trang đích, nút Đăng nhập / Đăng ký, tự chuyển về Home nếu đã đăng nhập |
| **Login** (`login.tsx`) | Form đăng nhập email/mật khẩu, toggle hiện/ẩn mật khẩu, link quên mật khẩu |
| **Register** (`register.tsx`) | Form đăng ký: họ tên, username, email, mật khẩu, xác nhận mật khẩu |
| **Verify OTP** (`verify-otp.tsx`) | Nhập mã OTP, xác thực, gửi lại OTP |
| **Forgot Password** (`forgot-password.tsx`) | Nhập email để nhận OTP |
| **Reset Password** (`reset-password.tsx`) | Nhập OTP + mật khẩu mới + xác nhận |
| **Home** (`home.tsx`) | Hiển thị thông tin tài khoản, nút đăng xuất |

### Bước 7: Xử lý UX

- `KeyboardAvoidingView` cho các form.
- Trạng thái loading trên nút bấm.
- Alert hiển thị lỗi/thành công.
- Giao diện tiếng Việt.

---

## 5. Luồng hoạt động

```
Welcome → Login → Home (đã đăng nhập)
Welcome → Register → Verify OTP → Login
Login → Forgot Password → Reset Password → Login
```

---

## 6. API Backend tích hợp

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/auth/login` | POST | Đăng nhập (form-urlencoded) |
| `/auth/register` | POST | Đăng ký tài khoản |
| `/auth/verify-otp` | POST | Xác thực OTP |
| `/auth/resend-otp` | POST | Gửi lại OTP |
| `/auth/forgot-password` | POST | Yêu cầu OTP quên mật khẩu |
| `/auth/reset-password` | POST | Đặt lại mật khẩu |

---

## 7. Kết luận

A02 hoàn thành việc xây dựng luồng xác thực đầy đủ bao gồm đăng ký, xác thực OTP, đăng nhập, quên mật khẩu và đặt lại mật khẩu. Đây là nền tảng cho các bài thực hành tiếp theo trong chuỗi phát triển ứng dụng KeBook.
