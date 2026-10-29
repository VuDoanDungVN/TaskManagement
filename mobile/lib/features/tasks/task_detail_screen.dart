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
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/common.dart';
import '../../widgets/task_widgets.dart';
import 'comments_section.dart';
import 'task_form_screen.dart';

/// Chi tiết task — port app/dashboard/[projectId]/[taskId]: thư viện ảnh (phương án A),
/// thông tin, sửa/xoá, bình luận.
class TaskDetailScreen extends ConsumerWidget {
  const TaskDetailScreen({super.key, required this.projectId, required this.taskId});
  final String projectId;
  final String taskId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(taskProvider(taskId));
    final task = q.value;

    Future<void> delete() async {
      if (!await confirmDialog(context, t.taskDetailDeleteConfirm)) return;
      try {
        await ref.read(tasksRepoProvider).remove(taskId);
        invalidateTask(ref, projectId: projectId);
        if (context.mounted) GoRouter.of(context).go(projectPath(projectId));
      } catch (e) {
        if (context.mounted) showSnack(context, errorMessage(e), error: true);
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(task == null ? '' : '${task.noLabel} ${task.title}', overflow: TextOverflow.ellipsis),
        actions: [
          if (task != null) ...[
            IconButton(
              tooltip: t.taskDetailEdit,
              icon: const Icon(LucideIcons.pencil, size: 18),
              onPressed: () => openTaskForm(context, projectId: projectId, initial: task),
            ),
            IconButton(
              tooltip: t.taskDetailDelete,
              icon: Icon(LucideIcons.trash2, size: 18, color: context.tw(Tw.red600, Tw.red400)),
              onPressed: delete,
            ),
          ],
        ],
      ),
      body: q.isLoading && task == null
          ? LoadingView(label: t.pagesTaskLoading)
          : task == null
              ? ErrorView(error: q.error ?? t.pagesTaskErrorFallback, onRetry: () => ref.invalidate(taskProvider(taskId)))
              : RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(taskProvider(taskId));
                    ref.invalidate(taskImagesProvider(taskId));
                    ref.invalidate(commentsProvider(taskId));
                    await ref.read(taskProvider(taskId).future);
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      AppCard(padding: const EdgeInsets.all(16), child: _TaskInfo(task: task)),
                      const SizedBox(height: 16),
                      CommentsSection(taskId: taskId, projectId: projectId),
                    ],
                  ),
                ),
    );
  }
}

class _TaskInfo extends ConsumerWidget {
  const _TaskInfo({required this.task});
  final Task task;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final hasImages = task.imageCount > 0 || task.thumbnailUrl != null;
    final images = hasImages ? ref.watch(taskImagesProvider(task.id)).value : null;
    final overdue = isOverdue(task);
    final st = statusStyle(context, task.status);
    final pr = priorityStyle(context, task.priority);
    final muted = TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400));
    final strong = TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300));

    Widget infoRow(IconData icon, String label, Widget value) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Padding(padding: const EdgeInsets.only(top: 1), child: Icon(icon, size: 14, color: muted.color)),
            const SizedBox(width: 8),
            Text(label, style: strong),
            const SizedBox(width: 6),
            Expanded(child: value),
          ]),
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (hasImages) ...[
          images != null && images.isNotEmpty
              ? TaskImageGallery(images: images)
              : AspectRatio(
                  aspectRatio: 4 / 3,
                  child: ClipRRect(borderRadius: BorderRadius.circular(TwSize.radiusXl), child: NetImage(url: task.thumbnailUrl, fit: BoxFit.contain)),
                ),
          const SizedBox(height: 16),
        ],
        Wrap(spacing: 8, runSpacing: 6, crossAxisAlignment: WrapCrossAlignment.center, children: [
          NoBadge(no: task.no, fontSize: TwSize.text11),
          Pill(label: statusLabel(t, task.status), icon: st.icon, bg: st.bg, fg: st.fg, fontSize: TwSize.text11),
          Pill(label: t.taskDetailPriorityWithLabel(priorityLabel(t, task.priority)), bg: pr.bg, fg: pr.fg, fontSize: TwSize.text11),
          if (overdue)
            Pill(
              label: t.taskDetailOverdue,
              bg: context.tw(Tw.red100, Tw.alpha(Tw.red900, 0.3)),
              fg: context.tw(Tw.red600, Tw.red400),
              fontSize: TwSize.text11,
            ),
        ]),
        const SizedBox(height: 12),
        Text(task.title, style: const TextStyle(fontSize: TwSize.textXl, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        infoRow(LucideIcons.user, t.taskDetailAssignee, Text((task.assignee?.trim().isNotEmpty ?? false) ? task.assignee! : '—', style: muted)),
        infoRow(LucideIcons.calendar, t.taskDetailStartDate, Text(formatDate(task.startDate) ?? '—', style: muted)),
        infoRow(
          LucideIcons.calendar,
          t.taskDetailDueDate,
          Text(formatDate(task.dueDate) ?? '—', style: overdue ? muted.copyWith(color: context.tw(Tw.red600, Tw.red400)) : muted),
        ),
        infoRow(
          LucideIcons.tag,
          t.taskDetailTags,
          task.tags.isEmpty
              ? Text('—', style: muted)
              : Wrap(spacing: 4, runSpacing: 4, children: [for (final tag in task.tags) neutralPill(context, '#$tag')]),
        ),
        const SizedBox(height: 12),
        Text(t.taskDetailDescriptionHeading, style: strong),
        const SizedBox(height: 6),
        (task.description?.isNotEmpty ?? false)
            ? SelectableText(task.description!, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc700, Tw.zinc200)))
            : Text(t.taskDetailNoDescription, style: muted.copyWith(fontStyle: FontStyle.italic)),
      ],
    );
  }
}

/// Thư viện ảnh phương án A: ảnh lớn (vuốt trái/phải, ‹ ›, "2 / 5") + dải ảnh nhỏ;
/// bấm ảnh lớn → toàn màn hình.
class TaskImageGallery extends StatefulWidget {
  const TaskImageGallery({super.key, required this.images});
  final List<TaskImage> images;

  @override
  State<TaskImageGallery> createState() => _TaskImageGalleryState();
}

class _TaskImageGalleryState extends State<TaskImageGallery> {
  final _pc = PageController();
  int _index = 0;

  @override
  void dispose() {
    _pc.dispose();
    super.dispose();
  }

  void _go(int i) => _pc.animateToPage(i, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final imgs = widget.images;
    final total = imgs.length;
    final urls = imgs.map((i) => i.url).toList();

    Widget nav(IconData icon, VoidCallback onTap, String tip) => Material(
          color: Colors.black.withValues(alpha: 0.4),
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onTap,
            child: Tooltip(message: tip, child: Padding(padding: const EdgeInsets.all(6), child: Icon(icon, size: 18, color: Colors.white))),
          ),
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: 4 / 3,
          child: Container(
            decoration: BoxDecoration(
              color: context.tw(Tw.zinc100, Tw.zinc800),
              borderRadius: BorderRadius.circular(TwSize.radiusXl),
              border: Border.all(color: context.tw(Tw.zinc200, Tw.zinc700)),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(fit: StackFit.expand, children: [
              PageView.builder(
                controller: _pc,
                itemCount: total,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => GestureDetector(
                  onTap: () => openImageViewer(context, urls, initial: i),
                  child: NetImage(url: imgs[i].url, fit: BoxFit.contain),
                ),
              ),
              if (total > 1) ...[
                Positioned(left: 8, top: 0, bottom: 0, child: Center(child: nav(LucideIcons.chevronLeft, () => _go((_index - 1 + total) % total), t.taskImagesPrev))),
                Positioned(right: 8, top: 0, bottom: 0, child: Center(child: nav(LucideIcons.chevronRight, () => _go((_index + 1) % total), t.taskImagesNext))),
                Positioned(
                  right: 8,
                  bottom: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.5), borderRadius: BorderRadius.circular(999)),
                    child: Text('${_index + 1} / $total', style: const TextStyle(color: Colors.white, fontSize: TwSize.text11)),
                  ),
                ),
              ],
            ]),
          ),
        ),
        if (total > 1) ...[
          const SizedBox(height: 8),
          SizedBox(
            height: 56,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: total,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => _go(i),
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 150),
                  opacity: i == _index ? 1 : 0.7,
                  child: Container(
                    width: 56,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(TwSize.radiusLg),
                      border: Border.all(color: i == _index ? context.tw(Tw.zinc900, Tw.zinc100) : Colors.transparent, width: 2),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: NetImage(url: imgs[i].url),
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
