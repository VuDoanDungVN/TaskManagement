import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/state/providers.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import '../data/repositories.dart';
import '../l10n/app_localizations.dart';
import 'common.dart';

/// Logo app (TaskLogo của web): ô vuông bo 8 nền zinc-900 + dấu ✓ trắng (đảo màu ở dark mode).
class TaskLogo extends StatelessWidget {
  const TaskLogo({super.key, this.size = 32});
  final double size;

  @override
  Widget build(BuildContext context) => CustomPaint(
        size: Size.square(size),
        painter: _LogoPainter(bg: context.tw(Tw.zinc900, Tw.zinc50), fg: context.tw(Tw.white, Tw.zinc900)),
      );
}

class _LogoPainter extends CustomPainter {
  _LogoPainter({required this.bg, required this.fg});
  final Color bg;
  final Color fg;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 32;
    canvas.drawRRect(RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(8 * s)), Paint()..color = bg);
    final path = Path()
      ..moveTo(9 * s, 16.5 * s)
      ..lineTo(13.5 * s, 21 * s)
      ..lineTo(23 * s, 11.5 * s);
    canvas.drawPath(
      path,
      Paint()
        ..color = fg
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3 * s
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_LogoPainter old) => old.bg != bg || old.fg != fg;
}

/// Thanh trên cùng của mỗi tab: tiêu đề + avatar (mở bảng hồ sơ như menu avatar của web).
class TabAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const TabAppBar({super.key, required this.title, this.actions = const []});
  final String title;
  final List<Widget> actions;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final me = ref.watch(meProvider).value;
    return AppBar(
      titleSpacing: 16,
      title: Row(
        children: [
          const TaskLogo(size: 24),
          const SizedBox(width: 10),
          Flexible(
            child: Text(title,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: TwSize.textBase, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      actions: [
        ...actions,
        Padding(
          padding: const EdgeInsets.only(right: 12, left: 4),
          child: GestureDetector(
            onTap: () => showProfileSheet(context),
            child: UserAvatar(name: me?.name ?? '?', url: me?.avatarUrl, size: 32),
          ),
        ),
      ],
    );
  }
}

/// Bảng hồ sơ (Profile01 của web): avatar (đổi ảnh), tên, email, vai trò, Cài đặt, Đăng xuất.
Future<void> showProfileSheet(BuildContext context) => showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => const _ProfileSheet(),
    );

class _ProfileSheet extends ConsumerStatefulWidget {
  const _ProfileSheet();

  @override
  ConsumerState<_ProfileSheet> createState() => _ProfileSheetState();
}

class _ProfileSheetState extends ConsumerState<_ProfileSheet> {
  bool _uploading = false;
  bool _signingOut = false;

  Future<void> _changeAvatar() async {
    final t = AppLocalizations.of(context);
    // imageQuality/maxWidth → iOS chuyển HEIC sang JPEG (server chỉ nhận JPG/PNG/WEBP/GIF)
    final x = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 90, maxWidth: 1024);
    if (x == null) return;
    setState(() => _uploading = true);
    try {
      await ref.read(uploadsRepoProvider).avatar(LocalFile(path: x.path, name: x.name, size: await x.length()));
      ref.invalidate(meProvider);
    } catch (e) {
      if (mounted) showSnack(context, '${t.profileUploadFailed} ${errorMessage(e)}', error: true);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _signOut() async {
    setState(() => _signingOut = true);
    final nav = Navigator.of(context);
    await ref.read(firebaseAuthProvider).signOut();
    nav.pop();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final me = ref.watch(meProvider).value;
    final admin = me?.isAdmin ?? false;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: _uploading ? null : _changeAvatar,
                  child: Stack(
                    children: [
                      UserAvatar(name: me?.name ?? '?', url: me?.avatarUrl, size: 56),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: context.tw(Tw.zinc900, Tw.zinc50),
                            shape: BoxShape.circle,
                            border: Border.all(color: context.tw(Tw.white, Tw.darkBg), width: 2),
                          ),
                          child: _uploading
                              ? Padding(
                                  padding: const EdgeInsets.all(4),
                                  child: CircularProgressIndicator(strokeWidth: 1.5, color: context.tw(Tw.white, Tw.zinc900)),
                                )
                              : Icon(LucideIcons.camera, size: 11, color: context.tw(Tw.white, Tw.zinc900)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(me?.name ?? '', maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w600)),
                      Text(me?.email ?? '', maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc500, Tw.zinc400))),
                      const SizedBox(height: 6),
                      if (me != null)
                        Pill(
                          label: admin ? t.accessRoleAdmin : t.accessRoleCustomer,
                          icon: admin ? LucideIcons.shieldCheck : null,
                          bg: admin
                              ? context.tw(Tw.amber100, Tw.alpha(Tw.amber900, 0.3))
                              : context.tw(Tw.blue100, Tw.alpha(Tw.blue900, 0.3)),
                          fg: admin ? context.tw(Tw.amber700, Tw.amber400) : context.tw(Tw.blue700, Tw.blue400),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(LucideIcons.settings, size: 18),
              title: Text(t.profileSettings, style: const TextStyle(fontSize: TwSize.textSm)),
              trailing: const Icon(LucideIcons.chevronRight, size: 16),
              onTap: () {
                Navigator.pop(context);
                GoRouter.of(context).go('/settings');
              },
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: _signingOut
                  ? SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2, color: context.tw(Tw.red600, Tw.red400)))
                  : Transform.rotate(angle: math.pi, child: Icon(LucideIcons.logIn, size: 18, color: context.tw(Tw.red600, Tw.red400))),
              title: Text(_signingOut ? t.profileSigningOut : t.profileSignOut,
                  style: TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500, color: context.tw(Tw.red600, Tw.red400))),
              onTap: _signingOut ? null : _signOut,
            ),
          ],
        ),
      ),
    );
  }
}
