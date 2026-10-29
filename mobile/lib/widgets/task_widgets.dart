import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/router.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/task_styles.dart';
import '../core/utils/dates.dart';
import '../data/models.dart';
import '../l10n/app_localizations.dart';
import 'common.dart';

String statusLabel(AppLocalizations t, TaskStatus s) => switch (s) {
      TaskStatus.pending => t.tasksStatusPending,
      TaskStatus.inProgress => t.tasksStatusInProgress,
      TaskStatus.completed => t.tasksStatusCompleted,
    };

String priorityLabel(AppLocalizations t, TaskPriority p) => switch (p) {
      TaskPriority.low => t.tasksPriorityLow,
      TaskPriority.medium => t.tasksPriorityMedium,
      TaskPriority.high => t.tasksPriorityHigh,
    };

/// Nhãn "vừa xong" của Hoạt động gần đây (web cũng tự xử lý theo ngôn ngữ).
String justNowLabel(BuildContext context) => switch (Localizations.localeOf(context).languageCode) {
      'vi' => 'vừa xong',
      'ja' => 'たった今',
      _ => 'now',
    };

/// Badge số No: "#01" (ring zinc-200)
class NoBadge extends StatelessWidget {
  const NoBadge({super.key, required this.no, this.fontSize = TwSize.text10});
  final int no;
  final double fontSize;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: context.tw(Tw.zinc100, Tw.zinc800),
          borderRadius: BorderRadius.circular(TwSize.radiusMd),
          border: Border.all(color: context.tw(Tw.zinc200, Tw.zinc700)),
        ),
        child: Text('#${no.toString().padLeft(2, '0')}',
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              fontFeatures: const [FontFeature.tabularFigures()],
              color: context.tw(Tw.zinc600, Tw.zinc300),
            )),
      );
}

Widget statusPill(BuildContext context, TaskStatus s, {bool withIcon = false}) {
  final st = statusStyle(context, s);
  return Pill(label: statusLabel(AppLocalizations.of(context), s), bg: st.bg, fg: st.fg, icon: withIcon ? st.icon : null);
}

Widget priorityPill(BuildContext context, TaskPriority p) {
  final st = priorityStyle(context, p);
  return Pill(label: priorityLabel(AppLocalizations.of(context), p), bg: st.bg, fg: st.fg);
}

/// "Quá hạn 3 ngày" / "Hôm nay tới hạn" / "Ngày mai tới hạn" / "Còn N ngày" (formatDueRelative của web)
String dueRelative(AppLocalizations t, String due, String today) {
  if (due.compareTo(today) < 0) return t.dashboardOverdueByDays(daysBetween(today, due));
  if (due == today) return t.dashboardDueToday;
  final diff = daysBetween(due, today);
  if (diff == 1) return t.dashboardDueTomorrow;
  return t.dashboardDueInDays(diff);
}

/// Dòng task gọn (TaskRow của Dashboard web): #No, tiêu đề, tên dự án, pill trạng thái, slot phải.
class TaskRow extends StatelessWidget {
  const TaskRow({super.key, required this.task, required this.projectName, this.trailing});
  final Task task;
  final String? projectName;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => GoRouter.of(context).go(taskPath(task.projectId, task.id)),
      borderRadius: BorderRadius.circular(TwSize.radiusLg),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            NoBadge(no: task.no),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(task.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc900, Tw.zinc100))),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Flexible(
                        child: Text(projectName ?? '—',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
                      ),
                      const SizedBox(width: 8),
                      statusPill(context, task.status),
                    ],
                  ),
                ],
              ),
            ),
            if (trailing != null) ...[const SizedBox(width: 8), trailing!],
          ],
        ),
      ),
    );
  }
}

/// Khối có tiêu đề + danh sách (SectionCard của Dashboard web)
class SectionCard extends StatelessWidget {
  const SectionCard({super.key, required this.icon, required this.title, required this.child, this.subtitle, this.action, this.danger = false});
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget child;
  final Widget? action;
  final bool danger;

  @override
  Widget build(BuildContext context) => AppCard(
        padding: EdgeInsets.zero,
        borderColor: danger ? context.tw(Tw.red200, Tw.alpha(Tw.red900, 0.4)) : null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SectionHeader(icon: icon, title: title, subtitle: subtitle, trailing: action, danger: danger),
            Padding(padding: const EdgeInsets.all(8), child: child),
          ],
        ),
      );
}

/// Nút "Xem tất cả →" ở góc khối
class ViewAllLink extends StatelessWidget {
  const ViewAllLink({super.key, required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label, style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc600, Tw.zinc400))),
            const SizedBox(width: 4),
            Icon(LucideIcons.arrowRight, size: 12, color: context.tw(Tw.zinc600, Tw.zinc400)),
          ],
        ),
      );
}

/// Thanh tiến độ màu theo % (đỏ <30, vàng <70, xanh ≥70 — như Dự án nổi bật)
class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key, required this.percent, this.height = 4, this.thresholds = const (30, 70)});
  final int percent;
  final double height;
  final (int, int) thresholds;

  @override
  Widget build(BuildContext context) {
    final color = percent >= thresholds.$2
        ? context.tw(Tw.emerald500, Tw.emerald400)
        : percent >= thresholds.$1
            ? context.tw(Tw.amber500, Tw.amber400)
            : context.tw(Tw.red500, Tw.red400);
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        height: height,
        child: Stack(
          children: [
            Container(color: context.tw(Tw.zinc100, Tw.zinc800)),
            FractionallySizedBox(widthFactor: (percent.clamp(0, 100)) / 100, child: Container(color: color)),
          ],
        ),
      ),
    );
  }
}
