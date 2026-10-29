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
import '../../widgets/common.dart';
import '../../widgets/task_widgets.dart';
import '../tasks/task_form_screen.dart';
import 'project_members.dart';

/// Chi tiết dự án — port app/dashboard/[projectId] (bản mobile): Thành viên dự án +
/// Quản lý Task (dropdown lọc, tìm kiếm, danh sách gọn) + nút "Tạo task" cố định dưới đáy.
class ProjectDetailScreen extends ConsumerStatefulWidget {
  const ProjectDetailScreen({super.key, required this.projectId});
  final String projectId;

  @override
  ConsumerState<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends ConsumerState<ProjectDetailScreen> {
  TaskStatus? _filter; // null = Tất cả
  String _search = '';

  Future<void> _refresh() async {
    ref.invalidate(projectTasksProvider(widget.projectId));
    ref.invalidate(projectMembersProvider(widget.projectId));
    await ref.read(projectTasksProvider(widget.projectId).future);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final project = ref.watch(projectProvider(widget.projectId));
    final tasksQ = ref.watch(projectTasksProvider(widget.projectId));
    final tasks = tasksQ.value ?? const <Task>[];

    final counts = {for (final s in TaskStatus.values) s: tasks.where((x) => x.status == s).length};
    final q = _search.trim().toLowerCase();
    final filtered = tasks.where((x) {
      if (_filter != null && x.status != _filter) return false;
      if (q.isEmpty) return true;
      return x.title.toLowerCase().contains(q) ||
          (x.description?.toLowerCase().contains(q) ?? false) ||
          (x.assignee?.toLowerCase().contains(q) ?? false) ||
          x.tags.any((tag) => tag.toLowerCase().contains(q));
    }).toList()
      ..sort((a, b) => a.no.compareTo(b.no));

    // Dự án không truy cập được (403/404) → thông báo
    if (project.hasError && !project.hasValue) {
      return Scaffold(appBar: AppBar(), body: ErrorView(error: project.error!, onRetry: () => ref.invalidate(projectProvider(widget.projectId))));
    }

    return Scaffold(
      appBar: AppBar(title: Text(project.value?.name ?? '')),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              // Chừa chỗ cho nút "Tạo task" cố định
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              children: [
                ProjectMembersCard(projectId: widget.projectId),
                const SizedBox(height: 16),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(children: [
                        Icon(LucideIcons.listChecks, size: 14, color: context.tw(Tw.zinc900, Tw.zinc50)),
                        const SizedBox(width: 8),
                        Text(t.tasksTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w700)),
                      ]),
                      const SizedBox(height: 16),
                      _FilterDropdown(
                        value: _filter,
                        total: tasks.length,
                        counts: counts,
                        onChanged: (v) => setState(() => _filter = v),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        onChanged: (v) => setState(() => _search = v),
                        decoration: InputDecoration(
                          hintText: t.tasksSearchPlaceholder,
                          prefixIcon: const Icon(LucideIcons.search, size: 16),
                          prefixIconConstraints: const BoxConstraints(minWidth: 36),
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (tasksQ.isLoading)
                        LoadingView(label: t.tasksLoading)
                      else if (tasksQ.hasError)
                        ErrorView(error: tasksQ.error!, onRetry: _refresh)
                      else if (filtered.isEmpty)
                        EmptyView(title: t.tasksEmptyTitle, help: _search.isNotEmpty ? t.tasksEmptyHelpSearch : t.tasksEmptyHelp)
                      else
                        Container(
                          decoration: BoxDecoration(border: Border(top: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800)))),
                          child: Column(children: [
                            for (var i = 0; i < filtered.length; i++) ...[
                              if (i > 0) const Divider(),
                              MobileTaskItem(task: filtered[i]),
                            ],
                          ]),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Nút "Tạo task" cố định dưới đáy, full chiều ngang, cách đáy 10px
          Positioned(
            left: 16,
            right: 16,
            bottom: 10,
            child: SizedBox(
              height: 44,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  elevation: 6,
                  shadowColor: Colors.black38,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(TwSize.radiusXl)),
                  textStyle: const TextStyle(fontFamily: AppTheme.fontFamily, fontSize: TwSize.textSm, fontWeight: FontWeight.w600),
                ),
                onPressed: () => openTaskForm(context, projectId: widget.projectId),
                icon: const Icon(LucideIcons.plus, size: 16),
                label: Text(t.tasksCreateShort),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Dropdown lọc trạng thái kèm số lượng (Select mobile của web)
class _FilterDropdown extends StatelessWidget {
  const _FilterDropdown({required this.value, required this.total, required this.counts, required this.onChanged});
  final TaskStatus? value;
  final int total;
  final Map<TaskStatus, int> counts;
  final ValueChanged<TaskStatus?> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    Widget item(String label, int count) => Row(children: [
          Text(label, style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500)),
          const SizedBox(width: 6),
          Container(
            constraints: const BoxConstraints(minWidth: 18),
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(color: context.tw(Tw.zinc100, Tw.zinc800), borderRadius: BorderRadius.circular(999)),
            child: Text('$count', textAlign: TextAlign.center, style: TextStyle(fontSize: TwSize.text10, color: context.tw(Tw.zinc700, Tw.zinc300))),
          ),
        ]);
    return DropdownButtonFormField<TaskStatus?>(
      initialValue: value,
      isExpanded: true,
      icon: const Icon(LucideIcons.chevronDown, size: 16),
      decoration: const InputDecoration(),
      borderRadius: BorderRadius.circular(TwSize.radiusLg),
      items: [
        DropdownMenuItem(value: null, child: item(t.tasksFilterAll, total)),
        for (final s in TaskStatus.values) DropdownMenuItem(value: s, child: item(statusLabel(t, s), counts[s] ?? 0)),
      ],
      onChanged: onChanged,
    );
  }
}

/// Dòng task bản mobile (task-item.tsx, khối sm:hidden): vạch màu trạng thái, tiêu đề 2 dòng
/// kèm #No, marker trạng thái; hàng thông tin: ưu tiên Cao, người phụ trách, hạn (đỏ khi quá hạn),
/// số bình luận > 0, số ảnh > 0.
class MobileTaskItem extends StatelessWidget {
  const MobileTaskItem({super.key, required this.task});
  final Task task;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final st = statusStyle(context, task.status);
    final overdue = isOverdue(task);
    final dueShort = formatDateShort(task.dueDate);
    final meta = TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc600, Tw.zinc400));
    final red = context.tw(Tw.red600, Tw.red400);

    return InkWell(
      onTap: () => GoRouter.of(context).go(taskPath(task.projectId, task.id)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(width: 4, decoration: BoxDecoration(color: st.dot, borderRadius: BorderRadius.circular(999))),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text.rich(
                            TextSpan(children: [
                              WidgetSpan(alignment: PlaceholderAlignment.middle, child: NoBadge(no: task.no)),
                              const TextSpan(text: ' '),
                              TextSpan(text: task.title),
                            ]),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500, height: 1.35, color: context.tw(Tw.zinc900, Tw.zinc100)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Tooltip(
                          message: statusLabel(t, task.status),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(color: st.bg, shape: BoxShape.circle),
                            child: Icon(st.icon, size: 14, color: st.fg),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 12,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        if (task.priority == TaskPriority.high)
                          Pill(
                            label: t.tasksPriorityHigh,
                            icon: LucideIcons.flag,
                            bg: priorityStyle(context, TaskPriority.high).bg,
                            fg: priorityStyle(context, TaskPriority.high).fg,
                          ),
                        if (task.assignee?.isNotEmpty ?? false)
                          ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.4),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(LucideIcons.user, size: 12, color: meta.color),
                              const SizedBox(width: 4),
                              Flexible(child: Text(task.assignee!, maxLines: 1, overflow: TextOverflow.ellipsis, style: meta)),
                            ]),
                          ),
                        if (dueShort != null)
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            Icon(overdue ? LucideIcons.triangleAlert : LucideIcons.calendar, size: 12, color: overdue ? red : meta.color),
                            const SizedBox(width: 4),
                            Text(dueShort, style: overdue ? meta.copyWith(color: red, fontWeight: FontWeight.w500) : meta),
                          ]),
                        if (task.commentCount > 0)
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            Icon(LucideIcons.messageSquare, size: 12, color: meta.color),
                            const SizedBox(width: 4),
                            Text('${task.commentCount}', style: meta),
                          ]),
                        if (task.imageCount > 0)
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            Icon(LucideIcons.images, size: 12, color: meta.color),
                            const SizedBox(width: 4),
                            Text('${task.imageCount}', style: meta),
                          ]),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
