# Báo Cáo – A06: Hoàn Thiện Thương Mại Điện Tử và Quản Trị

## 1. Giới thiệu

**A06** là phiên bản hoàn chỉnh nhất của ứng dụng KeBook, bổ sung đầy đủ các tính năng thương mại điện tử: giỏ hàng, thanh toán, theo dõi đơn hàng, mã khuyến mãi, và các trang quản trị cho admin. Giao diện được refactor toàn bộ theo phong cách hiện đại.

---

## 2. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React Native | 0.81.5 | Framework đa nền tảng |
| React | 19.1 | Thư viện UI |
| Expo | ~54 | Bộ công cụ phát triển |
| React Navigation | 7.x | Native Stack + Bottom Tabs |
| React Native Paper | 5.x | Material Design 3 UI |
| @expo/vector-icons | latest | MaterialCommunityIcons |
| expo-image | latest | Hiển thị ảnh tối ưu |
| expo-image-picker | latest | Chọn ảnh từ thiết bị |
| expo-image-manipulator | latest | Resize ảnh |
| react-native-gesture-handler | latest | Swipe-to-delete trong giỏ hàng |
| react-native-reanimated | latest | Animation |
| @react-native-community/datetimepicker | latest | Chọn ngày sinh |
| NativeWind | 4.x | Tailwind CSS cho React Native |
| AsyncStorage | latest | Lưu trữ token/user |
| TypeScript | strict | Kiểu dữ liệu tĩnh |

---

## 3. Cấu trúc thư mục

```
A06/
├── App.tsx                          # Root + GestureHandlerRootView + 401 handler
├── theme.ts                         # MD3 theme (primary: #2B4366)
├── navigation/
│   ├── RootStack.tsx                # Stack navigator (17 routes)
│   ├── BottomTabs.tsx               # Tab navigator (4 tabs)
│   └── index.tsx
├── screens/
│   ├── WelcomeScreen.tsx            # Trang chào mừng
│   ├── LoginScreen.tsx              # Đăng nhập
│   ├── RegisterScreen.tsx           # Đăng ký
│   ├── VerifyOtpScreen.tsx          # Xác thực OTP
│   ├── ForgotPasswordScreen.tsx     # Quên mật khẩu
│   ├── ResetPasswordScreen.tsx      # Đặt lại mật khẩu
│   ├── HomeScreen.tsx               # Trang chủ (sách nổi bật, danh mục, infinite scroll)
│   ├── BookDetailScreen.tsx         # Chi tiết sách + Thêm giỏ / Mua ngay
│   ├── CartScreen.tsx               # ★ Giỏ hàng (chọn, số lượng, swipe xóa)
│   ├── CheckoutScreen.tsx           # ★ Thanh toán (tên người nhận, mã giảm giá)
│   ├── OrderHistoryScreen.tsx       # ★ Lịch sử đơn hàng
│   ├── OrderDetailScreen.tsx        # ★ Chi tiết + timeline đơn hàng
│   ├── NotificationsScreen.tsx      # Thông báo
│   ├── ProfileScreen.tsx            # Hồ sơ + link quản trị
│   ├── AdminOrderManageScreen.tsx   # ★ Quản lý đơn hàng (Admin)
│   ├── AdminAddBookScreen.tsx       # ★ Thêm sách (Admin)
│   └── index.ts
├── components/
│   ├── AppButton.tsx
│   ├── AppTextInput.tsx
│   ├── AppSelect.tsx
│   ├── AppDateInput.tsx
│   ├── FormCard.tsx
│   ├── HomeHeader.tsx
│   ├── ProfileHeader.tsx
│   ├── CategorySlider.tsx
│   ├── ProductCard.tsx
│   └── index.ts
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts                       # HTTP client + upload functions
│   ├── auth.ts                      # Auth API
│   ├── books.ts                     # Books API
│   ├── cart.ts                      # ★ Cart API
│   ├── orders.ts                    # ★ Orders API + checkout + admin
│   ├── promotions.ts                # ★ Promotions API
│   ├── users.ts                     # Users API
│   ├── addresses.ts                 # Addresses API
│   └── categories.ts               # Categories API
├── utils/
│   ├── date.ts
│   ├── image.ts
│   └── hash.ts
└── global.css
```

(★ = mới so với A05)

---

## 4. Các bước triển khai

### Bước 1: Xây dựng Cart API và CartScreen

**`lib/cart.ts`:**
- `getMyCart(token)` – Lấy giỏ hàng với thông tin sách (tiêu đề, giá, ảnh, tồn kho).
- `addToCart(token, bookId, qty)` – Thêm sách vào giỏ.
- `updateCartItem(token, itemId, qty)` – Cập nhật số lượng.
- `removeCartItem(token, itemId)` – Xóa khỏi giỏ.

**CartScreen:**
- Hiển thị danh sách sản phẩm trong giỏ.
- Checkbox chọn từng sản phẩm hoặc chọn tất cả để thanh toán.
- Nút +/- và nhập trực tiếp số lượng (giới hạn bởi tồn kho).
- Swipe-to-delete bằng `react-native-gesture-handler`.
- Hiển thị giá gốc (gạch ngang) và giá giảm.
- Tính tổng tiền, giảm giá, phí vận chuyển (30,000đ).
- Nút "Thanh toán" gửi danh sách sản phẩm đã chọn.

### Bước 2: Xây dựng CheckoutScreen

- Hiển thị danh sách sản phẩm sẽ mua.
- Form thông tin giao hàng:
  - **Họ tên người nhận** (tự điền từ profile, cho phép chỉnh sửa).
  - Số điện thoại.
  - Địa chỉ, Tỉnh/Thành phố, Phường/Xã (dropdown).
- Phương thức thanh toán: COD (thanh toán khi nhận hàng).
- Mã giảm giá:
  - Nhập mã khuyến mãi.
  - Tự động kiểm tra khi người dùng ngừng nhập (debounce 500ms).
  - Hiển thị số tiền giảm hoặc lỗi nếu mã không hợp lệ.
- Tóm tắt đơn hàng: tạm tính, giảm giá KM, phí vận chuyển, tổng cộng.
- Ghi chú đơn hàng.

**Hai chế độ checkout:**
1. **Từ giỏ hàng** – Thanh toán các sản phẩm đã chọn (checkbox).
2. **Mua ngay** – Từ BookDetailScreen, thanh toán 1 cuốn duy nhất.

### Bước 3: Cập nhật BookDetailScreen

- Thêm nút "Thêm vào giỏ hàng" – gọi `addToCart`.
- Thêm nút "Mua ngay" – navigate thẳng đến Checkout với 1 cuốn sách.
- Xử lý trường hợp sách không có trong giỏ (fetch trực tiếp từ API).

### Bước 4: Xây dựng Orders API (`lib/orders.ts`)

**Types:**
- `Order`, `OrderItem`, `OrderStatusHistory`, `OrderCheckoutSummary`.
- `CheckoutPayload` (full_name, phone, address, province, ward, promo_code, items).
- Enum `ORDER_STATUS_LABEL` và `STATUS_COLOR` cho mapping trạng thái.

**User APIs:**
- `checkoutFromCart(token, payload)` – Đặt hàng.
- `getMyOrders(token, status?)` – Lịch sử đơn hàng.
- `getOrderDetail(token, orderId)` – Chi tiết đơn hàng.
- `cancelMyOrder(token, orderId, reason?)` – Hủy đơn hàng.

**Admin APIs:**
- `adminGetOrders(token, params)` – Danh sách đơn (phân trang, lọc).
- `adminGetOrderDetail(token, orderId)` – Chi tiết đơn.
- `adminUpdateOrderStatus(token, orderId, status)` – Cập nhật trạng thái.

### Bước 5: Xây dựng Promotions API (`lib/promotions.ts`)

- `previewPromotion(token, code, subtotal)` – Kiểm tra mã và xem trước giảm giá.

### Bước 6: Xây dựng OrderHistoryScreen

- Hiển thị danh sách đơn hàng.
- Bộ lọc trạng thái: Tất cả, Chờ xử lý, Đã xác nhận, Đang giao, Hoàn thành, Đã hủy.
- Mỗi đơn hiển thị: mã đơn, ngày đặt, trạng thái (chip màu), tổng tiền.
- Nhấn vào đơn → navigate đến OrderDetail.

### Bước 7: Xây dựng OrderDetailScreen

- Thông tin đơn hàng: mã, ngày đặt, trạng thái, SĐT, địa chỉ.
- **Timeline trạng thái** – hiển thị lịch sử thay đổi trạng thái theo thời gian.
- Danh sách sản phẩm: tên sách, số lượng, giá.
- Tổng tiền.
- **Nút hủy đơn** (điều kiện):
  - Hủy trực tiếp nếu đơn ở trạng thái PENDING/CONFIRMED và trong vòng 30 phút.
  - Gửi yêu cầu hủy nếu đã quá 30 phút hoặc đơn đang chuẩn bị.

### Bước 8: Xây dựng AdminOrderManageScreen

- Danh sách tất cả đơn hàng (phân trang).
- Bộ lọc trạng thái.
- Mỗi đơn hiển thị: mã đơn, **tên khách hàng**, ngày đặt, trạng thái, tổng tiền.
- Modal chi tiết đơn:
  - Thông tin khách hàng.
  - Danh sách sản phẩm với **tên sách** (thay vì ID).
  - RadioButton chọn trạng thái mới → cập nhật.

### Bước 9: Xây dựng AdminAddBookScreen

- Form thêm sách mới:
  - Ảnh bìa (chọn từ thiết bị, upload lên Cloudinary).
  - Thông tin cơ bản: tiêu đề, tác giả, danh mục, giá, tồn kho.
  - Chi tiết: NXB, ngày xuất bản, ISBN, mô tả.
  - Kích thước: chiều dài, rộng, cao, trọng lượng, số trang.

### Bước 10: Refactor giao diện toàn bộ

- Loại bỏ `FormCard` wrapper cho layout sạch hơn.
- Sử dụng `elevation` và `shadow` cho card sections.
- Áp dụng `MaterialCommunityIcons` nhất quán.
- Cải thiện typography, spacing, màu sắc.
- Giao diện tiếng Việt toàn bộ.

---

## 5. Hệ thống trạng thái đơn hàng

| Trạng thái | Nhãn tiếng Việt | Màu |
|------------|-----------------|-----|
| PENDING | Chờ xử lý | #FB8C00 |
| CONFIRMED | Đã xác nhận | #1E88E5 |
| INPROGRESS | Đang chuẩn bị | #8E24AA |
| SHIPPED | Đang giao hàng | #00ACC1 |
| DELIVERED | Đã giao hàng | #43A047 |
| COMPLETED | Hoàn thành | #2E7D32 |
| CANCELLED | Đã hủy | #E53935 |
| CANCEL_REQUESTED | Yêu cầu hủy | #F4511E |
| RETURNED | Đã trả hàng | #757575 |

- **Tự động xác nhận**: đơn hàng được tự động xác nhận sau 30 phút nếu không có thao tác.
- **Hủy đơn**: chỉ cho phép trong 30 phút đầu (PENDING/CONFIRMED). Sau đó chuyển sang yêu cầu hủy.

---

## 6. Điều hướng

```
RootStack
├── Welcome
├── Login
├── Register
├── VerifyOtp { email }
├── ForgotPassword
├── ResetPassword { email }
├── Tabs (BottomTabs)
│     ├── Home
│     ├── Notifications
│     ├── Cart
│     └── Profile
├── BookDetail { bookId }
├── Checkout { mode?, items? }
├── OrderHistory
├── OrderDetail { orderId }
├── AdminOrders
└── AdminAddBook
```

---

## 7. API Backend tích hợp

| Endpoint | Method | Mô tả |
|----------|--------|--------|
| `/auth/*` | POST | Xác thực (login, register, OTP, reset) |
| `/books` | GET | Danh sách sách |
| `/books/:id` | GET | Chi tiết sách |
| `/books/top-selling` | GET | Sách bán chạy |
| `/books/top-discounted` | GET | Sách giảm giá |
| `/cart` | GET | Giỏ hàng |
| `/cart/summary` | GET | Giỏ hàng kèm thông tin sách |
| `/cart` | POST | Thêm vào giỏ |
| `/cart/:id` | PUT | Cập nhật số lượng |
| `/cart/:id` | DELETE | Xóa khỏi giỏ |
| `/orders/checkout` | POST | Đặt hàng |
| `/orders/my` | GET | Lịch sử đơn hàng |
| `/orders/:id` | GET | Chi tiết đơn |
| `/orders/:id/cancel` | POST | Hủy đơn |
| `/orders/admin` | GET | Danh sách đơn (Admin) |
| `/orders/admin/:id` | GET | Chi tiết đơn (Admin) |
| `/orders/admin/:id/status` | PATCH | Cập nhật trạng thái (Admin) |
| `/promotions/preview` | POST | Kiểm tra mã giảm giá |
| `/users/me` | GET | Thông tin người dùng |
| `/users/:id` | PATCH | Cập nhật hồ sơ |
| `/upload/avatar` | POST | Upload avatar |
| `/upload/book-image` | POST | Upload ảnh sách |
| `/addresses/*` | GET | Tỉnh/thành, phường/xã |
| `/categories` | GET | Danh mục sách |

---

## 8. So sánh tổng quan A02 → A06

| Tính năng | A02 | A03 | A04 | A05 | A06 |
|-----------|-----|-----|-----|-----|-----|
| Xác thực | ✅ | ✅ | ✅ | ✅ | ✅ |
| Điều hướng | Expo Router | React Nav Stack | Stack | Stack + Tabs | Stack + Tabs |
| Danh sách sách | — | — | ✅ | ✅ (nâng cấp) | ✅ |
| Chi tiết sách | — | — | ✅ | ✅ | ✅ (+ Mua ngay) |
| Hồ sơ | — | — | ✅ | ✅ | ✅ |
| Giỏ hàng | — | — | — | Placeholder | ✅ (đầy đủ) |
| Thanh toán | — | — | — | — | ✅ |
| Đơn hàng | — | — | — | — | ✅ |
| Mã giảm giá | — | — | — | — | ✅ |
| Admin | — | — | — | — | ✅ |
| Số màn hình | 7 | 7 | 9 | 11 | 16 |

---

## 9. Kết luận

A06 hoàn thiện ứng dụng KeBook thành một hệ thống thương mại điện tử đầy đủ chức năng. Từ luồng xác thực cơ bản ở A02, ứng dụng đã phát triển qua 5 phiên bản với giỏ hàng, thanh toán, theo dõi đơn hàng, quản lý khuyến mãi, và các trang quản trị cho admin. Giao diện được refactor hiện đại với Material Design 3, đảm bảo trải nghiệm người dùng nhất quán trên cả iOS, Android và Web.
