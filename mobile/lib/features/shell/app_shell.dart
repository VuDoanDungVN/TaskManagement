import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/api/api_client.dart';
import '../../core/router.dart';
import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
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
  _Tab(Branch.dashboard, LucideIcons.layoutGrid, (t) => t.navDashboard),
  _Tab(Branch.projects, LucideIcons.folder, (t) => t.navProjects),
  _Tab(Branch.notifications, LucideIcons.bell, (t) => t.profileNotifications),
  _Tab(Branch.settings, LucideIcons.settings, (t) => t.navSettings),
];
final _adminTabs = [
  _Tab(Branch.dashboard, LucideIcons.layoutGrid, (t) => t.navDashboard),
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
    final t = AppLocalizations.of(context);

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
      body: shell,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(border: Border(top: BorderSide(color: context.tw(Tw.gray200, Tw.darkBorder)))),
        child: NavigationBar(
          selectedIndex: selected,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (i) {
            final branch = tabs[i].branch;
            // Bấm lại tab đang mở → quay về màn gốc của tab
            shell.goBranch(branch, initialLocation: branch == shell.currentIndex);
          },
          destinations: [
            for (final tab in tabs) NavigationDestination(icon: Icon(tab.icon), label: tab.label(t)),
          ],
        ),
      ),
    );
  }
}
