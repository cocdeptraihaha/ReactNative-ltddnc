# BÁO CÁO BÀI TẬP TUẦN 01
## Ứng dụng React Native với 2 trang: Intro và Homepage

---

## I. THÔNG TIN SINH VIÊN
- **Họ tên**: Nguyễn Thanh Tính
- **MSSV**: 22110247
- **Môn học**: Lập trình di động với React Native

---

## II. CÁC BƯỚC THỰC HIỆN

### Bước 1: Cài đặt môi trường làm việc

#### 1.1. Tham khảo hướng dẫn cài đặt
- Truy cập trang chủ React Native: https://reactnative.dev
- Xem hướng dẫn cài đặt môi trường tại: https://reactnative.dev/docs/environment-setup

#### 1.2. Cài đặt các công cụ cần thiết
- **Node.js**: Cài đặt phiên bản LTS (Long Term Support)
- **npm**: Được cài đặt kèm theo Node.js
- **Expo CLI**: Công cụ để phát triển ứng dụng React Native
  ```bash
  npm install -g expo-cli
  ```
- **Git**: Để quản lý phiên bản và đẩy code lên GitHub

#### 1.3. Tạo dự án mới
- Sử dụng Expo để tạo dự án React Native mới:
  ```bash
  npx create-expo-app BTTuan01
  cd BTTuan01
  ```

#### 1.4. Cài đặt dependencies
- Chạy lệnh để cài đặt các thư viện cần thiết:
  ```bash
  npm install
  ```

---

### Bước 2: Xây dựng ứng dụng với 2 trang

#### 2.1. Cấu trúc thư mục
```
BTTuan01/
├── app/
│   ├── _layout.tsx      # Layout chính của ứng dụng
│   ├── index.tsx        # Trang Intro (trang giới thiệu)
│   └── homepage.tsx     # Trang Homepage (giới thiệu bản thân)
├── assets/
│   └── images/
│       └── logotruong.png  # Logo thương hiệu
└── package.json
```

#### 2.2. Trang Intro (index.tsx)
**Chức năng:**
- Hiển thị logo thương hiệu (logo trường)
- Đếm ngược từ 10 giây
- Tự động chuyển sang trang Homepage sau 10 giây
- Có nút để chuyển sang Homepage ngay lập tức

**Các thành phần sử dụng:**
- `useRouter` từ `expo-router`: Để điều hướng giữa các trang
- `useState` và `useEffect`: Để quản lý đếm ngược thời gian
- `Image`: Hiển thị logo
- `Text`: Hiển thị thông báo đếm ngược
- `Button`: Nút chuyển trang thủ công
- `SafeAreaView`: Đảm bảo nội dung hiển thị an toàn trên các thiết bị

**Logic hoạt động:**
- Sử dụng `useState` để lưu giá trị đếm ngược (bắt đầu từ 10)
- Sử dụng `useEffect` để giảm giá trị đếm mỗi giây
- Khi đếm về 0, tự động chuyển sang trang Homepage bằng `router.push("/homepage")`

#### 2.3. Trang Homepage (homepage.tsx)
**Chức năng:**
- Hiển thị thông tin giới thiệu bản thân:
  - Họ tên: Nguyễn Thanh Tính
  - MSSV: 22110247
- Có nút để quay lại trang Intro

**Các thành phần sử dụng:**
- `useRouter`: Để điều hướng
- `Text`: Hiển thị thông tin
- `Button`: Nút quay lại trang Intro
- `SafeAreaView`: Đảm bảo hiển thị an toàn

#### 2.4. Layout chính (_layout.tsx)
- Sử dụng `Stack` từ `expo-router` để quản lý điều hướng giữa các trang

---

### Bước 3: Chạy thử ứng dụng

#### 3.1. Khởi động ứng dụng
```bash
npx expo start
```

#### 3.2. Kiểm tra trên thiết bị
- Quét mã QR bằng ứng dụng Expo Go trên điện thoại
- Hoặc chạy trên Android Emulator/iOS Simulator
- Kiểm tra các chức năng:
  - ✅ Logo hiển thị đúng
  - ✅ Đếm ngược hoạt động chính xác
  - ✅ Tự động chuyển trang sau 10 giây
  - ✅ Nút chuyển trang hoạt động
  - ✅ Trang Homepage hiển thị thông tin đúng

---

### Bước 4: Đẩy code lên GitHub

#### 4.1. Khởi tạo Git repository
```bash
git init
```

#### 4.2. Tạo file .gitignore
- Thêm các file và thư mục không cần thiết vào .gitignore:
  - node_modules/
  - .expo/
  - *.log
  - etc.

#### 4.3. Commit code
```bash
git add .
git commit -m "bài tập tuần 1"
```

#### 4.4. Tạo repository trên GitHub
- Đăng nhập vào GitHub
- Tạo repository mới với tên phù hợp (ví dụ: BTTuan01)

#### 4.5. Đẩy code lên GitHub
```bash
git remote add origin <URL-repository-GitHub>
git branch -M main
git push -u origin main
```

#### 4.6. Xác nhận
- Kiểm tra trên GitHub để đảm bảo code đã được đẩy lên thành công
- Comment của commit là "bài tập tuần 1"

---

## III. KẾT QUẢ ĐẠT ĐƯỢC

### 3.1. Yêu cầu đã hoàn thành
- ✅ Cài đặt môi trường làm việc React Native theo hướng dẫn
- ✅ Tạo ứng dụng với 2 trang:
  - ✅ Trang Intro: Hiển thị logo thương hiệu trong 10 giây
  - ✅ Trang Intro: Tự động chuyển sang Homepage sau 10 giây
  - ✅ Trang Homepage: Giới thiệu bản thân (Họ tên, MSSV)
- ✅ Đẩy code lên GitHub với comment "bài tập tuần 1"

### 3.2. Công nghệ sử dụng
- **React Native**: Framework phát triển ứng dụng di động
- **Expo**: Công cụ và dịch vụ để phát triển React Native
- **Expo Router**: Hệ thống routing dựa trên file system
- **TypeScript**: Ngôn ngữ lập trình với type safety
- **React Hooks**: useState, useEffect để quản lý state và side effects

### 3.3. Tính năng bổ sung
- Nút chuyển trang thủ công trên trang Intro
- Nút quay lại trang Intro trên trang Homepage
- Hiển thị đếm ngược thời gian trên trang Intro
- Giao diện đơn giản, dễ sử dụng

---

## IV. LINK GITHUB

**Link repository**: [Thêm link GitHub của bạn vào đây]

**Ví dụ**: https://github.com/[username]/BTTuan01

---

## V. KẾT LUẬN

Bài tập tuần 01 đã được hoàn thành đầy đủ các yêu cầu:
- Cài đặt thành công môi trường làm việc React Native
- Xây dựng ứng dụng với 2 trang theo đúng yêu cầu
- Code đã được đẩy lên GitHub với comment phù hợp

Qua bài tập này, em đã học được:
- Cách cài đặt và thiết lập môi trường phát triển React Native
- Cách sử dụng Expo Router để điều hướng giữa các trang
- Cách sử dụng React Hooks (useState, useEffect) để quản lý state và side effects
- Cách sử dụng các component cơ bản của React Native (Text, Image, Button, SafeAreaView)
- Cách quản lý code với Git và GitHub

---

**Ngày hoàn thành**: [Điền ngày hoàn thành]

**Sinh viên thực hiện**

Nguyễn Thanh Tính
MSSV: 22110247
