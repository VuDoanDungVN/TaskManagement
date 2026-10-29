import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/login_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/members/members_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/projects/project_detail_screen.dart';
import '../features/projects/projects_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/shell/app_shell.dart';
import '../features/tasks/task_detail_screen.dart';
import '../features/teams/team_detail_screen.dart';
import '../features/teams/teams_screen.dart';
import 'state/providers.dart';

/// Index các nhánh của StatefulShellRoute (thứ tự khai báo bên dưới).
abstract final class Branch {
  static const dashboard = 0;
  static const projects = 1;
  static const notifications = 2;
  static const members = 3;
  static const teams = 4;
  static const settings = 5;
}

final routerProvider = Provider<GoRouter>((ref) {
  // Báo router chạy lại redirect khi trạng thái đăng nhập đổi
  final refresh = ValueNotifier<int>(0);
  ref.listen(authUserProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/dashboard',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authUserProvider);
      if (auth.isLoading) return null;
      final loggedIn = auth.value != null;
      final atLogin = state.matchedLocation == '/login';
      if (!loggedIn) return atLogin ? null : '/login';
      if (atLogin) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, s) =>
            LoginScreen(denied: s.uri.queryParameters['denied'] == '1'),
      ),
      GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
      StatefulShellRoute.indexedStack(
        builder: (_, _, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (_, _) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/projects',
                builder: (_, _) => const ProjectsScreen(),
                routes: [
                  GoRoute(
                    path: ':projectId',
                    builder: (_, s) => ProjectDetailScreen(
                      projectId: s.pathParameters['projectId']!,
                    ),
                    routes: [
                      GoRoute(
                        path: 'tasks/:taskId',
                        builder: (_, s) => TaskDetailScreen(
                          projectId: s.pathParameters['projectId']!,
                          taskId: s.pathParameters['taskId']!,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notifications',
                builder: (_, _) => const NotificationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/members',
                builder: (_, _) => const MembersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/teams',
                builder: (_, _) => const TeamsScreen(),
                routes: [
                  GoRoute(
                    path: ':teamId',
                    builder: (_, s) =>
                        TeamDetailScreen(teamId: s.pathParameters['teamId']!),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                builder: (_, _) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

/// Đường dẫn tới dự án / task (dùng chung giữa các tab)
String projectPath(String projectId) => '/projects/$projectId';
String taskPath(String projectId, String taskId) =>
    '/projects/$projectId/tasks/$taskId';
