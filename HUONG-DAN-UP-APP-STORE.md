# Hướng dẫn đưa Viet Food lên App Store (iPhone + iPad)

Mọi thứ trong repo đã chuẩn bị sẵn: thư mục `frontend/ios` (project Xcode), icon + splash đã generate từ logo, Info.plist đã cấu hình. Bạn chỉ cần làm theo thứ tự dưới đây **trên máy Mac**.

---

## Bước 0 — BẮT BUỘC làm trước: deploy backend

App Store reviewer sẽ mở app và bấm thử đặt hàng. Nếu backend chưa chạy online → app trắng trơn → **reject ngay**.

1. Deploy thư mục `backend/` lên Render (giống cách deploy backend LLST).
2. Lấy URL dạng `https://xxx.onrender.com`.
3. Mở `frontend/.env.production`, thay dòng cuối:
   ```
   VITE_API_URL=https://xxx.onrender.com
   ```
   ⚠️ Phải là **https** — iOS chặn http mặc định (App Transport Security).
4. Lưu ý Render free tier ngủ sau 15 phút → reviewer mở app sẽ thấy loading 30–50 giây rồi mới có dữ liệu, dễ bị reject "app không load". Nên bật gói Starter ($7/tháng) ít nhất trong thời gian review, hoặc dùng cron ping giữ backend thức.

## Bước 1 — Cài môi trường trên Mac (làm 1 lần)

```bash
# Kiểm tra đã có Node chưa, chưa có thì cài từ nodejs.org (bản LTS)
node -v

# Cài CocoaPods (Capacitor cần)
sudo gem install cocoapods
```

Mở Xcode 1 lần → Settings → Accounts → đăng nhập Apple ID developer của bạn.

## Bước 2 — Build project

Copy thư mục `viet-food-app` sang Mac (AirDrop / USB / GitHub), rồi:

```bash
cd viet-food-app/frontend
npm install
npm run build
npx cap sync ios
npx cap open ios      # mở Xcode
```

## Bước 3 — Ký app trong Xcode (1 phút)

1. Cột trái bấm **App** (icon xanh trên cùng) → tab **Signing & Capabilities**.
2. Tick **Automatically manage signing**.
3. **Team**: chọn team developer của bạn. Xcode tự tạo certificate + đăng ký bundle ID `com.vietfood.app`.
4. Nếu báo lỗi bundle ID trùng → đổi thành `com.vietfood.shop` ở ô Bundle Identifier (nhớ dùng đúng ID này ở Bước 5).

## Bước 4 — Chạy thử

- Thanh trên cùng Xcode: chọn **iPhone 16 Pro** simulator → bấm ▶. Kiểm tra: xem sản phẩm, thêm giỏ, đặt hàng thành công.
- Đổi sang **iPad Pro 13-inch** → bấm ▶ lần nữa. App đã responsive (lưới 3–4 cột trên iPad) nên chỉ cần nhìn qua các trang.
- Có iPhone thật thì cắm cáp chạy thử càng tốt.

## Bước 5 — Tạo app trên App Store Connect

Vào [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → nút **+** → **New App**:

| Trường | Điền |
|---|---|
| Platforms | iOS (đã bao gồm iPadOS) |
| Name | Viet Food GmbH (hoặc tên khác nếu bị trùng) |
| Primary Language | German |
| Bundle ID | chọn `com.vietfood.app` (xuất hiện sau Bước 3) |
| SKU | vietfood-001 |

## Bước 6 — Archive & Upload

Trong Xcode:

1. Thanh thiết bị chọn **Any iOS Device (arm64)** (không phải simulator).
2. Menu **Product → Archive** (đợi ~2–5 phút).
3. Cửa sổ Organizer hiện ra → **Distribute App** → **App Store Connect** → **Upload** → Next hết → Upload.
4. Đợi 10–30 phút, build xuất hiện trong App Store Connect (mục TestFlight).

## Bước 7 — Điền thông tin & Submit

Trong App Store Connect, tab **App Store** → phiên bản 1.0:

**Screenshots** (chụp từ simulator bằng ⌘S, kéo thả vào):
- iPhone 6.9" — chụp từ iPhone 16 Pro Max simulator: 3–5 ảnh (Home, chi tiết món, giỏ hàng, checkout)
- iPad 13" — chụp từ iPad Pro 13" simulator: 3–5 ảnh tương tự

**Các trường bắt buộc:**
- Description + Keywords: tiếng Đức (mình soạn sẵn được, bảo mình nhé)
- Support URL: website hoặc trang liên hệ của bên bạn
- **Privacy Policy URL**: bắt buộc. Chưa có thì mình soạn 1 trang privacy policy tiếng Đức, up lên Netlify là xong.

**App Privacy** (mục khai báo dữ liệu — khai đúng như sau):
- Collect data? → **Yes**
- Chọn: **Name, Physical Address, Phone Number, Email Address** (khách điền lúc checkout) + **Purchase History** (đơn hàng)
- Mỗi loại: dùng cho **App Functionality**, **linked to user**, **KHÔNG** dùng để tracking → app không cần hiện popup ATT.

**Age Rating**: trả lời No hết → 4+.

**Pricing**: Free. Availability: Germany (+ các nước EU muốn bán).

Cuối cùng chọn build vừa upload → **Add for Review** → **Submit**.

## Bước 8 — Đợi review

- Thường 24–48h. Bị reject thì đọc lý do trong Resolution Center, gửi mình xử lý tiếp.
- Muốn test với người thật trước khi lên store: dùng tab **TestFlight**, thêm tester bằng email, không cần đợi review lâu.

---

## Những gì đã sửa sẵn trong code (để bạn biết)

1. **Ẩn tab Profile** ở thanh dưới — route `/profile` chưa tồn tại, bấm vào chỉ quay về Home → Apple reject vì "tính năng chết". Làm xong trang Profile thì mở comment trong `BottomNav.jsx`.
2. **Ẩn PayPal / Visa** ở trang checkout — app chưa nối cổng thanh toán thật, reviewer chọn "trả bằng thẻ" mà không phải nhập thẻ → reject Guideline 2.1. Còn lại **Nachnahme (COD)** là hợp lệ vì bán hàng physical (không dính In-App Purchase). Khi nào tích hợp Stripe thì mở comment trong `Checkout.jsx`.
3. **Info.plist**: iPhone khóa dọc (portrait), iPad đủ 4 hướng + Split View; khai báo app chỉ dùng mã hóa HTTPS (khỏi phải trả lời câu hỏi export compliance mỗi lần upload); ngôn ngữ mặc định = German.
4. **Icon + Splash**: generate đủ size cho iOS từ `logo.png` (icon 1024 không alpha đúng chuẩn App Store, splash nền #c6e4e4 khớp logo, có bản dark mode).
5. **`.env.production`**: file riêng cho URL backend thật, build release tự dùng file này.
