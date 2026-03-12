# Báo Cáo – A04: Danh Mục Sách, Chi Tiết Sách và Hồ Sơ Người Dùng

## 1. Giới thiệu

**A04** mở rộng ứng dụng KeBook từ A03 với các tính năng mới: duyệt danh mục sách, xem chi tiết sách, và quản lý hồ sơ người dùng (bao gồm upload avatar). Đây là bước chuyển từ ứng dụng xác thực đơn thuần sang ứng dụng thương mại điện tử thực sự.

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React Native | 0.81.5 | Framework đa nền tảng |
| React | 19.1 | Thư viện UI |
| Expo | ~54 | Bộ công cụ phát triển |
| React Navigation | 7.x | Điều hướng (Native Stack) |
| React Native Paper | 5.x | Material Design 3 UI |
| NativeWind | 4.x | Tailwind CSS cho React Native |
| expo-image | latest | Component hiển thị ảnh tối ưu |
| expo-image-picker | latest | Chọn ảnh từ thiết bị |
| expo-image-manipulator | latest | Resize và xử lý ảnh |
| expo-crypto | latest | Tính MD5 hash cho ảnh |
| expo-file-system | latest | Đọc file hệ thống |
| @react-native-community/datetimepicker | latest | Chọn ngày sinh |
| AsyncStorage | latest | Lưu trữ cục bộ |
| TypeScript | strict | Kiểu dữ liệu tĩnh |

---

## 3. Cấu trúc thư mục

```
A04/
├── App.tsx                     # Root + 401 handler
├── theme.ts                    # MD3 theme
├── navigation/
│   ├── RootStack.tsx           # Stack navigator (thêm BookDetail, Profile)
│   └── index.tsx
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── VerifyOtpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   ├── HomeScreen.tsx          # ★ Danh sách sách, tìm kiếm, phân trang
│   ├── BookDetailScreen.tsx    # ★ Chi tiết sách
│   ├── ProfileScreen.tsx       # ★ Hồ sơ người dùng
│   └── index.ts
├── components/
│   ├── AppButton.tsx
│   ├── AppTextInput.tsx
│   ├── AppSelect.tsx           # ★ Dropdown menu
│   ├── AppDateInput.tsx        # ★ Date picker đa nền tảng
│   ├── FormCard.tsx
│   ├── HomeHeader.tsx
│   ├── ProfileHeader.tsx       # ★ Header cho Profile
│   └── index.ts
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts                  # HTTP client + uploadAvatar
│   ├── auth.ts
│   ├── books.ts                # ★ API sách
│   ├── users.ts                # ★ API người dùng
│   ├── addresses.ts            # ★ API tỉnh/thành, phường/xã
│   └── categories.ts           # ★ API danh mục
├── utils/
│   ├── date.ts                 # Xử lý ngày tháng
│   ├── image.ts                # Resize ảnh 500x500
│   └── hash.ts                 # MD5 cho avatar dedup
└── global.css
```

(★ = mới so với A03)

---

## 4. Các bước triển khai

### Bước 1: Mở rộng API Client (`lib/api.ts`)

- Thêm hàm `uploadAvatar(token, imageUri)` – upload ảnh dạng `multipart/form-data`.
- Thêm `setOnUnauthorized(callback)` – tự động đăng xuất khi nhận HTTP 401.
- Chuyển `API_BASE` sang local server (`http://localhost:8000/api/v1`).

### Bước 2: Xây dựng Books API (`lib/books.ts`)

- `getBooks(token, params)` – Lấy danh sách sách với phân trang, tìm kiếm, lọc danh mục.
- `getBook(bookId)` – Lấy chi tiết một cuốn sách.
- Định nghĩa types: `Book`, `BookWithDetail`, `PaginatedBooks`.
- Implement caching cho danh sách sách.

### Bước 3: Xây dựng Users API (`lib/users.ts`)

- `getMe(token)` – Lấy thông tin người dùng hiện tại.
- `updateMe(token, data)` – Cập nhật hồ sơ.

### Bước 4: Xây dựng Addresses API (`lib/addresses.ts`)

- `getProvinces()` – Lấy danh sách tỉnh/thành phố.
- `getWards(provinceId)` – Lấy danh sách phường/xã theo tỉnh.
- Endpoint công khai (không cần token).

### Bước 5: Xây dựng Categories API (`lib/categories.ts`)

- `getCategories(token)` – Lấy danh sách danh mục sách.
- Implement cache để tránh gọi API lặp lại.

### Bước 6: Xây dựng HomeScreen

- Hiển thị danh sách sách dạng lưới.
- Chức năng tìm kiếm sách theo tên.
- Phân trang (load more khi cuộn xuống).
- Lọc theo danh mục.
- Header với menu tài khoản (Profile, Đăng xuất).

### Bước 7: Xây dựng BookDetailScreen

- Nhận `bookId` qua route params.
- Hiển thị: ảnh bìa, tiêu đề, tác giả, giá, giảm giá, tồn kho, mô tả.
- Hiển thị metadata chi tiết: NXB, ngày xuất bản, ISBN, kích thước, trọng lượng, số trang.

### Bước 8: Xây dựng ProfileScreen

- Hiển thị và chỉnh sửa hồ sơ: họ tên, username, email, SĐT, giới tính, ngày sinh, địa chỉ.
- Upload avatar với:
  - Chọn ảnh từ thư viện (expo-image-picker).
  - Resize về 500×500 (expo-image-manipulator).
  - Tính MD5 hash để tránh upload trùng lặp.
- Dropdown tỉnh/thành phố và phường/xã.
- Date picker đa nền tảng (native trên mobile, `<input type="date">` trên web).

### Bước 9: Tạo Components mới

| Component | Mô tả |
|-----------|-------|
| **AppSelect** | Dropdown sử dụng Paper `Menu`, hỗ trợ tìm kiếm |
| **AppDateInput** | Date picker tương thích iOS/Android/Web |
| **ProfileHeader** | App bar với nút Back, tiêu đề, nút Sửa/Lưu |

### Bước 10: Xử lý 401 Unauthorized

- Trong `App.tsx`, đăng ký callback `setOnUnauthorized`.
- Khi API trả 401 → tự động đăng xuất → chuyển về màn hình Welcome.

---

## 5. Các màn hình

| Màn hình | Chức năng |
|----------|-----------|
| **Welcome** | Trang đích, auto-redirect nếu đã đăng nhập |
| **Login** | Đăng nhập email/mật khẩu |
| **Register** | Đăng ký tài khoản |
| **VerifyOtp** | Xác thực OTP |
| **ForgotPassword** | Quên mật khẩu |
| **ResetPassword** | Đặt lại mật khẩu |
| **Home** | Danh sách sách, tìm kiếm, phân trang, danh mục |
| **BookDetail** | Chi tiết sách đầy đủ |
| **Profile** | Hồ sơ người dùng, avatar, tỉnh/phường |

---

## 6. API Backend tích hợp

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/auth/*` | POST | Xác thực (giống A02/A03) |
| `/books` | GET | Danh sách sách (phân trang, tìm kiếm, danh mục) |
| `/books/:id` | GET | Chi tiết sách |
| `/users/me` | GET | Thông tin người dùng hiện tại |
| `/users/:id` | PATCH | Cập nhật hồ sơ |
| `/upload/avatar` | POST | Upload avatar (multipart) |
| `/addresses/provinces` | GET | Danh sách tỉnh/thành |
| `/addresses/wards` | GET | Danh sách phường/xã |
| `/categories` | GET | Danh sách danh mục |

---

## 7. Kết luận

A04 biến ứng dụng từ một hệ thống xác thực thành ứng dụng thương mại điện tử với khả năng duyệt sách, xem chi tiết, và quản lý hồ sơ. Các tính năng avatar upload với resize và dedup, dropdown địa chỉ, và xử lý 401 tự động nâng cao trải nghiệm người dùng.
