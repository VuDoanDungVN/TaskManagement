import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/router.dart';
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

const _upcomingDays = 7;

/// Dashboard — port 1-1 app/dashboard/page.tsx (bản mobile): thẻ thống kê, Dự án nổi bật,
/// Quá hạn, Sắp đến hạn, Hoạt động gần đây.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final projectsQ = ref.watch(projectsProvider);
    final tasksQ = ref.watch(allTasksProvider);

    Future<void> refresh() async {
      ref.invalidate(projectsProvider);
      ref.invalidate(allTasksProvider);
      await Future.wait([ref.read(projectsProvider.future), ref.read(allTasksProvider.future)]);
    }

    final projects = projectsQ.value ?? const <Project>[];
    final tasks = tasksQ.value ?? const <Task>[];
    final total = tasks.length;
    final inProgress = tasks.where((x) => x.status == TaskStatus.inProgress).length;
    final completed = tasks.where((x) => x.status == TaskStatus.completed).length;
    final pct = total == 0 ? 0 : (completed / total * 100).round();

    final stats = GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.9,
      children: [
        _StatCard(icon: LucideIcons.folderKanban, label: t.dashboardStatTotalProjects, value: projects.length),
        _StatCard(icon: LucideIcons.listChecks, label: t.dashboardStatTotalTasks, value: total),
        _StatCard(icon: LucideIcons.clock, label: t.dashboardStatInProgress, value: inProgress, tone: _Tone.info),
        _StatCard(
          icon: LucideIcons.circleCheck,
          label: t.dashboardStatCompleted,
          value: completed,
          hint: t.dashboardStatCompletionPct(pct),
          tone: _Tone.success,
        ),
      ],
    );

    Widget body;
    if (projectsQ.isLoading || tasksQ.isLoading) {
      body = AppCard(child: LoadingView(label: t.dashboardLoading));
    } else if (projectsQ.hasError || tasksQ.hasError) {
      body = AppCard(
        borderColor: context.tw(Tw.red200, Tw.alpha(Tw.red900, 0.4)),
        child: ErrorView(error: (projectsQ.error ?? tasksQ.error)!, onRetry: refresh),
      );
    } else {
      body = _DashboardSections(projects: projects, tasks: tasks);
    }

    return Scaffold(
      appBar: TabAppBar(title: t.navDashboard),
      body: RefreshIndicator(
        onRefresh: refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [stats, const SizedBox(height: 16), body],
        ),
      ),
    );
  }
}

class _DashboardSections extends ConsumerWidget {
  const _DashboardSections({required this.projects, required this.tasks});
  final List<Project> projects;
  final List<Task> tasks;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final isAdmin = ref.watch(isAdminProvider);
    final byId = {for (final p in projects) p.id: p};
    final today = todayYmd();
    final upper = ymd(DateTime.now().add(const Duration(days: _upcomingDays)));

    final overdue = tasks.where((x) => x.status != TaskStatus.completed && x.dueDate != null && x.dueDate!.compareTo(today) < 0).toList()
      ..sort((a, b) => a.dueDate!.compareTo(b.dueDate!));
    final upcoming = tasks
        .where((x) =>
            x.status != TaskStatus.completed &&
            x.dueDate != null &&
            x.dueDate!.compareTo(today) >= 0 &&
            x.dueDate!.compareTo(upper) <= 0)
        .toList()
      ..sort((a, b) => a.dueDate!.compareTo(b.dueDate!));
    final recent = [...tasks]..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    final active = [...projects]..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

    final muted = TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Dự án nổi bật
        SectionCard(
          icon: LucideIcons.folderKanban,
          title: t.dashboardSectionActiveProjects,
          action: ViewAllLink(label: t.dashboardViewAll, onTap: () => GoRouter.of(context).go('/projects')),
          child: active.isEmpty
              ? Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Column(
                    children: [
                      Text(isAdmin ? t.dashboardEmptyProjects : t.accessContactAdmin, style: muted, textAlign: TextAlign.center),
                      if (isAdmin) ...[
                        const SizedBox(height: 8),
                        FilledButton.icon(
                          onPressed: () => GoRouter.of(context).go('/projects'),
                          icon: const Icon(LucideIcons.plus, size: 14),
                          label: Text(t.dashboardEmptyProjectsCta, style: const TextStyle(fontSize: TwSize.textXs)),
                        ),
                      ],
                    ],
                  ),
                )
              : LayoutBuilder(builder: (context, c) {
                  final cols = c.maxWidth >= 480 ? 2 : 1;
                  final w = (c.maxWidth - 8 * (cols - 1) - 8) / cols;
                  return Padding(
                    padding: const EdgeInsets.all(4),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [for (final p in active.take(10)) SizedBox(width: w, child: _FeaturedProject(project: p))],
                    ),
                  );
                }),
        ),
        const SizedBox(height: 16),
        if (overdue.isNotEmpty) ...[
          SectionCard(
            icon: LucideIcons.triangleAlert,
            title: t.dashboardSectionOverdue,
            subtitle: '${overdue.length}',
            danger: true,
            child: Column(children: [
              for (final task in overdue.take(5))
                TaskRow(
                  task: task,
                  projectName: byId[task.projectId]?.name,
                  trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(LucideIcons.triangleAlert, size: 12, color: context.tw(Tw.red600, Tw.red400)),
                    const SizedBox(width: 4),
                    Text(dueRelative(t, task.dueDate!, today),
                        style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.red600, Tw.red400))),
                  ]),
                ),
            ]),
          ),
          const SizedBox(height: 16),
        ],
        SectionCard(
          icon: LucideIcons.calendar,
          title: t.dashboardSectionUpcoming,
          subtitle: t.dashboardUpcomingWindow(_upcomingDays),
          child: upcoming.isEmpty
              ? EmptyView(title: t.dashboardEmptyUpcoming, italic: true)
              : Column(children: [
                  for (final task in upcoming.take(6))
                    TaskRow(
                      task: task,
                      projectName: byId[task.projectId]?.name,
                      trailing: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Text(formatDateShort(task.dueDate) ?? '',
                            style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300))),
                        Text(dueRelative(t, task.dueDate!, today), style: muted.copyWith(fontSize: TwSize.text10)),
                      ]),
                    ),
                ]),
        ),
        const SizedBox(height: 16),
        SectionCard(
          icon: LucideIcons.timer,
          title: t.dashboardSectionRecent,
          child: recent.isEmpty
              ? EmptyView(title: t.dashboardEmptyRecent, italic: true)
              : Column(children: [
                  for (final task in recent.take(8))
                    TaskRow(
                      task: task,
                      projectName: byId[task.projectId]?.name,
                      trailing: Text(formatRelative(task.updatedAt, justNow: justNowLabel(context)), style: muted),
                    ),
                ]),
        ),
      ],
    );
  }
}

enum _Tone { normal, info, success }

class _StatCard extends StatelessWidget {
  const _StatCard({required this.icon, required this.label, required this.value, this.hint, this.tone = _Tone.normal});
  final IconData icon;
  final String label;
  final int value;
  final String? hint;
  final _Tone tone;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (tone) {
      _Tone.normal => (context.tw(Tw.zinc100, Tw.zinc800), context.tw(Tw.zinc700, Tw.zinc300)),
      _Tone.info => (context.tw(Tw.blue100, Tw.alpha(Tw.blue900, 0.3)), context.tw(Tw.blue700, Tw.blue400)),
      _Tone.success => (context.tw(Tw.emerald100, Tw.alpha(Tw.emerald900, 0.3)), context.tw(Tw.emerald700, Tw.emerald400)),
    };
    return AppCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(TwSize.radiusLg)),
                child: Icon(icon, size: 18, color: fg),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
                    Text('$value', style: const TextStyle(fontSize: TwSize.textXl, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
          if (hint != null) ...[
            const SizedBox(height: 4),
            Text(hint!, maxLines: 1, overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
          ],
        ],
      ),
    );
  }
}

class _FeaturedProject extends StatelessWidget {
  const _FeaturedProject({required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final total = project.stats.total;
    final pct = total == 0 ? 0 : (project.stats.completed / total * 100).round();
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => GoRouter.of(context).go(projectPath(project.id)),
        borderRadius: BorderRadius.circular(TwSize.radiusLg),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(TwSize.radiusLg),
            border: Border.all(color: context.tw(Tw.zinc100, Tw.zinc800)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(TwSize.radiusLg),
                    child: SizedBox.square(dimension: 40, child: NetImage(url: project.thumbnailUrl, iconSize: 16)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(project.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500)),
                        Text(t.projectsCardTasksTotal(total),
                            style: TextStyle(fontSize: TwSize.text10, color: context.tw(Tw.zinc500, Tw.zinc400))),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(t.projectsCardProgress, style: TextStyle(fontSize: TwSize.text10, color: context.tw(Tw.zinc500, Tw.zinc400))),
                  const Spacer(),
                  Text('$pct%', style: TextStyle(fontSize: TwSize.text10, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300))),
                ],
              ),
              const SizedBox(height: 4),
              ProgressBar(percent: pct),
            ],
          ),
        ),
      ),
    );
  }
}
