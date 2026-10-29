import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/settings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_bar.dart';
import '../../widgets/common.dart';
import '../shell/app_shell.dart';

/// Cài đặt — bản mobile của app/dashboard/settings: danh sách mở/đóng
/// Giao diện (Sáng/Tối/Theo hệ thống) và Ngôn ngữ (3 ngôn ngữ), lựa chọn full chiều ngang.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

enum _Section { appearance, language }

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  _Section? _open; // chỉ mở 1 mục mỗi lần

  void _toggle(_Section s) => setState(() => _open = _open == s ? null : s);

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final settings = ref.watch(settingsProvider);
    final ctrl = ref.read(settingsProvider.notifier);

    final themes = [
      (ThemeMode.light, LucideIcons.sun, t.settingsThemeLight),
      (ThemeMode.dark, LucideIcons.moon, t.settingsThemeDark),
      (ThemeMode.system, LucideIcons.monitor, t.settingsThemeSystem),
    ];
    // Tên ngôn ngữ hiển thị bằng chính ngôn ngữ đó (giống web)
    final languages = [('en', t.languagesEn), ('vi', t.languagesVi), ('ja', t.languagesJa)];
    final currentTheme = themes.firstWhere((x) => x.$1 == settings.themeMode).$3;
    final currentLang = languages.firstWhere((x) => x.$1 == settings.locale.languageCode, orElse: () => languages.first).$2;

    return Scaffold(
      appBar: TabAppBar(title: t.settingsTitle),
      body: ListView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + navBarClearance(context)),
        children: [
          AppCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(LucideIcons.settings, size: 16, color: context.tw(Tw.zinc700, Tw.zinc300)),
                const SizedBox(width: 8),
                Text(t.settingsTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w700)),
              ]),
              const SizedBox(height: 4),
              Text(t.settingsSubtitle, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
            ]),
          ),
          const SizedBox(height: 16),
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(children: [
              _Row(
                icon: LucideIcons.palette,
                label: t.settingsSectionAppearance,
                value: currentTheme,
                open: _open == _Section.appearance,
                onTap: () => _toggle(_Section.appearance),
              ),
              Collapse(
                open: _open == _Section.appearance,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: Column(children: [
                    for (final (mode, icon, label) in themes)
                      _Option(icon: icon, label: label, active: settings.themeMode == mode, onTap: () => ctrl.setThemeMode(mode)),
                  ]),
                ),
              ),
              const Divider(),
              _Row(
                icon: LucideIcons.languages,
                label: t.settingsSectionLanguage,
                value: currentLang,
                open: _open == _Section.language,
                onTap: () => _toggle(_Section.language),
              ),
              Collapse(
                open: _open == _Section.language,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: Column(children: [
                    for (final (code, label) in languages)
                      _Option(label: label, active: settings.locale.languageCode == code, onTap: () => ctrl.setLocale(code)),
                  ]),
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label, required this.value, required this.open, required this.onTap});
  final IconData icon;
  final String label;
  final String value;
  final bool open;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(children: [
            Icon(icon, size: 16, color: context.tw(Tw.zinc600, Tw.zinc400)),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500))),
            ConstrainedBox(
              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.4),
              child: Text(value, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc500, Tw.zinc400))),
            ),
            const SizedBox(width: 8),
            AnimatedRotation(
              turns: open ? 0.5 : 0,
              duration: const Duration(milliseconds: 200),
              child: Icon(LucideIcons.chevronDown, size: 16, color: context.tw(Tw.zinc400, Tw.zinc500)),
            ),
          ]),
        ),
      );
}

/// Lựa chọn full chiều ngang, cao vừa phải (~42px)
class _Option extends StatelessWidget {
  const _Option({this.icon, required this.label, required this.active, required this.onTap});
  final IconData? icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 6),
        child: Material(
          color: active ? context.tw(Tw.zinc100, Tw.alpha(Tw.zinc800, 0.6)) : Colors.transparent,
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(TwSize.radiusLg),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(TwSize.radiusLg),
                border: Border.all(color: active ? context.tw(Tw.zinc900, Tw.zinc50) : context.tw(Tw.zinc200, Tw.zinc800)),
              ),
              child: Row(children: [
                if (icon != null) ...[Icon(icon, size: 16), const SizedBox(width: 10)],
                Expanded(
                  child: Text(label, style: TextStyle(fontSize: TwSize.textSm, fontWeight: active ? FontWeight.w500 : FontWeight.w400)),
                ),
                if (active) const Icon(LucideIcons.check, size: 16),
              ]),
            ),
          ),
        ),
      );
}
