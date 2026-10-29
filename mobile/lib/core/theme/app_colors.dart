import 'package:flutter/material.dart';

/// Bảng màu Tailwind (v3) đúng giá trị web đang dùng — đặt tên giống class Tailwind
/// để đối chiếu 1-1 khi port giao diện (vd `text-zinc-500` → `Tw.zinc500`).
abstract final class Tw {
  // zinc
  static const zinc50 = Color(0xFFFAFAFA);
  static const zinc100 = Color(0xFFF4F4F5);
  static const zinc200 = Color(0xFFE4E4E7);
  static const zinc300 = Color(0xFFD4D4D8);
  static const zinc400 = Color(0xFFA1A1AA);
  static const zinc500 = Color(0xFF71717A);
  static const zinc600 = Color(0xFF52525B);
  static const zinc700 = Color(0xFF3F3F46);
  static const zinc800 = Color(0xFF27272A);
  static const zinc900 = Color(0xFF18181B);
  static const zinc950 = Color(0xFF09090B);

  // gray (dùng cho viền/khung ngoài: border-gray-200, text-gray-600…)
  static const gray50 = Color(0xFFF9FAFB);
  static const gray100 = Color(0xFFF3F4F6);
  static const gray200 = Color(0xFFE5E7EB);
  static const gray300 = Color(0xFFD1D5DB);
  static const gray500 = Color(0xFF6B7280);
  static const gray600 = Color(0xFF4B5563);
  static const gray900 = Color(0xFF111827);

  // Màu riêng của dự án (dark mode)
  static const darkBg = Color(0xFF0F0F12); // bg-[#0F0F12]
  static const darkBorder = Color(0xFF1F1F23); // border-[#1F1F23]

  // amber — trạng thái "Chưa thực hiện", badge admin
  static const amber100 = Color(0xFFFEF3C7);
  static const amber400 = Color(0xFFFBBF24);
  static const amber500 = Color(0xFFF59E0B);
  static const amber600 = Color(0xFFD97706);
  static const amber700 = Color(0xFFB45309);
  static const amber900 = Color(0xFF78350F);

  // blue — "Đang thực hiện", badge khách hàng
  static const blue100 = Color(0xFFDBEAFE);
  static const blue400 = Color(0xFF60A5FA);
  static const blue500 = Color(0xFF3B82F6);
  static const blue600 = Color(0xFF2563EB);
  static const blue700 = Color(0xFF1D4ED8);
  static const blue900 = Color(0xFF1E3A8A);

  // emerald — "Đã hoàn thành", trạng thái hoạt động
  static const emerald100 = Color(0xFFD1FAE5);
  static const emerald400 = Color(0xFF34D399);
  static const emerald500 = Color(0xFF10B981);
  static const emerald600 = Color(0xFF059669);
  static const emerald700 = Color(0xFF047857);
  static const emerald900 = Color(0xFF064E3B);

  // red — quá hạn, ưu tiên cao, lỗi, khoá
  static const red50 = Color(0xFFFEF2F2);
  static const red100 = Color(0xFFFEE2E2);
  static const red200 = Color(0xFFFECACA);
  static const red400 = Color(0xFFF87171);
  static const red500 = Color(0xFFEF4444);
  static const red600 = Color(0xFFDC2626);
  static const red700 = Color(0xFFB91C1C);
  static const red900 = Color(0xFF7F1D1D);

  // indigo — ưu tiên "Trung bình"
  static const indigo100 = Color(0xFFE0E7FF);
  static const indigo400 = Color(0xFF818CF8);
  static const indigo600 = Color(0xFF4F46E5);
  static const indigo900 = Color(0xFF312E81);

  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);

  /// Tương đương `bg-xxx-900/30` của Tailwind.
  static Color alpha(Color c, double opacity) => c.withValues(alpha: opacity);
}

/// Chọn màu theo theme — tương đương cặp class `xxx dark:yyy` của Tailwind.
extension TwBrightness on BuildContext {
  bool get isDark => Theme.of(this).brightness == Brightness.dark;
  Color tw(Color light, Color dark) => isDark ? dark : light;
}
