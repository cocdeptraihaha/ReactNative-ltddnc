# Báo Cáo – A05: Bottom Tabs, Sách Nổi Bật và Giao Diện Trang Chủ

## 1. Giới thiệu

**A05** nâng cấp ứng dụng KeBook với hệ thống điều hướng Bottom Tabs, trang chủ phong phú hơn (sách bán chạy, sách giảm giá), cùng các tab Giỏ hàng, Thông báo và Hồ sơ. Đây là bước chuẩn bị kiến trúc cho các tính năng thương mại điện tử hoàn chỉnh ở A06.

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React Native | 0.81.5 | Framework đa nền tảng |
| React | 19.1 | Thư viện UI |
| Expo | ~54 | Bộ công cụ phát triển |
| React Navigation | 7.x | Native Stack + Bottom Tabs |
| @react-navigation/bottom-tabs | 7.x | Thanh điều hướng dưới cùng |
| React Native Paper | 5.x | Material Design 3 UI |
| @expo/vector-icons | latest | Bộ icon MaterialCommunityIcons |
| expo-image | latest | Hiển thị ảnh tối ưu |
| NativeWind | 4.x | Tailwind CSS cho React Native |
| AsyncStorage | latest | Lưu trữ cục bộ |
| TypeScript | strict | Kiểu dữ liệu tĩnh |

---

## 3. Cấu trúc thư mục

```
A05/
├── App.tsx
├── theme.ts
├── navigation/
│   ├── RootStack.tsx           # Stack navigator chính
│   ├── BottomTabs.tsx          # ★ Tab navigator (Home, Notifications, Cart, Profile)
│   └── index.tsx
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── VerifyOtpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   ├── HomeScreen.tsx          # ★ Trang chủ nâng cấp
│   ├── BookDetailScreen.tsx
│   ├── CartScreen.tsx          # ★ Giỏ hàng (placeholder)
│   ├── NotificationsScreen.tsx # ★ Thông báo (placeholder)
│   ├── ProfileScreen.tsx
│   └── index.ts
├── components/
│   ├── AppButton.tsx
│   ├── AppTextInput.tsx
│   ├── AppSelect.tsx
│   ├── AppDateInput.tsx
│   ├── FormCard.tsx
│   ├── HomeHeader.tsx
│   ├── ProfileHeader.tsx
│   ├── CategorySlider.tsx      # ★ Thanh danh mục ngang
│   ├── ProductCard.tsx         # ★ Card sản phẩm
│   └── index.ts
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── books.ts                # ★ Thêm top selling, top discounted
│   ├── users.ts
│   ├── addresses.ts
│   └── categories.ts
├── utils/
│   ├── date.ts
│   ├── image.ts
│   └── hash.ts
└── global.css
```

(★ = mới hoặc thay đổi lớn so với A04)

---

## 4. Các bước triển khai

### Bước 1: Thêm Bottom Tab Navigator

- Tạo `navigation/BottomTabs.tsx` với 4 tab:
  - **Trang chủ** (icon: `home`) → HomeScreen
  - **Thông báo** (icon: `bell-outline`) → NotificationsScreen
  - **Giỏ hàng** (icon: `cart-outline`) → CartScreen
  - **Hồ sơ** (icon: `account-circle-outline`) → ProfileScreen
- Sử dụng `MaterialCommunityIcons` cho icon.
- Tích hợp `BottomTabs` vào `RootStack` thay thế các screen riêng lẻ.

### Bước 2: Cập nhật RootStack

- Route `Tabs` thay thế `Home` và `Profile` riêng lẻ.
- Thêm route `BookDetail` nhận `{ bookId }` params.
- Cấu trúc điều hướng:
  ```
  RootStack
  ├── Welcome
  ├── Login / Register / VerifyOtp / ForgotPassword / ResetPassword
  ├── Tabs (BottomTabs)
  │     ├── Home
  │     ├── Notifications
  │     ├── Cart
  │     └── Profile
  └── BookDetail { bookId }
  ```

### Bước 3: Nâng cấp Books API (`lib/books.ts`)

- `getTopSellingBooks(token)` – Lấy 10 sách bán chạy nhất.
- `getTopDiscountedBooks(token)` – Lấy 20 sách giảm giá nhiều nhất.
- Cập nhật type `BookWithDetail` với `image_url`, `final_price`.

### Bước 4: Xây dựng ProductCard Component

- Hiển thị: ảnh bìa, tiêu đề, giá gốc (gạch ngang), giá giảm, badge giảm giá (%).
- Nhấn vào card → navigate đến BookDetail.
- Responsive width cho lưới 2 cột.

### Bước 5: Xây dựng CategorySlider Component

- Thanh cuộn ngang hiển thị các chip danh mục.
- Chip "Tất cả" mặc định được chọn.
- Nhấn chip → lọc sách theo danh mục.

### Bước 6: Nâng cấp HomeScreen

Trang chủ gồm các section:
1. **Lời chào** – "Xin chào, [tên]!"
2. **Ô tìm kiếm** – Tìm sách theo tên.
3. **Danh mục** – CategorySlider ngang.
4. **Top bán chạy** – FlatList ngang, tối đa 10 sách.
5. **Top giảm giá** – FlatList ngang, tối đa 20 sách.
6. **Tất cả sách** – Danh sách dọc, phân trang (infinite scroll).

### Bước 7: Tạo màn hình placeholder

- **CartScreen** – Hiển thị "Giỏ hàng trống" (chưa kết nối API).
- **NotificationsScreen** – Hiển thị "Chưa có thông báo" (chưa kết nối API).

### Bước 8: Cấu hình mạng

- `app.json`: cho phép HTTP cleartext (Android) và arbitrary loads (iOS).
- `API_BASE`: `http://192.168.1.201:8000/api/v1` (LAN IP).

---

## 5. Các màn hình

| Màn hình | Trạng thái | Chức năng |
|----------|------------|-----------|
| **Welcome** | Hoàn chỉnh | Trang đích |
| **Login** | Hoàn chỉnh | Đăng nhập |
| **Register** | Hoàn chỉnh | Đăng ký |
| **VerifyOtp** | Hoàn chỉnh | Xác thực OTP |
| **ForgotPassword** | Hoàn chỉnh | Quên mật khẩu |
| **ResetPassword** | Hoàn chỉnh | Đặt lại mật khẩu |
| **Home** | Hoàn chỉnh | Trang chủ: tìm kiếm, danh mục, top sách, tất cả sách |
| **BookDetail** | Hoàn chỉnh | Chi tiết sách |
| **Cart** | Placeholder | Giỏ hàng trống |
| **Notifications** | Placeholder | Chưa có thông báo |
| **Profile** | Hoàn chỉnh | Hồ sơ, avatar, tỉnh/phường |

---

## 6. So sánh A04 vs A05

| Tiêu chí | A04 | A05 |
|----------|-----|-----|
| Điều hướng | Stack only | Stack + Bottom Tabs |
| Trang chủ | Danh sách sách đơn giản | Top bán chạy, top giảm giá, danh mục, infinite scroll |
| Components | Cơ bản | Thêm ProductCard, CategorySlider |
| Tabs | Không | Home, Notifications, Cart, Profile |
| Icons | Không | MaterialCommunityIcons |

---

## 7. API Backend tích hợp

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/auth/*` | POST | Xác thực |
| `/books` | GET | Danh sách sách (phân trang, tìm kiếm, danh mục) |
| `/books/:id` | GET | Chi tiết sách |
| `/books/top-selling` | GET | Sách bán chạy (top 10) |
| `/books/top-discounted` | GET | Sách giảm giá nhiều (top 20) |
| `/users/me` | GET | Thông tin người dùng |
| `/users/:id` | PATCH | Cập nhật hồ sơ |
| `/upload/avatar` | POST | Upload avatar |
| `/addresses/*` | GET | Tỉnh/thành, phường/xã |
| `/categories` | GET | Danh mục sách |

---

## 8. Kết luận

A05 hoàn thiện giao diện chính của ứng dụng với Bottom Tabs và trang chủ phong phú. Các tính năng hiển thị sách bán chạy, sách giảm giá, và thanh danh mục tạo trải nghiệm duyệt sách tự nhiên. CartScreen và NotificationsScreen được chuẩn bị sẵn cho A06 phát triển tiếp.
