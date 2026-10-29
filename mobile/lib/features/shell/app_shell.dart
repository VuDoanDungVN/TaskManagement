import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api/api_client.dart';
import '../../core/router.dart';
import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';

class _Tab {
  const _Tab(this.branch, this.icon, this.label);
  final int branch;
  final IconData icon;
  final String Function(AppLocalizations) label;
}

// Bottom Navigation theo vai trò (đã chốt):
//   Khách hàng: Dashboard · Dự án · Thông báo · Cài đặt
//   Admin:      Dashboard · Dự án · Thành viên · Team · Cài đặt
final _customerTabs = [
  _Tab(Branch.dashboard, LucideIcons.layoutGrid, (t) => t.mobileNavOverviewTab),
  _Tab(Branch.projects, LucideIcons.folder, (t) => t.navProjects),
  _Tab(Branch.notifications, LucideIcons.bell, (t) => t.profileNotifications),
  _Tab(Branch.settings, LucideIcons.settings, (t) => t.navSettings),
];
final _adminTabs = [
  _Tab(Branch.dashboard, LucideIcons.layoutGrid, (t) => t.mobileNavOverviewTab),
  _Tab(Branch.projects, LucideIcons.folder, (t) => t.navProjects),
  _Tab(Branch.members, LucideIcons.users, (t) => t.navMembers),
  _Tab(Branch.teams, LucideIcons.usersRound, (t) => t.navTeamList),
  _Tab(Branch.settings, LucideIcons.settings, (t) => t.navSettings),
];

/// Khung app: nội dung tab + Bottom Navigation (thay cho sidebar web) + AccessGate.
class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // AccessGate (web): /users/me trả 403 (tài khoản chưa được admin tạo hoặc đã khoá)
    // → đăng xuất và về màn đăng nhập kèm thông báo.
    ref.listen(meProvider, (_, next) {
      final err = next.error;
      if (err is ApiError && err.status == 403) {
        ref.read(firebaseAuthProvider).signOut().whenComplete(() {
          if (context.mounted) GoRouter.of(context).go('/login?denied=1');
        });
      }
    });

    final tabs = ref.watch(isAdminProvider) ? _adminTabs : _customerTabs;
    var selected = tabs.indexWhere((tab) => tab.branch == shell.currentIndex);
    if (selected < 0) selected = 0;

    return Scaffold(
      extendBody: true,
      body: shell,
      bottomNavigationBar: _FloatingNavBar(
        tabs: tabs,
        selected: selected,
        onTap: (i) {
          final branch = tabs[i].branch;
          // Bấm lại tab đang mở → quay về màn gốc của tab
          shell.goBranch(branch, initialLocation: branch == shell.currentIndex);
        },
      ),
    );
  }
}

/// Khoảng trống cần chừa ở đáy nội dung cuộn của các màn hình tab (Scaffold dùng
/// [AppShell] với `extendBody: true`) để không bị [_FloatingNavBar] che khuất —
/// bằng chiều cao pill + khoảng cách đáy cố định của nó.
double navBarClearance(BuildContext context) => 64 + 20;

/// Thanh điều hướng dạng "pill" nổi, cách mép màn hình — không dùng [NavigationBar]
/// mặc định để tránh dải nền phẳng sát đáy. Nền xung quanh pill tự trùng màu
/// [Scaffold.scaffoldBackgroundColor] (đã bằng màu nền app) nên không bị lộ khoảng trống/lệch màu.
class _FloatingNavBar extends StatelessWidget {
  const _FloatingNavBar({
    required this.tabs,
    required this.selected,
    required this.onTap,
  });
  final List<_Tab> tabs;
  final int selected;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final pillBg = context.tw(Tw.white, Tw.zinc900);
    final border = context.tw(Tw.gray200, Tw.darkBorder);
    final onSurface = context.tw(Tw.zinc900, Tw.zinc100);
    final muted = context.tw(Tw.zinc500, Tw.zinc400);
    final activeChipBg = context.tw(Tw.zinc900, Tw.zinc50);
    final activeChipFg = context.tw(Tw.zinc50, Tw.zinc900);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: Container(
        height: 64,
        decoration: BoxDecoration(
          color: pillBg,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: border),
          boxShadow: [
            BoxShadow(
              color: Tw.alpha(Tw.black, context.isDark ? 0.4 : 0.08),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            for (var i = 0; i < tabs.length; i++)
              Expanded(
                child: _NavSlot(
                  icon: tabs[i].icon,
                  label: tabs[i].label(t),
                  active: i == selected,
                  onTap: () => onTap(i),
                  activeBg: activeChipBg,
                  activeFg: activeChipFg,
                  mutedFg: muted,
                  onSurface: onSurface,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _NavSlot extends StatelessWidget {
  const _NavSlot({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    required this.activeBg,
    required this.activeFg,
    required this.mutedFg,
    required this.onSurface,
  });
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  final Color activeBg;
  final Color activeFg;
  final Color mutedFg;
  final Color onSurface;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOut,
            width: 36,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: active ? activeBg : Colors.transparent,
              borderRadius: BorderRadius.circular(TwSize.radiusLg),
            ),
            child: Icon(icon, size: 18, color: active ? activeFg : mutedFg),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: TwSize.text10 - 1,
              fontWeight: active ? FontWeight.w600 : FontWeight.w500,
              color: active ? onSurface : mutedFg,
            ),
          ),
        ],
      ),
    );
  }
}
