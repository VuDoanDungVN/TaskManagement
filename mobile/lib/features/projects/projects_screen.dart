import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/router.dart';
import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/task_styles.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_bar.dart';
import '../../widgets/common.dart';
import '../../widgets/task_widgets.dart';
import '../shell/app_shell.dart';

/// Danh sách dự án — port components/kokonutui/project-list.tsx.
/// Khách hàng chỉ thấy dự án được gán; chỉ admin thấy nút tạo dự án.
class ProjectsScreen extends ConsumerWidget {
  const ProjectsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(projectsProvider);
    final isAdmin = ref.watch(isAdminProvider);
    final projects = q.value ?? const <Project>[];

    Future<void> refresh() async {
      ref.invalidate(projectsProvider);
      await ref.read(projectsProvider.future);
    }

    return Scaffold(
      appBar: TabAppBar(title: t.projectsTitle),
      body: RefreshIndicator(
        onRefresh: refresh,
        child: ListView(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + navBarClearance(context)),
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Icon(
                        LucideIcons.folderKanban,
                        size: 14,
                        color: context.tw(Tw.zinc900, Tw.zinc50),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        t.projectsTitle,
                        style: const TextStyle(
                          fontSize: TwSize.textLg,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        t.projectsCountLabel(projects.length),
                        style: TextStyle(
                          fontSize: TwSize.textXs,
                          color: context.tw(Tw.zinc600, Tw.zinc400),
                        ),
                      ),
                    ],
                  ),
                  if (isAdmin) ...[
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: () => showCreateProjectSheet(context),
                      icon: const Icon(LucideIcons.plus, size: 14),
                      label: Text(
                        t.projectsCreateNew,
                        style: const TextStyle(fontSize: TwSize.textXs),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  if (q.isLoading)
                    LoadingView(label: t.projectsLoading)
                  else if (q.hasError)
                    ErrorView(error: q.error!, onRetry: refresh)
                  else if (projects.isEmpty)
                    EmptyView(
                      title: t.projectsEmptyTitle,
                      help: isAdmin
                          ? t.projectsEmptyHelp
                          : t.accessContactAdmin,
                    )
                  else
                    for (final p in projects) ...[
                      ProjectCard(project: p),
                      const SizedBox(height: 12),
                    ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProjectCard extends StatelessWidget {
  const ProjectCard({super.key, required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final s = project.stats;
    final progress = s.total == 0 ? 0 : (s.completed / s.total * 100).round();
    Widget statChip(TaskStatus st, String label) {
      final style = statusStyle(context, st);
      return Pill(label: label, bg: style.bg, fg: style.fg, rounded: false);
    }

    return Material(
      color: context.tw(Tw.white, Tw.alpha(Tw.zinc900, 0.7)),
      borderRadius: BorderRadius.circular(TwSize.radiusXl),
      child: InkWell(
        onTap: () => GoRouter.of(context).go(projectPath(project.id)),
        borderRadius: BorderRadius.circular(TwSize.radiusXl),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(TwSize.radiusXl),
            border: Border.all(color: context.tw(Tw.zinc100, Tw.zinc800)),
          ),
          clipBehavior: Clip.antiAlias,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(TwSize.radiusMd),
                      child: SizedBox.square(
                        dimension: 36,
                        child: NetImage(
                          url: project.thumbnailUrl,
                          iconSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        project.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: TwSize.textSm,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                if (project.description?.isNotEmpty ?? false) ...[
                  const SizedBox(height: 4),
                  Text(
                    project.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: TwSize.text11,
                      color: context.tw(Tw.zinc600, Tw.zinc400),
                    ),
                  ),
                ],
                if (project.teamName != null) ...[
                  const SizedBox(height: 6),
                  neutralPill(
                    context,
                    project.teamName!,
                    icon: LucideIcons.usersRound,
                  ),
                ],
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    neutralPill(
                      context,
                      t.projectsCardTasksTotal(s.total),
                      icon: LucideIcons.listChecks,
                    ),
                    if (s.pending > 0)
                      statChip(
                        TaskStatus.pending,
                        t.projectsCardPendingShort(s.pending),
                      ),
                    if (s.inProgress > 0)
                      statChip(
                        TaskStatus.inProgress,
                        t.projectsCardInProgressShort(s.inProgress),
                      ),
                    if (s.completed > 0)
                      statChip(
                        TaskStatus.completed,
                        t.projectsCardDoneShort(s.completed),
                      ),
                  ],
                ),
                if (s.total > 0) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        t.projectsCardProgress,
                        style: TextStyle(
                          fontSize: TwSize.text11,
                          color: context.tw(Tw.zinc600, Tw.zinc400),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '$progress%',
                        style: const TextStyle(fontSize: TwSize.text11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  // Ngưỡng màu của project-list web: ≤30 đỏ, <60 vàng, còn lại xanh
                  ProgressBar(
                    percent: progress,
                    height: 6,
                    thresholds: (31, 60),
                  ),
                ],
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        t.projectsCardViewDetail,
                        style: TextStyle(
                          fontSize: TwSize.text11,
                          color: context.tw(Tw.zinc500, Tw.zinc400),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        LucideIcons.arrowRight,
                        size: 14,
                        color: context.tw(Tw.zinc500, Tw.zinc400),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Tạo dự án (admin) — ProjectDialog của web: tên, mô tả, thumbnail.
Future<void> showCreateProjectSheet(BuildContext context) =>
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => const _CreateProjectSheet(),
    );

class _CreateProjectSheet extends ConsumerStatefulWidget {
  const _CreateProjectSheet();

  @override
  ConsumerState<_CreateProjectSheet> createState() =>
      _CreateProjectSheetState();
}

class _CreateProjectSheetState extends ConsumerState<_CreateProjectSheet> {
  final _name = TextEditingController();
  final _desc = TextEditingController();
  XFile? _image;
  bool _saving = false;
  bool _touched = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _touched = true);
    if (_name.text.trim().isEmpty) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final p = await ref
          .read(projectsRepoProvider)
          .create(
            name: _name.text.trim(),
            description: _desc.text.trim().isEmpty ? null : _desc.text.trim(),
          );
      if (_image != null) {
        try {
          await ref
              .read(uploadsRepoProvider)
              .projectThumbnail(
                p.id,
                LocalFile(
                  path: _image!.path,
                  name: _image!.name,
                  size: await _image!.length(),
                ),
              );
        } catch (_) {
          // Ảnh lỗi không chặn việc tạo dự án (giống web)
        }
      }
      ref.invalidate(projectsProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final label = TextStyle(
      fontSize: TwSize.textXs,
      fontWeight: FontWeight.w500,
      color: context.tw(Tw.zinc700, Tw.zinc300),
    );
    final nameError = _touched && _name.text.trim().isEmpty;
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                t.projectDialogCreateTitle,
                style: const TextStyle(
                  fontSize: TwSize.textLg,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                t.projectDialogCreateDesc,
                style: TextStyle(
                  fontSize: TwSize.textSm,
                  color: context.tw(Tw.zinc600, Tw.zinc400),
                ),
              ),
              const SizedBox(height: 16),
              Text('${t.projectDialogNameLabel} *', style: label),
              const SizedBox(height: 4),
              TextField(
                controller: _name,
                autofocus: true,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: t.projectDialogNamePlaceholder,
                  errorText: nameError ? t.projectDialogNameRequired : null,
                ),
              ),
              const SizedBox(height: 12),
              Text(t.projectDialogDescriptionLabel, style: label),
              const SizedBox(height: 4),
              TextField(
                controller: _desc,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: t.projectDialogDescriptionPlaceholder,
                ),
              ),
              const SizedBox(height: 12),
              Text(t.projectDialogThumbnailLabel, style: label),
              const SizedBox(height: 6),
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(TwSize.radiusLg),
                    child: SizedBox.square(
                      dimension: 80,
                      child: _image == null
                          ? const NetImage(url: null)
                          : Image.file(File(_image!.path), fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SoftButton(
                    label: t.mobilePickFromGallery,
                    icon: LucideIcons.imagePlus,
                    onPressed: () async {
                      final x = await ImagePicker().pickImage(
                        source: ImageSource.gallery,
                        imageQuality: 90,
                        maxWidth: 2048,
                      );
                      if (x != null) setState(() => _image = x);
                    },
                  ),
                ],
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: TextStyle(
                    fontSize: TwSize.text11,
                    color: context.tw(Tw.red600, Tw.red400),
                  ),
                ),
              ],
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _saving ? null : () => Navigator.pop(context),
                      child: Text(t.commonCancel),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      onPressed: _saving ? null : _submit,
                      child: Text(
                        _saving ? t.commonSaving : t.projectDialogSubmit,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
