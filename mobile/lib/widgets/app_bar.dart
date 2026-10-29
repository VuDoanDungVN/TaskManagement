import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/state/providers.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import 'common.dart';

/// Logo app (TaskLogo của web): ô vuông bo 8 nền zinc-900 + dấu ✓ trắng (đảo màu ở dark mode).
class TaskLogo extends StatelessWidget {
  const TaskLogo({super.key, this.size = 32});
  final double size;

  @override
  Widget build(BuildContext context) => CustomPaint(
    size: Size.square(size),
    painter: _LogoPainter(
      bg: context.tw(Tw.zinc900, Tw.zinc50),
      fg: context.tw(Tw.white, Tw.zinc900),
    ),
  );
}

class _LogoPainter extends CustomPainter {
  _LogoPainter({required this.bg, required this.fg});
  final Color bg;
  final Color fg;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 32;
    canvas.drawRRect(
      RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(8 * s)),
      Paint()..color = bg,
    );
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
            child: Text(
              title,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: TwSize.textBase,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      actions: [
        ...actions,
        Padding(
          padding: const EdgeInsets.only(right: 12, left: 4),
          child: GestureDetector(
            onTap: () => GoRouter.of(context).push('/profile'),
            child: UserAvatar(
              name: me?.name ?? '?',
              url: me?.avatarUrl,
              size: 32,
            ),
          ),
        ),
      ],
    );
  }
}
