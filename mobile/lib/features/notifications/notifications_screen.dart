import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/task_styles.dart';
import '../../core/utils/dates.dart';
import '../../data/models.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_bar.dart';
import '../../widgets/common.dart';
import '../../widgets/task_widgets.dart';

/// Thông báo (tab của khách hàng). Backend chưa có hệ thống thông báo → tổng hợp từ
/// dữ liệu sẵn có: task giao cho bạn, quá hạn, sắp đến hạn, cập nhật gần đây (7 ngày).
/// Thông báo đẩy (FCM) là giai đoạn sau.
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final tasksQ = ref.watch(allTasksProvider);
    final projects = ref.watch(projectsProvider).value ?? const <Project>[];
    final me = ref.watch(myNameProvider).trim().toLowerCase();
    final byId = {for (final p in projects) p.id: p.name};

    Future<void> refresh() async {
      ref.invalidate(allTasksProvider);
      ref.invalidate(projectsProvider);
      await ref.read(allTasksProvider.future);
    }

    Widget content;
    if (tasksQ.isLoading) {
      content = AppCard(child: LoadingView(label: t.dashboardLoading));
    } else if (tasksQ.hasError) {
      content = AppCard(child: ErrorView(error: tasksQ.error!, onRetry: refresh));
    } else {
      final tasks = tasksQ.value!;
      final today = todayYmd();
      final upper = ymd(DateTime.now().add(const Duration(days: 7)));
      final weekAgo = DateTime.now().subtract(const Duration(days: 7)).millisecondsSinceEpoch;
      bool open(Task x) => x.status != TaskStatus.completed;
      int byDue(Task a, Task b) => (a.dueDate ?? '9999').compareTo(b.dueDate ?? '9999');

      final assigned = tasks.where((x) => open(x) && me.isNotEmpty && x.assignee?.trim().toLowerCase() == me).toList()..sort(byDue);
      final overdue = tasks.where((x) => open(x) && x.dueDate != null && x.dueDate!.compareTo(today) < 0).toList()..sort(byDue);
      final upcoming = tasks
          .where((x) => open(x) && x.dueDate != null && x.dueDate!.compareTo(today) >= 0 && x.dueDate!.compareTo(upper) <= 0)
          .toList()
        ..sort(byDue);
      final recent = tasks.where((x) => x.updatedAt >= weekAgo).toList()..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

      final muted = TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400));
      Widget dueText(Task x) => x.dueDate == null
          ? const SizedBox.shrink()
          : Text(dueRelative(t, x.dueDate!, today),
              style: muted.copyWith(color: x.dueDate!.compareTo(today) < 0 ? context.tw(Tw.red600, Tw.red400) : null));

      final sections = <Widget>[
        if (assigned.isNotEmpty)
          SectionCard(
            icon: LucideIcons.userCheck,
            title: t.mobileNotificationsAssigned,
            subtitle: '${assigned.length}',
            child: Column(children: [for (final x in assigned.take(10)) TaskRow(task: x, projectName: byId[x.projectId], trailing: dueText(x))]),
          ),
        if (overdue.isNotEmpty)
          SectionCard(
            icon: LucideIcons.triangleAlert,
            title: t.dashboardSectionOverdue,
            subtitle: '${overdue.length}',
            danger: true,
            child: Column(children: [for (final x in overdue.take(10)) TaskRow(task: x, projectName: byId[x.projectId], trailing: dueText(x))]),
          ),
        if (upcoming.isNotEmpty)
          SectionCard(
            icon: LucideIcons.calendar,
            title: t.dashboardSectionUpcoming,
            subtitle: t.dashboardUpcomingWindow(7),
            child: Column(children: [for (final x in upcoming.take(10)) TaskRow(task: x, projectName: byId[x.projectId], trailing: dueText(x))]),
          ),
        if (recent.isNotEmpty)
          SectionCard(
            icon: LucideIcons.timer,
            title: t.dashboardSectionRecent,
            child: Column(children: [
              for (final x in recent.take(10))
                TaskRow(task: x, projectName: byId[x.projectId], trailing: Text(formatRelative(x.updatedAt, justNow: justNowLabel(context)), style: muted)),
            ]),
          ),
      ];
      content = sections.isEmpty
          ? AppCard(child: EmptyView(title: t.mobileNotificationsEmpty, italic: true))
          : Column(children: [for (final s in sections) ...[s, const SizedBox(height: 16)]]);
    }

    return Scaffold(
      appBar: TabAppBar(title: t.profileNotifications),
      body: RefreshIndicator(
        onRefresh: refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(t.mobileNotificationsSubtitle, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
            const SizedBox(height: 12),
            content,
          ],
        ),
      ),
    );
  }
}
