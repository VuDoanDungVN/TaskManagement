import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

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

/// Mở form tạo (initial == null) hoặc sửa task, toàn màn hình (TaskDialog của web).
Future<void> openTaskForm(BuildContext context, {required String projectId, Task? initial}) =>
    Navigator.of(context, rootNavigator: true).push(MaterialPageRoute(
      fullscreenDialog: true,
      builder: (_) => TaskFormScreen(projectId: projectId, initial: initial),
    ));

/// Ảnh trong form: ảnh đã lưu (id server) hoặc ảnh mới chọn (file cục bộ).
class _Img {
  _Img.existing(TaskImage img)
      : key = img.id,
        id = img.id,
        url = img.url,
        file = null;
  _Img.local(this.file)
      : key = 'new-${DateTime.now().microsecondsSinceEpoch}-${file!.name}',
        id = null,
        url = null;

  final String key;
  final String? id; // ảnh đã lưu
  final String? url;
  final LocalFile? file; // ảnh mới
  bool get isNew => file != null;
}

class TaskFormScreen extends ConsumerStatefulWidget {
  const TaskFormScreen({super.key, required this.projectId, this.initial});
  final String projectId;
  final Task? initial;

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  late final _title = TextEditingController(text: widget.initial?.title ?? '');
  late final _desc = TextEditingController(text: widget.initial?.description ?? '');
  late final _tags = TextEditingController(text: widget.initial?.tags.join(', ') ?? '');
  late TaskStatus _status = widget.initial?.status ?? TaskStatus.pending;
  late TaskPriority _priority = widget.initial?.priority ?? TaskPriority.medium;
  // Task mới: bắt đầu hôm nay + người phụ trách là người đang đăng nhập (đều đổi được)
  late String? _start = widget.initial != null ? widget.initial!.startDate : todayYmd();
  late String? _due = widget.initial?.dueDate;
  late String _assignee = widget.initial?.assignee ?? ref.read(myNameProvider);

  final List<_Img> _images = [];
  final List<String> _removedIds = [];
  bool _imagesLoaded = false;
  final Map<String, double> _progress = {};
  final Set<String> _failed = {};
  final List<String> _imageErrors = [];

  bool _touched = false;
  bool _saving = false;
  bool _doneWithErrors = false;
  String? _submitError;

  bool get _isEdit => widget.initial != null;

  @override
  void initState() {
    super.initState();
    if (_isEdit && widget.initial!.imageCount > 0) {
      ref.read(tasksRepoProvider).images(widget.initial!.id).then((list) {
        if (mounted) {
          setState(() {
            _images.addAll(list.map(_Img.existing));
            _imagesLoaded = true;
          });
        }
      }).catchError((_) {
        if (mounted) setState(() => _imagesLoaded = true);
      });
    } else {
      _imagesLoaded = true;
    }
    // /users/me về muộn → điền người phụ trách mặc định nếu còn trống
    if (!_isEdit && _assignee.isEmpty) {
      ref.read(meProvider.future).then((me) {
        if (mounted && _assignee.isEmpty && me != null) setState(() => _assignee = me.name);
      });
    }
  }

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _tags.dispose();
    super.dispose();
  }

  // ------------------------------------------------------------ ảnh

  Future<void> _addImages(ImageSource source) async {
    final t = AppLocalizations.of(context);
    final remaining = taskImageLimit - _images.length;
    if (remaining <= 0) return;
    final picker = ImagePicker();
    // imageQuality/maxWidth → iOS đổi HEIC sang JPEG + giảm dung lượng (server chỉ nhận JPG/PNG/WEBP/GIF, ≤5MB)
    final picked = source == ImageSource.camera
        ? [?await picker.pickImage(source: source, imageQuality: 85, maxWidth: 2560)]
        : await picker.pickMultiImage(imageQuality: 85, maxWidth: 2560, limit: remaining > 1 ? remaining : null);
    if (picked.isEmpty) return;

    final errs = <String>[];
    final accepted = <_Img>[];
    for (final x in picked) {
      final ext = x.name.split('.').last.toLowerCase();
      final size = await x.length();
      if (!const ['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext)) {
        errs.add(t.taskImagesBadType(x.name));
      } else if (size > taskImageMaxBytes) {
        errs.add(t.taskImagesTooLarge(x.name));
      } else {
        accepted.add(_Img.local(LocalFile(path: x.path, name: x.name, size: size)));
      }
    }
    if (accepted.length > remaining) {
      errs.add(t.taskImagesTooMany(remaining));
      accepted.removeRange(remaining, accepted.length);
    }
    setState(() {
      _imageErrors
        ..clear()
        ..addAll(errs);
      _images.addAll(accepted);
    });
  }

  void _pickSource() {
    final t = AppLocalizations.of(context);
    showModalBottomSheet(
      context: context,
      builder: (c) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(
            leading: const Icon(LucideIcons.images, size: 18),
            title: Text(t.mobilePickFromGallery, style: const TextStyle(fontSize: TwSize.textSm)),
            onTap: () {
              Navigator.pop(c);
              _addImages(ImageSource.gallery);
            },
          ),
          ListTile(
            leading: const Icon(LucideIcons.camera, size: 18),
            title: Text(t.mobileTakePhoto, style: const TextStyle(fontSize: TwSize.textSm)),
            onTap: () {
              Navigator.pop(c);
              _addImages(ImageSource.camera);
            },
          ),
        ]),
      ),
    );
  }

  void _removeImage(_Img img) => setState(() {
        if (!img.isNew) _removedIds.add(img.id!);
        _images.remove(img);
      });

  void _moveImage(String fromKey, int to) => setState(() {
        final from = _images.indexWhere((i) => i.key == fromKey);
        if (from < 0 || from == to) return;
        final item = _images.removeAt(from);
        _images.insert(to.clamp(0, _images.length), item);
      });

  // ------------------------------------------------------------ lưu

  Future<void> _submit() async {
    setState(() => _touched = true);
    if (_title.text.trim().isEmpty || _saving) return;
    setState(() {
      _saving = true;
      _submitError = null;
    });
    final repo = ref.read(tasksRepoProvider);
    final draft = TaskDraft(
      title: _title.text,
      description: _desc.text,
      status: _status,
      priority: _priority,
      assignee: _assignee,
      tags: _tags.text.split(',').map((s) => s.trim().replaceFirst(RegExp('^#'), '')).where((s) => s.isNotEmpty).toList(),
      startDate: _start,
      dueDate: _due,
    );

    String taskId;
    try {
      taskId = _isEdit ? (await repo.update(widget.initial!.id, draft)).id : (await repo.create(widget.projectId, draft)).id;
    } catch (e) {
      setState(() {
        _submitError = errorMessage(e);
        _saving = false;
      });
      return;
    }

    // Task đã lưu → đồng bộ ảnh (xoá ảnh bị bỏ → upload ảnh mới tuần tự có tiến trình → lưu thứ tự).
    // Lỗi ảnh không throw để tránh bấm Lưu lại sinh task trùng (giống saveTaskImages của web).
    final failed = <String>{};
    try {
      for (final id in _removedIds) {
        await repo.deleteImage(taskId, id).catchError((_) {});
      }
      final finalIds = <String>[];
      for (final img in _images) {
        if (!img.isNew) {
          finalIds.add(img.id!);
          continue;
        }
        try {
          final created = await repo.uploadImage(taskId, img.file!, onProgress: (f) {
            if (mounted) setState(() => _progress[img.key] = f);
          });
          if (created.isNotEmpty) finalIds.add(created.first.id);
        } catch (_) {
          failed.add(img.key);
        }
      }
      if (finalIds.isNotEmpty) {
        final current = (await repo.images(taskId)).map((i) => i.id).toList();
        final ordered = [...finalIds.where(current.contains), ...current.where((id) => !finalIds.contains(id))];
        var changed = false;
        for (var i = 0; i < ordered.length; i++) {
          if (ordered[i] != current[i]) changed = true;
        }
        if (changed) await repo.reorderImages(taskId, ordered);
      }
    } catch (_) {
      failed.addAll(_images.where((i) => i.isNew).map((i) => i.key));
    }

    invalidateTask(ref, projectId: widget.projectId, taskId: taskId);
    if (!mounted) return;
    if (failed.isEmpty) {
      Navigator.pop(context);
    } else {
      setState(() {
        _failed.addAll(failed);
        _doneWithErrors = true;
        _saving = false;
      });
    }
  }

  // ------------------------------------------------------------ UI

  Future<void> _pickDate(bool isStart) async {
    final current = parseYmd(isStart ? _start : _due) ?? DateTime.now();
    final d = await showDatePicker(context: context, initialDate: current, firstDate: DateTime(2000), lastDate: DateTime(2100));
    if (d != null) setState(() => isStart ? _start = ymd(d) : _due = ymd(d));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final members = ref.watch(projectMembersProvider(widget.projectId)).value ?? const <ProjectMember>[];
    final options = {for (final m in members) m.name}.toList();
    final label = TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300));
    final titleError = _touched && _title.text.trim().isEmpty;
    final newCount = _images.where((i) => i.isNew).length;
    final uploaded = _images.where((i) => i.isNew && _progress[i.key] == 1).length;
    final locked = _saving || _doneWithErrors;

    Widget field(String text, Widget child, {bool required = false}) => Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text.rich(TextSpan(text: text, children: [
              if (required) const TextSpan(text: ' *', style: TextStyle(color: Tw.red500)),
            ]), style: label),
            const SizedBox(height: 4),
            child,
          ],
        );

    Widget dateField(bool isStart) {
      final v = isStart ? _start : _due;
      return InkWell(
        onTap: locked ? null : () => _pickDate(isStart),
        child: InputDecorator(
          decoration: InputDecoration(
            suffixIcon: v == null
                ? const Icon(LucideIcons.calendar, size: 16)
                : IconButton(
                    icon: const Icon(LucideIcons.x, size: 14),
                    onPressed: locked ? null : () => setState(() => isStart ? _start = null : _due = null),
                  ),
          ),
          child: Text(formatDate(v) ?? 'dd/mm/yyyy',
              style: TextStyle(fontSize: TwSize.textBase, color: v == null ? context.tw(Tw.zinc400, Tw.zinc500) : null)),
        ),
      );
    }

    return PopScope(
      canPop: !_saving,
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(icon: const Icon(LucideIcons.x), onPressed: _saving ? null : () => Navigator.pop(context)),
          title: Row(children: [
            Flexible(child: Text(_isEdit ? t.taskDialogEditTitle : t.taskDialogCreateTitle, overflow: TextOverflow.ellipsis)),
            // Số No cố định → chỉ hiển thị khi sửa, không cho nhập
            if (_isEdit) ...[const SizedBox(width: 8), NoBadge(no: widget.initial!.no, fontSize: TwSize.textXs)],
          ]),
        ),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(t.taskDialogDescription, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc600, Tw.zinc400))),
            const SizedBox(height: 16),
            field(
              t.taskDialogTitleLabel,
              TextField(
                controller: _title,
                enabled: !locked,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(hintText: t.taskDialogTitlePlaceholder, errorText: titleError ? t.taskDialogTitleRequired : null),
              ),
              required: true,
            ),
            const SizedBox(height: 12),
            field(
              t.taskDialogDescriptionLabel,
              TextField(controller: _desc, enabled: !locked, minLines: 3, maxLines: 6, decoration: InputDecoration(hintText: t.taskDialogDescriptionPlaceholder)),
            ),
            const SizedBox(height: 12),
            field(
              t.taskDialogStatusLabel,
              DropdownButtonFormField<TaskStatus>(
                initialValue: _status,
                isExpanded: true,
                items: [for (final s in TaskStatus.values) DropdownMenuItem(value: s, child: Text(statusLabel(t, s)))],
                onChanged: locked ? null : (v) => setState(() => _status = v!),
              ),
            ),
            const SizedBox(height: 12),
            field(
              t.taskDialogPriorityLabel,
              DropdownButtonFormField<TaskPriority>(
                initialValue: _priority,
                isExpanded: true,
                items: [for (final p in TaskPriority.values) DropdownMenuItem(value: p, child: Text(priorityLabel(t, p)))],
                onChanged: locked ? null : (v) => setState(() => _priority = v!),
              ),
            ),
            const SizedBox(height: 12),
            field(t.taskDialogStartDateLabel, dateField(true)),
            const SizedBox(height: 12),
            field(t.taskDialogDueDateLabel, dateField(false)),
            const SizedBox(height: 12),
            field(
              t.taskDialogAssigneeLabel,
              DropdownButtonFormField<String>(
                initialValue: _assignee,
                isExpanded: true,
                items: [
                  DropdownMenuItem(value: '', child: Text(t.accessAssigneeNone)),
                  // Giữ giá trị cũ (nhập tự do trước đây) nếu không còn trong danh sách
                  if (_assignee.isNotEmpty && !options.contains(_assignee)) DropdownMenuItem(value: _assignee, child: Text(_assignee)),
                  for (final name in options) DropdownMenuItem(value: name, child: Text(name, overflow: TextOverflow.ellipsis)),
                ],
                onChanged: locked ? null : (v) => setState(() => _assignee = v ?? ''),
              ),
            ),
            const SizedBox(height: 12),
            field(t.taskDialogTagsLabel, TextField(controller: _tags, enabled: !locked, decoration: InputDecoration(hintText: t.taskDialogTagsPlaceholder))),
            const SizedBox(height: 16),
            _imagesField(t, locked),
            if (_submitError != null) ...[
              const SizedBox(height: 12),
              Text(_submitError!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
            ],
            if (_doneWithErrors) ...[
              const SizedBox(height: 12),
              Text(t.taskImagesUploadFailed(_failed.length), style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
            ],
          ],
        ),
        // Footer dính đáy: Huỷ / Lưu (hoặc Đóng khi có ảnh lỗi)
        bottomNavigationBar: SafeArea(
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            decoration: BoxDecoration(
              color: context.tw(Tw.white, Tw.darkBg),
              border: Border(top: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800))),
            ),
            child: Row(children: [
              if (_saving && newCount > 0)
                Expanded(
                  child: Text(t.taskImagesUploading(uploaded, newCount),
                      style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
                )
              else
                const Spacer(),
              if (_doneWithErrors)
                FilledButton(onPressed: () => Navigator.pop(context), child: Text(t.taskImagesClose))
              else ...[
                OutlinedButton(onPressed: _saving ? null : () => Navigator.pop(context), child: Text(t.commonCancel)),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _saving || !_imagesLoaded ? null : _submit,
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    if (_saving) ...[
                      SizedBox.square(dimension: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Theme.of(context).colorScheme.onPrimary)),
                      const SizedBox(width: 8),
                    ],
                    Text(_saving ? t.commonSaving : (_isEdit ? t.taskDialogSubmitEdit : t.taskDialogSubmitCreate)),
                  ]),
                ),
              ],
            ]),
          ),
        ),
      ),
    );
  }

  Widget _imagesField(AppLocalizations t, bool locked) {
    final remaining = taskImageLimit - _images.length;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(children: [
          Text.rich(
            TextSpan(text: t.taskImagesLabel, children: [
              TextSpan(text: ' (${_images.length}/$taskImageLimit)', style: TextStyle(color: context.tw(Tw.zinc500, Tw.zinc400))),
            ]),
            style: TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300)),
          ),
          const Spacer(),
          if (_images.length > 1)
            Flexible(
              child: Text(t.taskImagesHint,
                  textAlign: TextAlign.right, style: TextStyle(fontSize: TwSize.text10, color: context.tw(Tw.zinc500, Tw.zinc400))),
            ),
        ]),
        const SizedBox(height: 6),
        if (!_imagesLoaded)
          const LoadingView()
        else
          LayoutBuilder(builder: (context, c) {
            const gap = 8.0;
            final size = (c.maxWidth - gap * 2) / 3;
            return Wrap(
              spacing: gap,
              runSpacing: gap,
              children: [
                for (var i = 0; i < _images.length; i++) _tile(_images[i], i, size, locked, t),
                if (remaining > 0 && !locked)
                  GestureDetector(
                    onTap: _pickSource,
                    child: Container(
                      width: size,
                      height: size,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(TwSize.radiusLg),
                        border: Border.all(color: context.tw(Tw.zinc300, Tw.zinc700), width: 2, strokeAlign: BorderSide.strokeAlignInside),
                      ),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(LucideIcons.imagePlus, size: 20, color: context.tw(Tw.zinc500, Tw.zinc400)),
                        const SizedBox(height: 4),
                        Text(t.taskImagesAdd, style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc500, Tw.zinc400))),
                      ]),
                    ),
                  ),
              ],
            );
          }),
        if (remaining <= 0) ...[
          const SizedBox(height: 4),
          Text(t.taskImagesLimitReached(taskImageLimit), style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
        ],
        for (final err in _imageErrors) ...[
          const SizedBox(height: 4),
          Text(err, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
        ],
      ],
    );
  }

  /// Ô ảnh: giữ ~0,3s rồi kéo để đổi thứ tự; ☆ đặt đại diện; ✕ bỏ ảnh; thanh tiến trình khi upload.
  Widget _tile(_Img img, int index, double size, bool locked, AppLocalizations t) {
    final isCover = index == 0;
    final failed = _failed.contains(img.key);
    final p = _progress[img.key];
    final uploading = p != null && p < 1 && !failed;

    Widget circle(IconData icon, VoidCallback onTap, String tip, {Color? hover}) => Tooltip(
          message: tip,
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(color: hover ?? Colors.black.withValues(alpha: 0.5), shape: BoxShape.circle),
              child: Icon(icon, size: 14, color: Colors.white),
            ),
          ),
        );

    final content = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(TwSize.radiusLg),
        border: Border.all(
          color: failed ? Tw.red500 : (isCover ? Tw.amber400 : context.tw(Tw.zinc200, Tw.zinc700)),
          width: isCover || failed ? 2 : 1,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(fit: StackFit.expand, children: [
        img.isNew ? Image.file(File(img.file!.path), fit: BoxFit.cover) : NetImage(url: img.url),
        if (isCover)
          Positioned(
            top: 4,
            left: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
              decoration: BoxDecoration(color: Tw.amber400, borderRadius: BorderRadius.circular(TwSize.radiusMd)),
              child: const Icon(LucideIcons.star, size: 12, color: Tw.zinc900),
            ),
          )
        else if (!locked)
          Positioned(top: 4, left: 4, child: circle(LucideIcons.star, () => _moveImage(img.key, 0), t.taskImagesSetCover)),
        if (!locked) Positioned(top: 4, right: 4, child: circle(LucideIcons.x, () => _removeImage(img), t.taskImagesRemove)),
        if (uploading)
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: LinearProgressIndicator(value: p, minHeight: 5, backgroundColor: Colors.black26, color: Tw.emerald500),
          ),
        if (failed) Container(color: Tw.alpha(Tw.red600, 0.4), child: const Icon(LucideIcons.circleAlert, color: Colors.white)),
      ]),
    );

    if (locked) return content;
    return DragTarget<String>(
      onWillAcceptWithDetails: (d) => d.data != img.key,
      onAcceptWithDetails: (d) => _moveImage(d.data, index),
      builder: (context, candidates, _) => LongPressDraggable<String>(
        data: img.key,
        delay: const Duration(milliseconds: 300),
        feedback: Material(color: Colors.transparent, elevation: 8, child: Opacity(opacity: 0.9, child: content)),
        childWhenDragging: Opacity(opacity: 0.3, child: content),
        child: AnimatedScale(scale: candidates.isNotEmpty ? 0.94 : 1, duration: const Duration(milliseconds: 150), child: content),
      ),
    );
  }
}
