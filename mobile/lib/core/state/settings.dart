import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// SharedPreferences được nạp trong main() rồi override vào đây.
final sharedPrefsProvider = Provider<SharedPreferences>((ref) => throw UnimplementedError());

class AppSettings {
  const AppSettings({required this.themeMode, required this.locale});
  final ThemeMode themeMode;
  final Locale locale;

  AppSettings copyWith({ThemeMode? themeMode, Locale? locale}) =>
      AppSettings(themeMode: themeMode ?? this.themeMode, locale: locale ?? this.locale);
}

const supportedLanguageCodes = ['en', 'vi', 'ja'];

/// Giao diện (sáng/tối/hệ thống) + ngôn ngữ — lưu lại giữa các lần mở app
/// (tương đương next-themes + localStorage "task-manager:locale:v1" của web).
class SettingsController extends Notifier<AppSettings> {
  static const _themeKey = 'settings.themeMode';
  static const _localeKey = 'settings.locale';

  SharedPreferences get _prefs => ref.read(sharedPrefsProvider);

  @override
  AppSettings build() {
    final theme = switch (_prefs.getString(_themeKey)) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    // Mặc định theo ngôn ngữ máy nếu được hỗ trợ, ngược lại tiếng Anh (mặc định của web)
    final device = PlatformDispatcher.instance.locale.languageCode;
    final code = _prefs.getString(_localeKey) ?? (supportedLanguageCodes.contains(device) ? device : 'en');
    return AppSettings(themeMode: theme, locale: Locale(code));
  }

  void setThemeMode(ThemeMode mode) {
    _prefs.setString(_themeKey, mode.name);
    state = state.copyWith(themeMode: mode);
  }

  void setLocale(String code) {
    _prefs.setString(_localeKey, code);
    state = state.copyWith(locale: Locale(code));
  }
}

final settingsProvider = NotifierProvider<SettingsController, AppSettings>(SettingsController.new);
