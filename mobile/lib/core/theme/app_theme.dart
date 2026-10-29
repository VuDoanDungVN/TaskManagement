import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Kích thước theo thang Tailwind web đang dùng.
abstract final class TwSize {
  // font-size: text-[10px], text-[11px], text-xs, text-sm, text-base, text-lg, text-xl
  static const double text10 = 10;
  static const double text11 = 11;
  static const double textXs = 12;
  static const double textSm = 14;
  static const double textBase = 16;
  static const double textLg = 18;
  static const double textXl = 20;

  // border-radius: rounded-md, rounded-lg, rounded-xl, rounded-2xl
  static const double radiusMd = 6;
  static const double radiusLg = 8;
  static const double radiusXl = 12;
  static const double radius2xl = 16;

  /// Khoảng cách Tailwind: 1 đơn vị = 4px (p-4 = 16).
  static double sp(double n) => n * 4;
}

/// Theme sáng/tối khớp màu nền, viền, chữ của web (light: trắng/zinc, dark: #0F0F12/#1F1F23).
abstract final class AppTheme {
  static const fontFamily = 'Inter';

  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness b) {
    final dark = b == Brightness.dark;
    final surface = dark ? Tw.darkBg : Tw.white;
    final border = dark ? Tw.darkBorder : Tw.gray200;
    final onSurface = dark ? Tw.zinc100 : Tw.zinc900;
    final muted = dark ? Tw.zinc400 : Tw.zinc500;

    final scheme = ColorScheme(
      brightness: b,
      // Nút chính của web: bg-zinc-900 text-zinc-50 / dark:bg-zinc-50 text-zinc-900
      primary: dark ? Tw.zinc50 : Tw.zinc900,
      onPrimary: dark ? Tw.zinc900 : Tw.zinc50,
      secondary: dark ? Tw.zinc800 : Tw.zinc100,
      onSecondary: onSurface,
      error: dark ? Tw.red400 : Tw.red600,
      onError: Tw.white,
      surface: surface,
      onSurface: onSurface,
      onSurfaceVariant: muted,
      outline: border,
      outlineVariant: dark ? Tw.zinc800 : Tw.zinc100,
      surfaceContainerHighest: dark ? Tw.zinc800 : Tw.zinc100,
    );

    final base = ThemeData(
      useMaterial3: true,
      brightness: b,
      colorScheme: scheme,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: surface,
      // Không hiệu ứng gợn sóng Material — web chỉ đổi màu nền khi hover/nhấn
      splashFactory: NoSplash.splashFactory,
      highlightColor: dark ? Tw.alpha(Tw.zinc800, 0.5) : Tw.zinc100,
      dividerColor: dark ? Tw.zinc800 : Tw.zinc100,
    );

    final text = base.textTheme.apply(
      fontFamily: fontFamily,
      bodyColor: onSurface,
      displayColor: onSurface,
    );

    return base.copyWith(
      textTheme: text,
      dividerTheme: DividerThemeData(color: dark ? Tw.zinc800 : Tw.zinc100, thickness: 1, space: 1),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        shape: Border(bottom: BorderSide(color: border)),
        titleTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontSize: TwSize.textSm,
          fontWeight: FontWeight.w600,
          color: onSurface,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusXl),
          side: BorderSide(color: border),
        ),
      ),
      // Ô nhập: border-zinc-200 / dark:border-zinc-700, focus ring zinc-500; cỡ chữ 16 tránh
      // iOS tự zoom (giống CSS mobile của web)
      inputDecorationTheme: InputDecorationTheme(
        isDense: true,
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        hintStyle: TextStyle(color: dark ? Tw.zinc500 : Tw.zinc400, fontSize: TwSize.textBase),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          borderSide: BorderSide(color: dark ? Tw.zinc700 : Tw.zinc200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          borderSide: BorderSide(color: dark ? Tw.zinc700 : Tw.zinc200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          borderSide: BorderSide(color: dark ? Tw.zinc400 : Tw.zinc500, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          borderSide: BorderSide(color: dark ? Tw.alpha(Tw.red500, 0.7) : Tw.red400),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: scheme.primary,
          foregroundColor: scheme.onPrimary,
          textStyle: const TextStyle(fontFamily: fontFamily, fontSize: TwSize.textSm, fontWeight: FontWeight.w500),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(TwSize.radiusLg)),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        ),
      ),
      // Bottom navigation thay cho sidebar web
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: dark ? Tw.zinc800 : Tw.zinc100,
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (s) => TextStyle(
            fontFamily: fontFamily,
            fontSize: TwSize.text11,
            fontWeight: s.contains(WidgetState.selected) ? FontWeight.w600 : FontWeight.w500,
            color: s.contains(WidgetState.selected) ? onSurface : muted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (s) => IconThemeData(size: 20, color: s.contains(WidgetState.selected) ? onSurface : muted),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(TwSize.radiusXl))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          side: BorderSide(color: border),
        ),
      ),
    );
  }
}
