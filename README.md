# Viet Food GmbH — Mobile Shopping App

Cross-platform app bán thực phẩm Việt (chạy iOS + Android + web), build từ thiết kế Google Stitch.
Giao diện **giữ nguyên 100%** theo `DESIGN.md` gốc, không thiết kế lại.

- **Frontend:** React 18 + Vite + Tailwind CSS + **Capacitor** (đóng gói thành app iOS/Android)
- **Backend:** Node.js + Express + Prisma + SQLite
- **Ngôn ngữ chính:** Tiếng Đức (DE), có sẵn nút chuyển DE ↔ VI ở góc trên phải

---

## 1. Cấu trúc thư mục

```
viet-food-app/
├── backend/          # API: Express + Prisma + SQLite
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema (7 bảng)
│   │   └── seed.js         # Dữ liệu mẫu (4 danh mục, 11 sản phẩm)
│   ├── src/
│   │   ├── index.js        # Express app
│   │   └── routes/         # products, categories, cart, checkout, orders, customers, support
│   └── uploads/products/   # Ảnh sản phẩm (cơ chế thay ảnh nằm ở đây)
└── frontend/         # App React + Vite + Capacitor
    ├── src/
    │   ├── pages/          # Shop, ProductDetail, Checkout, Support
    │   ├── components/     # TopAppBar, BottomNav, ProductCard, ...
    │   ├── context/        # CartContext (giỏ hàng)
    │   ├── api/client.js   # Gọi API + hàm imageUrl()
    │   └── i18n/           # de.json (mặc định) + vi.json
    └── tailwind.config.js  # Toàn bộ design token từ DESIGN.md
```

---

## 2. Yêu cầu cài đặt (Windows)

Chỉ cần **Node.js** (bản LTS 18 trở lên). Tải tại https://nodejs.org → cài bản "LTS".
SQLite không cần cài riêng, Prisma tự lo. Không cần MySQL/PHP.

Kiểm tra sau khi cài (mở **Command Prompt** hoặc **PowerShell**):
```
node -v
npm -v
```

---

## 3. Chạy BACKEND

Mở terminal thứ nhất:

```bat
cd viet-food-app\backend
npm install
npm run setup       :: prisma generate + tạo DB (dev.db) + nạp dữ liệu mẫu
npm run dev         :: khởi động API
```

API chạy ở **http://localhost:4000**. Kiểm tra: mở trình duyệt vào
http://localhost:4000/api/products — phải thấy danh sách sản phẩm dạng JSON.

> `npm run setup` chỉ cần chạy **một lần đầu** (hoặc khi đổi schema/seed). Lần sau chỉ cần `npm run dev`.

---

## 4. Chạy FRONTEND

Mở terminal thứ hai (giữ backend đang chạy):

```bat
cd viet-food-app\frontend
npm install
npm run dev
```

Mở **http://localhost:5173** trên trình duyệt. Xong — app đã chạy và lấy dữ liệu từ backend.

---

## 5. Cấu hình kết nối Backend (.env)

File `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
```

- Chạy thử trên **trình duyệt PC**: để nguyên `localhost`.
- Chạy trên **điện thoại/emulator thật**: đổi thành IP LAN của máy tính, ví dụ
  `VITE_API_URL=http://192.168.1.20:4000` (xem IP bằng lệnh `ipconfig`).
  Điện thoại và PC phải cùng mạng Wi-Fi. Nhớ `npm run build` lại sau khi đổi.

---

## 6. Database schema (đề xuất)

7 bảng trong `backend/prisma/schema.prisma`:

| Bảng | Vai trò |
|------|---------|
| **Category** | Danh mục (Gemüse, Nudeln, Saucen, Getränke) — song ngữ DE/VI |
| **Product** | Sản phẩm: tên/phụ đề/mô tả DE+VI, giá, giá cũ, ảnh, còn hàng, badges, danh mục |
| **Customer** | Khách hàng (tạo khi đặt hàng) |
| **Cart** + **CartItem** | Giỏ hàng theo session (không cần đăng nhập) |
| **Order** + **OrderItem** | Đơn hàng + snapshot giá/tên tại thời điểm đặt |
| **SupportMessage** | Tin nhắn chat hỗ trợ (user/agent) |

Xem DB trực quan: `cd backend && npx prisma studio`.

---

## 7. Cơ chế thay ảnh sản phẩm (item #11)

Ảnh **không** còn dùng link Google. Mỗi sản phẩm có field `image` = tên file, được backend phục vụ tại `/uploads/products/<tên-file>`.

**Cách thay ảnh:** chỉ cần copy ảnh mới đè lên file cùng tên trong
`backend/uploads/products/` (vd `frische-kraeutermischung.jpg`), hoặc đổi field `image`
trong `prisma/seed.js` rồi chạy lại `npm run seed`. Ảnh hiện tại là placeholder thương hiệu,
thay bằng ảnh thật bất cứ lúc nào.

---

## 8. Đóng gói app iOS / Android (Capacitor)

Sau khi `npm run dev` chạy ổn:

```bat
cd viet-food-app\frontend
npm run build
npx cap add android      :: thêm project Android (chỉ lần đầu)
npx cap add ios          :: thêm project iOS (cần máy Mac + Xcode)
npm run cap:android      :: build + sync + mở Android Studio
npm run cap:ios          :: build + sync + mở Xcode (trên Mac)
```

- **Android:** cần cài **Android Studio**.
- **iOS:** cần **máy Mac + Xcode** (đây là lý do bạn đang xử lý Apple Developer Program).
- Khi build app thật, nhớ đặt `VITE_API_URL` trỏ tới backend đã deploy (vd trên Render),
  vì `localhost` trên điện thoại sẽ trỏ vào chính điện thoại.

---

## 9. API endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/products?category=&search=` | Danh sách sản phẩm (lọc + tìm kiếm) |
| GET | `/api/products/:idOrSlug` | Chi tiết 1 sản phẩm |
| POST | `/api/cart` | Tạo giỏ hàng |
| GET/POST/PATCH/DELETE | `/api/cart/:id/items...` | Thao tác giỏ hàng |
| POST | `/api/checkout` | Đặt hàng (tự tính giá ở server) → trả về `orderNumber` |
| GET | `/api/orders/:orderNumber` | Tra cứu đơn |
| GET/POST | `/api/support/:sessionId/messages` | Chat hỗ trợ (có auto-reply) |

---

## 10. Deploy backend lên Render (gợi ý)

1. Push thư mục `backend/` lên GitHub.
2. Render → New → Web Service → chọn repo.
3. Build Command: `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js`
4. Start Command: `npm start`
5. Lấy URL Render điền vào `frontend/.env` → `VITE_API_URL`.

> Lưu ý: SQLite trên Render dùng disk tạm; muốn dữ liệu bền nên gắn Persistent Disk
> hoặc chuyển `provider` sang `postgresql` (Prisma chỉ cần đổi datasource + URL).

---

## Ghi chú

- **Font icon** (Material Symbols) và **Inter** tải từ Google Fonts CDN trong `index.html` →
  thiết bị cần có mạng để hiện icon (app vốn cũng cần mạng để gọi API).
- Tab **Profil** ở thanh dưới hiện trỏ về trang Shop (màn hình profile không nằm trong phạm vi 4 màn yêu cầu).
- Sản phẩm `Bio-Thai-Basilikum` được seed ở trạng thái **hết hàng** để minh hoạ màn out-of-stock.
