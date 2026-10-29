# Task Management — app mobile (Flutter)

App iOS/Android dùng **chung backend** với bản web (Cloudflare Worker + D1 + R2 + Firebase Auth):
cùng API, cùng tài khoản, cùng phân quyền → dữ liệu luôn đồng bộ với web.
Giao diện bám 1-1 bản mobile web (màu, font Inter, icon Lucide); menu dạng Bottom Navigation.

- Bundle ID / applicationId: `jp.co.occ.taskmanagement` · Tên hiển thị: **Task Management**
- Flutter 3.47 / Dart 3.13 · iOS ≥ 15.0

## Màn hình

| Tab (khách hàng) | Tab (admin) |
|---|---|
| Dashboard · Dự án · Thông báo · Cài đặt | Dashboard · Dự án · Thành viên · Team · Cài đặt |

- **Đăng nhập** — email/mật khẩu, quên mật khẩu, thông báo khi tài khoản chưa được cấp quyền / bị khoá (không có đăng ký — admin tạo tài khoản).
- **Dashboard** — thẻ thống kê, Dự án nổi bật, Quá hạn, Sắp đến hạn (7 ngày), Hoạt động gần đây.
- **Dự án** → **Chi tiết dự án** — Thành viên dự án (mở/đóng), lọc trạng thái, tìm kiếm, danh sách task gọn, nút "Tạo task" cố định dưới đáy.
- **Tạo/sửa task** — số No do server cấp; ngày bắt đầu mặc định hôm nay; người phụ trách mặc định là mình;
  tối đa 10 ảnh/task (5MB/ảnh), giữ ~0,3s để kéo đổi thứ tự, ☆ đặt ảnh đại diện, tiến trình upload.
- **Chi tiết task** — thư viện ảnh (ảnh lớn + dải ảnh nhỏ, vuốt, toàn màn hình), thông tin, sửa/xoá,
  bình luận (trả lời 1 cấp, sửa/xoá của mình, đính kèm ảnh/Office/PDF ≤25MB).
- **Thông báo** (khách hàng) — tổng hợp từ dữ liệu: task giao cho bạn, quá hạn, sắp đến hạn, cập nhật 7 ngày qua.
  *(Thông báo đẩy FCM: giai đoạn sau — cần thêm ở Worker.)*
- **Thành viên** (admin) — tạo tài khoản + gán dự án + link đặt mật khẩu, gửi lại link, khoá/mở khoá, sửa vai trò, nhóm.
- **Team** (admin) — tạo/sửa/xoá nhóm, thành viên & vai trò, lời mời email, gán dự án.
- **Cài đặt** — Giao diện (Sáng/Tối/Theo hệ thống), Ngôn ngữ (English/Tiếng Việt/日本語); avatar góc trên → hồ sơ, đổi ảnh, đăng xuất.

## Cấu trúc

```
lib/
  core/        env, api client, router, state (Riverpod), theme (token Tailwind), utils
  data/        models.dart + repositories.dart — map 1-1 với lib/api/*.ts của web
  features/    auth, shell, dashboard, projects, tasks, notifications, members, teams, settings, profile
  widgets/     component dùng chung (AppCard, Pill, UserAvatar, Collapse, trình xem ảnh…)
  l10n/        ARB + AppLocalizations (SINH TỰ ĐỘNG — không sửa tay)
  firebase_options.dart   sinh bởi FlutterFire CLI (đã gitignore — xem bước 1)
assets/fonts/  Inter 400/500/600/700 (OFL)
tool/          gen_arb.mjs — sinh ARB từ i18n của web
```

## 1. Cấu hình Firebase (một lần)

Dùng FlutterFire CLI — tự tải `GoogleService-Info.plist` (iOS), `google-services.json` (Android),
gắn vào Xcode/Gradle, và sinh `lib/firebase_options.dart`. Cả 3 file này đã nằm trong `.gitignore`,
mỗi máy dev chạy lệnh dưới một lần (cần đăng nhập `firebase login` trước nếu chưa có CLI):

```bash
dart pub global activate flutterfire_cli   # nếu chưa cài
cd mobile
flutterfire configure -p task-management-pro-2026 --platforms=ios,android \
  -i jp.co.occ.taskmanagement --android-package-name=jp.co.occ.taskmanagement
```

Sau bước này app chạy/build bình thường như mọi app Flutter khác — **không cần** truyền thêm cờ gì.

## 2. Chạy app

```bash
cd mobile
flutter pub get
flutter run
```

`API_URL` mặc định trỏ Worker production (`lib/core/env.dart`). Gọi Worker local khi cần:

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:8787      # Android emulator
flutter run --dart-define=API_URL=http://localhost:8787     # iOS simulator
```

### iOS (macOS)

```bash
cd mobile
flutter pub get
cd ios && pod install && cd ..          # lần đầu (cần Xcode + CocoaPods)
flutter run
```

Nếu `pod install` báo deployment target, mở `ios/Podfile` và đặt `platform :ios, '15.0'`.
Build phát hành: `flutter build ipa` (cần Apple Developer account, chọn Team trong Xcode → Runner → Signing).

### Android

```bash
flutter build apk
```

## Checklist test trên máy thật

1. Đăng nhập admin → tab có Thành viên + Team; đăng nhập khách → tab có Thông báo, chỉ thấy dự án được gán.
2. Đăng xuất → đăng nhập tài khoản khác: không còn dữ liệu của người trước.
3. Tạo task kèm 3–4 ảnh (chụp + thư viện), kéo đổi thứ tự, ☆ đặt đại diện → kiểm tra bên web thấy đúng thứ tự.
4. Mở task: vuốt ảnh, xem toàn màn hình, bình luận kèm PDF → web thấy bình luận ngay khi tải lại.
5. Đổi ngôn ngữ / giao diện trong Cài đặt; tắt mở lại app vẫn giữ.
6. Admin: tạo tài khoản khách + gán dự án → copy link đặt mật khẩu → khách đăng nhập được.
7. Khoá tài khoản khách → khách bị đăng xuất, thấy thông báo "chưa được cấp quyền hoặc đã bị khoá".

## Chuỗi ngôn ngữ (en / vi / ja)

Nguồn duy nhất là `../lib/i18n/dictionaries/*.ts` của web (chuỗi riêng app nằm ở nhóm `mobile`). Sau khi sửa:

```bash
node tool/gen_arb.mjs   # sinh lib/l10n/app_{en,vi,ja}.arb
flutter gen-l10n
```

Key: `auth.login.title` (web) → `t.authLoginTitle` (Dart).

## Kiểm tra

```bash
flutter analyze
flutter test
```

Máy có biến môi trường proxy → `flutter test` lỗi WebSocket 503 khi kết nối 127.0.0.1:

```powershell
$env:NO_PROXY="127.0.0.1,localhost"; flutter test
```
