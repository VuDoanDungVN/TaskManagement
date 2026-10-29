import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:taskmanagement/core/state/settings.dart';
import 'package:taskmanagement/core/theme/app_theme.dart';
import 'package:taskmanagement/data/models.dart';
import 'package:taskmanagement/features/auth/login_screen.dart';
import 'package:taskmanagement/features/projects/project_detail_screen.dart';
import 'package:taskmanagement/features/settings/settings_screen.dart';
import 'package:taskmanagement/l10n/app_localizations.dart';
import 'package:taskmanagement/main.dart';

/// Bọc widget với theme + i18n + Riverpod (prefs giả lập), ngôn ngữ cố định.
Future<void> pumpApp(WidgetTester tester, Widget child, {String locale = 'vi'}) async {
  SharedPreferences.setMockInitialValues({'settings.locale': locale});
  final prefs = await SharedPreferences.getInstance();
  await tester.pumpWidget(ProviderScope(
    overrides: [sharedPrefsProvider.overrideWithValue(prefs)],
    child: Consumer(builder: (context, ref, _) {
      final s = ref.watch(settingsProvider);
      return MaterialApp(
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: s.themeMode,
        locale: s.locale,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: Scaffold(body: child),
      );
    }),
  ));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('Thiếu config Firebase → màn hướng dẫn (tiếng Anh mặc định)', (tester) async {
    SharedPreferences.setMockInitialValues({'settings.locale': 'en'});
    final prefs = await SharedPreferences.getInstance();
    await tester.pumpWidget(ProviderScope(
      overrides: [sharedPrefsProvider.overrideWithValue(prefs)],
      child: const ConfigMissingApp(),
    ));
    await tester.pumpAndSettle();
    expect(find.text('Firebase configuration missing'), findsOneWidget);
  });

  testWidgets('Màn đăng nhập: thông báo bị từ chối + không có nút Đăng ký', (tester) async {
    await pumpApp(tester, const LoginScreen(denied: true));
    expect(find.text('Đăng nhập'), findsWidgets);
    expect(find.textContaining('chưa được cấp quyền'), findsOneWidget);
    expect(find.text('Đăng ký'), findsNothing);
  });

  testWidgets('Dòng task mobile: #No, ưu tiên Cao, số bình luận/ảnh', (tester) async {
    final task = Task.fromJson({
      'id': 't', 'projectId': 'p', 'no': 7, 'title': 'Sửa lỗi đăng nhập', 'status': 'pending', 'priority': 'high', //
      'assignee': 'Yến', 'dueDate': '2026-01-01', 'createdAt': 0, 'updatedAt': 0, 'commentCount': 3, 'imageCount': 2,
    });
    await pumpApp(tester, MobileTaskItem(task: task));
    expect(find.text('#07'), findsOneWidget);
    expect(find.textContaining('Sửa lỗi đăng nhập'), findsOneWidget);
    expect(find.text('Cao'), findsOneWidget);
    expect(find.text('Yến'), findsOneWidget);
    expect(find.text('3'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
  });

  testWidgets('Cài đặt: mở mục Ngôn ngữ và đổi sang tiếng Anh', (tester) async {
    await pumpApp(tester, const SettingsScreen());
    // Đang tiếng Việt
    expect(find.text('Giao diện'), findsOneWidget);
    await tester.tap(find.text('Ngôn ngữ'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English').last);
    await tester.pumpAndSettle();
    expect(find.text('Appearance'), findsOneWidget);
  });
}
