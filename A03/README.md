# Báo Cáo – A03: Chuyển Sang React Navigation và Styled Components

## 1. Giới thiệu

**A03** kế thừa toàn bộ chức năng xác thực từ A02 nhưng chuyển đổi kiến trúc điều hướng từ **Expo Router** (file-based) sang **React Navigation** (component-based), đồng thời bổ sung **Styled Components** và tổ chức lại cấu trúc dự án theo pattern rõ ràng hơn.

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React Native | 0.81.5 | Framework phát triển ứng dụng đa nền tảng |
| React | 19.1 | Thư viện UI |
| Expo | ~54 | Bộ công cụ phát triển React Native |
| React Navigation | 7.x | Điều hướng component-based (Native Stack) |
| React Native Paper | 5.14 | Bộ UI component Material Design 3 |
| Styled Components | 6.3 | CSS-in-JS cho layout styling |
| NativeWind | 4.2 | Tailwind CSS cho React Native |
| Tailwind CSS | 3.4 | Framework CSS tiện ích |
| AsyncStorage | latest | Lưu trữ dữ liệu cục bộ |
| TypeScript | strict | Ngôn ngữ lập trình có kiểu dữ liệu tĩnh |

---

## 3. Cấu trúc thư mục

```
A03/
├── App.tsx                     # Root component
├── index.js                    # Entry point
├── theme.ts                    # MD3 theme (primary: #2B4366)
├── navigation/
│   ├── index.tsx               # Navigation exports
│   └── RootStack.tsx           # Stack navigator và định nghĩa routes
├── screens/
│   ├── index.ts                # Screen exports
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── VerifyOtpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ResetPasswordScreen.tsx
│   ├── HomeScreen.tsx
│   └── styled/                 # Styled components cho mỗi màn hình
│       ├── WelcomeScreen.styled.ts
│       ├── LoginScreen.styled.ts
│       └── ...
├── components/
│   ├── index.ts
│   ├── AppButton.tsx           # Nút bấm có theme
│   ├── AppTextInput.tsx        # Ô nhập liệu có theme
│   ├── FormCard.tsx            # Card wrapper cho form
│   └── HomeHeader.tsx          # Header với menu người dùng
├── context/
│   └── AuthContext.tsx          # Auth state management
├── lib/
│   ├── api.ts                  # HTTP client
│   └── auth.ts                 # Auth API functions
└── global.css
```

---

## 4. Các bước triển khai

### Bước 1: Chuyển đổi từ Expo Router sang React Navigation

- Gỡ bỏ cấu trúc `app/` folder (file-based routing) của Expo Router.
- Cài đặt `@react-navigation/native` và `@react-navigation/native-stack`.
- Tạo `navigation/RootStack.tsx` với Native Stack Navigator.
- Định nghĩa `RootStackParamList` với TypeScript cho type-safe navigation.

### Bước 2: Tổ chức lại cấu trúc dự án

- Tách screens vào folder `screens/` riêng biệt.
- Tạo folder `components/` cho các component dùng chung.
- Tạo barrel exports (`index.ts`) cho screens và components.
- Cấu hình `App.tsx` wrap `PaperProvider` → `AuthProvider` → `NavigationContainer` → `RootStack`.

### Bước 3: Xây dựng reusable components

| Component | Chức năng |
|-----------|-----------|
| **AppButton** | Button với theme colors, hỗ trợ `mt`/`mb` spacing |
| **AppTextInput** | TextInput với outline/active colors từ theme |
| **FormCard** | Card wrapper với surface/outline colors |
| **HomeHeader** | Appbar với title, menu người dùng, nút đăng xuất |

### Bước 4: Áp dụng Styled Components

- Tạo folder `screens/styled/` chứa styled components cho từng màn hình.
- Sử dụng `styled-components` cho layout (Container, Content, etc.).
- Kết hợp với React Native Paper cho UI components.

### Bước 5: Cấu hình Theme

- Tạo `theme.ts` với MD3 theme: primary `#2B4366`, light background.
- Áp dụng theme cho toàn bộ ứng dụng qua `PaperProvider`.

### Bước 6: Cập nhật các màn hình

Giữ nguyên chức năng từ A02 nhưng refactor:

| Màn hình | Thay đổi so với A02 |
|----------|---------------------|
| **WelcomeScreen** | Sử dụng styled components, navigation thay router |
| **LoginScreen** | `navigation.navigate()` thay `router.push()` |
| **RegisterScreen** | Truyền `email` qua route params đến VerifyOtp |
| **HomeScreen** | Thêm HomeHeader với menu dropdown, hiển thị thông tin tài khoản |
| Các màn hình khác | Refactor tương tự |

### Bước 7: Auth Context

- Giữ nguyên logic từ A02.
- `useAuth()` hook cung cấp `token`, `user`, `login`, `logout`.

---

## 5. So sánh A02 vs A03

| Tiêu chí | A02 | A03 |
|----------|-----|-----|
| Điều hướng | Expo Router (file-based) | React Navigation (component-based) |
| Styling | NativeWind only | NativeWind + Styled Components |
| Cấu trúc | Flat (`app/` folder) | Phân tầng (`screens/`, `components/`, `navigation/`) |
| Components | Sử dụng trực tiếp Paper | Reusable wrappers (AppButton, AppTextInput...) |
| Theme | Mặc định | Custom MD3 theme |

---

## 6. Luồng hoạt động

```
App.tsx
  └── PaperProvider (theme)
        └── AuthProvider
              └── NavigationContainer
                    └── RootStack
                          ├── Welcome (initial)
                          ├── Login
                          ├── Register
                          ├── VerifyOtp { email }
                          ├── ForgotPassword
                          ├── ResetPassword { email }
                          └── Home
```

---

## 7. API Backend tích hợp

Giống A02 – sử dụng cùng bộ endpoint xác thực tại `https://kebook.apn.leapcell.app/api/v1`.

---

## 8. Kết luận

A03 cải tiến kiến trúc so với A02 bằng cách chuyển sang React Navigation, tổ chức lại cấu trúc thư mục, xây dựng reusable components và áp dụng styled-components. Chức năng xác thực được giữ nguyên nhưng code base sạch hơn và dễ mở rộng hơn.
