import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/common.dart';

/// "DD/MM/YYYY HH:mm" — formatTimestamp của web
String _timestamp(int ms) {
  final d = DateTime.fromMillisecondsSinceEpoch(ms);
  String two(int v) => v.toString().padLeft(2, '0');
  return '${two(d.day)}/${two(d.month)}/${d.year} ${two(d.hour)}:${two(d.minute)}';
}

String _size(int bytes) {
  if (bytes < 1024) return '$bytes B';
  if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
  return '${(bytes / 1024 / 1024).toStringAsFixed(1)} MB';
}

/// Bình luận của task — port task-comments.tsx: thread 1 cấp, trả lời, sửa/xoá của mình,
/// đính kèm ảnh/Office/PDF (≤25MB, ≤10 file).
class CommentsSection extends ConsumerStatefulWidget {
  const CommentsSection({super.key, required this.taskId, required this.projectId});
  final String taskId;
  final String projectId;

  @override
  ConsumerState<CommentsSection> createState() => _CommentsSectionState();
}

class _CommentsSectionState extends ConsumerState<CommentsSection> {
  final _input = TextEditingController();
  final List<LocalFile> _files = [];
  Comment? _replyTo;
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  void _afterChange() {
    ref.invalidate(commentsProvider(widget.taskId));
    // commentCount trên danh sách task
    ref.invalidate(projectTasksProvider(widget.projectId));
    ref.invalidate(allTasksProvider);
  }

  Future<void> _pickFiles() async {
    final t = AppLocalizations.of(context);
    // file_picker 13: hàm tĩnh, trả về danh sách (rỗng nếu huỷ), mặc định chọn nhiều file
    final picked = await FilePicker.pickFiles(type: FileType.custom, allowedExtensions: commentAttachmentExtensions);
    if (picked.isEmpty) return;
    final errs = <String>[];
    for (final f in picked) {
      final path = f.path;
      if (path == null) continue;
      final size = await f.xFile.length();
      if (size == 0) {
        errs.add(t.attachmentsErrorEmpty(f.name));
      } else if (size > commentAttachmentMaxBytes) {
        errs.add(t.attachmentsErrorTooLarge(f.name, commentAttachmentMaxBytes ~/ 1024 ~/ 1024));
      } else if (_files.length < commentAttachmentMaxCount) {
        _files.add(LocalFile(path: path, name: f.name, size: size));
      } else {
        errs.add(t.commentsMaxPerComment(commentAttachmentMaxCount));
        break;
      }
    }
    setState(() => _error = errs.isEmpty ? null : errs.join('\n'));
  }

  Future<void> _send() async {
    final t = AppLocalizations.of(context);
    final text = _input.text.trim();
    if (text.isEmpty && _files.isEmpty) return;
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ref.read(commentsRepoProvider).create(
            widget.taskId,
            // Server yêu cầu body không rỗng → dùng nhãn "(file đính kèm)" như web
            text.isEmpty ? t.commentsAttachOnlyFallback : text,
            parentId: _replyTo?.id,
            files: List.of(_files),
          );
      _input.clear();
      _files.clear();
      _replyTo = null;
      _afterChange();
    } catch (e) {
      _error = errorMessage(e);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(commentsProvider(widget.taskId));
    final comments = q.value ?? const <Comment>[];
    final roots = comments.where((c) => c.parentId == null).toList()..sort((a, b) => a.createdAt.compareTo(b.createdAt));
    List<Comment> repliesOf(String id) => comments.where((c) => c.parentId == id).toList()..sort((a, b) => a.createdAt.compareTo(b.createdAt));

    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SectionHeader(icon: LucideIcons.messageSquare, title: t.commentsTitle, subtitle: '${comments.length}'),
          Padding(
            padding: const EdgeInsets.all(12),
            child: q.isLoading
                ? LoadingView(label: t.commentsLoading)
                : q.hasError
                    ? ErrorView(error: q.error!, onRetry: () => ref.invalidate(commentsProvider(widget.taskId)))
                    : roots.isEmpty
                        ? EmptyView(title: t.commentsEmpty, italic: true)
                        : Column(children: [
                            for (final root in roots) ...[
                              _CommentTile(comment: root, onReply: () => setState(() => _replyTo = root), onChanged: _afterChange),
                              for (final r in repliesOf(root.id))
                                Padding(
                                  padding: const EdgeInsets.only(left: 36),
                                  child: _CommentTile(comment: r, onReply: () => setState(() => _replyTo = r), onChanged: _afterChange),
                                ),
                            ],
                          ]),
          ),
          const Divider(),
          _composer(t),
        ],
      ),
    );
  }

  Widget _composer(AppLocalizations t) {
    final hint = _replyTo == null ? t.commentsPlaceholder : t.commentsReplyPlaceholder(_replyTo!.authorName);
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_replyTo != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(children: [
                Icon(LucideIcons.reply, size: 12, color: context.tw(Tw.zinc500, Tw.zinc400)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(t.commentsReplyingTo(_replyTo!.authorName),
                      style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc600, Tw.zinc400))),
                ),
                GestureDetector(
                  onTap: () => setState(() => _replyTo = null),
                  child: Text(t.commentsCancel, style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300))),
                ),
              ]),
            ),
          TextField(controller: _input, minLines: 2, maxLines: 6, enabled: !_sending, decoration: InputDecoration(hintText: hint)),
          if (_files.isNotEmpty) ...[
            const SizedBox(height: 8),
            Wrap(spacing: 6, runSpacing: 6, children: [
              for (final f in List.of(_files))
                InputChip(
                  label: Text('${f.name} (${_size(f.size)})', style: const TextStyle(fontSize: TwSize.text11)),
                  onDeleted: _sending ? null : () => setState(() => _files.remove(f)),
                  deleteButtonTooltipMessage: t.commentsRemoveFile(f.name),
                  visualDensity: VisualDensity.compact,
                ),
            ]),
          ],
          if (_error != null) ...[
            const SizedBox(height: 6),
            Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
          ],
          const SizedBox(height: 8),
          Row(children: [
            SoftButton(label: t.commentsAttach, icon: LucideIcons.paperclip, onPressed: _sending ? null : _pickFiles),
            const Spacer(),
            FilledButton.icon(
              onPressed: _sending ? null : _send,
              icon: _sending
                  ? SizedBox.square(dimension: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Theme.of(context).colorScheme.onPrimary))
                  : const Icon(LucideIcons.send, size: 14),
              label: Text(_sending ? t.commentsSending : (_replyTo == null ? t.commentsSend : t.commentsSendReply),
                  style: const TextStyle(fontSize: TwSize.textXs)),
            ),
          ]),
        ],
      ),
    );
  }
}

class _CommentTile extends ConsumerStatefulWidget {
  const _CommentTile({required this.comment, required this.onReply, required this.onChanged});
  final Comment comment;
  final VoidCallback onReply;
  final VoidCallback onChanged;

  @override
  ConsumerState<_CommentTile> createState() => _CommentTileState();
}

class _CommentTileState extends ConsumerState<_CommentTile> {
  bool _editing = false;
  bool _busy = false;
  late final _edit = TextEditingController(text: widget.comment.body);

  @override
  void dispose() {
    _edit.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_edit.text.trim().isEmpty) return;
    setState(() => _busy = true);
    try {
      await ref.read(commentsRepoProvider).update(widget.comment.id, _edit.text.trim());
      widget.onChanged();
      setState(() => _editing = false);
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final t = AppLocalizations.of(context);
    if (!await confirmDialog(context, t.commentsDeleteConfirm)) return;
    try {
      await ref.read(commentsRepoProvider).remove(widget.comment.id);
      widget.onChanged();
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(e), error: true);
    }
  }

  Future<void> _openFile(CommentAttachment a) async {
    if (a.fileUrl == null) return;
    // PDF: mở để xem; file Office: tải qua worker (?download=1) như web
    final url = a.isPdf
        ? a.fileUrl!
        : '${a.fileUrl}${a.fileUrl!.contains('?') ? '&' : '?'}download=1&filename=${Uri.encodeComponent(a.fileName)}';
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final c = widget.comment;
    final mine = ref.watch(uidProvider) == c.authorId;
    final muted = TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400));
    final images = c.attachments.where((a) => a.isImage && a.fileUrl != null).toList();
    final others = c.attachments.where((a) => !a.isImage).toList();
    final showBody = !(c.body == t.commentsAttachOnlyFallback && c.attachments.isNotEmpty);

    Widget action(String label, VoidCallback onTap, {bool danger = false}) => GestureDetector(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.only(right: 12, top: 4, bottom: 4),
            child: Text(label,
                style: TextStyle(
                  fontSize: TwSize.text11,
                  fontWeight: FontWeight.w500,
                  color: danger ? context.tw(Tw.red600, Tw.red400) : context.tw(Tw.zinc600, Tw.zinc400),
                )),
          ),
        );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        UserAvatar(name: c.authorName.isEmpty ? t.commentsUserFallback : c.authorName, url: c.authorAvatarUrl, size: 28),
        const SizedBox(width: 8),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Wrap(spacing: 6, crossAxisAlignment: WrapCrossAlignment.center, children: [
              Text(c.authorName.isEmpty ? t.commentsUserFallback : c.authorName,
                  style: const TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w600)),
              Text(_timestamp(c.createdAt) + (c.edited ? t.commentsEdited : ''), style: muted),
            ]),
            if (c.replyToName != null && c.parentId != null && c.replyToId != c.parentId)
              Text('↳ @${c.replyToName}', style: muted),
            const SizedBox(height: 4),
            if (_editing) ...[
              TextField(controller: _edit, minLines: 2, maxLines: 6, autofocus: true),
              const SizedBox(height: 6),
              Row(children: [
                action(t.commentsCancel, () => setState(() => _editing = false)),
                action(_busy ? t.commonSaving : t.commentsSave, _busy ? () {} : _save),
              ]),
            ] else ...[
              if (showBody) SelectableText(c.body, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc800, Tw.zinc200))),
              if (images.isNotEmpty) ...[
                const SizedBox(height: 6),
                Wrap(spacing: 6, runSpacing: 6, children: [
                  for (var i = 0; i < images.length; i++)
                    GestureDetector(
                      onTap: () => openImageViewer(context, images.map((a) => a.fileUrl!).toList(), initial: i),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(TwSize.radiusLg),
                        child: SizedBox(width: 120, height: 90, child: NetImage(url: images[i].fileUrl)),
                      ),
                    ),
                ]),
              ],
              for (final a in others)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: InkWell(
                    onTap: () => _openFile(a),
                    borderRadius: BorderRadius.circular(TwSize.radiusLg),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: context.tw(Tw.zinc50, Tw.alpha(Tw.zinc900, 0.5)),
                        borderRadius: BorderRadius.circular(TwSize.radiusLg),
                        border: Border.all(color: context.tw(Tw.zinc200, Tw.zinc700)),
                      ),
                      child: Row(children: [
                        Icon(a.isPdf ? LucideIcons.fileText : LucideIcons.file, size: 16, color: context.tw(Tw.zinc600, Tw.zinc400)),
                        const SizedBox(width: 8),
                        Expanded(child: Text(a.fileName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textXs))),
                        Text(_size(a.fileSize), style: muted),
                        const SizedBox(width: 6),
                        Icon(a.isPdf ? LucideIcons.externalLink : LucideIcons.download, size: 14, color: muted.color),
                      ]),
                    ),
                  ),
                ),
              Row(children: [
                action(t.commentsReply, widget.onReply),
                if (mine) action(t.commentsEdit, () => setState(() => _editing = true)),
                if (mine) action(t.commentsDelete, _delete, danger: true),
              ]),
            ],
          ]),
        ),
      ]),
    );
  }
}
