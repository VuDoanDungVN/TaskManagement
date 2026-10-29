import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'app_colors.dart';

/// Màu pill/marker cho trạng thái & độ ưu tiên — khớp STATUS_CONFIG / PRIORITY_CONFIG
/// của web (lib/tasks/utils.ts): pill = `bg-x-100 text-x-600 dark:bg-x-900/30 dark:text-x-400`.
class PillStyle {
  const PillStyle({required this.bg, required this.fg, this.dot, this.icon});
  final Color bg;
  final Color fg;
  final Color? dot; // dot-x-500 (vạch màu trạng thái ở danh sách mobile)
  final IconData? icon;
}

enum TaskStatus { pending, inProgress, completed }

enum TaskPriority { low, medium, high }

extension TaskStatusApi on TaskStatus {
  /// Giá trị API (worker): "pending" | "in-progress" | "completed"
  String get api => switch (this) {
        TaskStatus.pending => 'pending',
        TaskStatus.inProgress => 'in-progress',
        TaskStatus.completed => 'completed',
      };

  static TaskStatus parse(String v) => switch (v) {
        'in-progress' => TaskStatus.inProgress,
        'completed' => TaskStatus.completed,
        _ => TaskStatus.pending,
      };
}

extension TaskPriorityApi on TaskPriority {
  String get api => name; // "low" | "medium" | "high"

  static TaskPriority parse(String v) => switch (v) {
        'low' => TaskPriority.low,
        'high' => TaskPriority.high,
        _ => TaskPriority.medium,
      };
}

PillStyle statusStyle(BuildContext context, TaskStatus s) {
  final dark = context.isDark;
  return switch (s) {
    TaskStatus.pending => PillStyle(
        bg: dark ? Tw.alpha(Tw.amber900, 0.3) : Tw.amber100,
        fg: dark ? Tw.amber400 : Tw.amber600,
        dot: Tw.amber500,
        icon: LucideIcons.timer,
      ),
    TaskStatus.inProgress => PillStyle(
        bg: dark ? Tw.alpha(Tw.blue900, 0.3) : Tw.blue100,
        fg: dark ? Tw.blue400 : Tw.blue600,
        dot: Tw.blue500,
        icon: LucideIcons.circleAlert,
      ),
    TaskStatus.completed => PillStyle(
        bg: dark ? Tw.alpha(Tw.emerald900, 0.3) : Tw.emerald100,
        fg: dark ? Tw.emerald400 : Tw.emerald600,
        dot: Tw.emerald500,
        icon: LucideIcons.circleCheck,
      ),
  };
}

PillStyle priorityStyle(BuildContext context, TaskPriority p) {
  final dark = context.isDark;
  return switch (p) {
    TaskPriority.low => PillStyle(bg: dark ? Tw.zinc800 : Tw.zinc100, fg: dark ? Tw.zinc300 : Tw.zinc600),
    TaskPriority.medium => PillStyle(
        bg: dark ? Tw.alpha(Tw.indigo900, 0.3) : Tw.indigo100,
        fg: dark ? Tw.indigo400 : Tw.indigo600,
      ),
    TaskPriority.high => PillStyle(
        bg: dark ? Tw.alpha(Tw.red900, 0.3) : Tw.red100,
        fg: dark ? Tw.red400 : Tw.red600,
      ),
  };
}
