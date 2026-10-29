import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/api/api_client.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import '../l10n/app_localizations.dart';

/// Khung thẻ: bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]
class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.borderColor, this.onTap});
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? borderColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final box = Container(
      decoration: BoxDecoration(
        color: context.tw(Tw.white, Tw.darkBg),
        borderRadius: BorderRadius.circular(TwSize.radiusXl),
        border: Border.all(color: borderColor ?? context.tw(Tw.gray200, Tw.darkBorder)),
      ),
      padding: padding,
      child: child,
    );
    if (onTap == null) return box;
    return Material(
      color: Colors.transparent,
      child: InkWell(onTap: onTap, borderRadius: BorderRadius.circular(TwSize.radiusXl), child: box),
    );
  }
}

/// Pill nhỏ (rounded-full / rounded-md) — badge trạng thái, vai trò…
class Pill extends StatelessWidget {
  const Pill({super.key, required this.label, required this.bg, required this.fg, this.icon, this.rounded = true, this.fontSize = TwSize.text10});
  final String label;
  final Color bg;
  final Color fg;
  final IconData? icon;
  final bool rounded;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(rounded ? 999 : TwSize.radiusMd)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 12, color: fg), const SizedBox(width: 4)],
          Flexible(
            child: Text(label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.w500, color: fg, height: 1.4)),
          ),
        ],
      ),
    );
  }
}

/// Badge xám trung tính: bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300
Pill neutralPill(BuildContext c, String label, {IconData? icon, bool rounded = false}) => Pill(
      label: label,
      icon: icon,
      rounded: rounded,
      bg: c.tw(Tw.zinc100, Tw.zinc800),
      fg: c.tw(Tw.zinc700, Tw.zinc300),
    );

String initialsOf(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first.characters.take(2).toString().toUpperCase();
  return (parts.first.characters.first + parts.last.characters.first).toUpperCase();
}

/// Avatar tròn: ảnh hoặc chữ cái đầu trên nền zinc-900 / dark zinc-50 (UserAvatar của web)
class UserAvatar extends StatelessWidget {
  const UserAvatar({super.key, required this.name, this.url, this.size = 32, this.ring = false});
  final String name;
  final String? url;
  final double size;
  final bool ring;

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      color: context.tw(Tw.zinc900, Tw.zinc50),
      alignment: Alignment.center,
      child: Text(
        initialsOf(name),
        style: TextStyle(
          fontSize: (size * 0.38).clamp(10, 40).toDouble(),
          fontWeight: FontWeight.w600,
          color: context.tw(Tw.zinc50, Tw.zinc900),
        ),
      ),
    );
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: ring ? Border.all(color: context.tw(Tw.white, Tw.darkBg), width: 2) : null,
      ),
      child: ClipOval(
        child: (url == null || url!.isEmpty)
            ? fallback
            : CachedNetworkImage(imageUrl: url!, fit: BoxFit.cover, errorWidget: (_, _, _) => fallback),
      ),
    );
  }
}

/// Ảnh mạng có nền chờ (bg-zinc-100 dark:bg-zinc-800) và icon khi không có ảnh.
class NetImage extends StatelessWidget {
  const NetImage({super.key, required this.url, this.fit = BoxFit.cover, this.iconSize = 20});
  final String? url;
  final BoxFit fit;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final bg = context.tw(Tw.zinc100, Tw.zinc800);
    final icon = Container(
      color: bg,
      alignment: Alignment.center,
      child: Icon(LucideIcons.image, size: iconSize, color: context.tw(Tw.zinc400, Tw.zinc500)),
    );
    if (url == null || url!.isEmpty) return icon;
    return CachedNetworkImage(
      imageUrl: url!,
      fit: fit,
      placeholder: (_, _) => Container(color: bg),
      errorWidget: (_, _, _) => icon,
    );
  }
}

/// Mở/đóng có hiệu ứng trượt mượt ~300ms (Collapse của web); tắt hiệu ứng nếu máy bật Reduce Motion.
class Collapse extends StatelessWidget {
  const Collapse({super.key, required this.open, required this.child});
  final bool open;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final reduce = MediaQuery.of(context).disableAnimations;
    final d = reduce ? Duration.zero : const Duration(milliseconds: 300);
    return ClipRect(
      child: AnimatedSize(
        duration: d,
        curve: Curves.easeOut,
        alignment: Alignment.topCenter,
        child: AnimatedOpacity(
          duration: d,
          curve: Curves.easeOut,
          opacity: open ? 1 : 0,
          child: open ? child : const SizedBox(width: double.infinity),
        ),
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.label});
  final String? label;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: context.tw(Tw.zinc400, Tw.zinc500))),
            if (label != null) ...[
              const SizedBox(width: 8),
              Text(label!, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
            ],
          ],
        ),
      );
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            errorMessage(error),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.red600, Tw.red400)),
          ),
          if (onRetry != null) ...[
            const SizedBox(height: 8),
            TextButton(onPressed: onRetry, child: Text(t.commonRetry)),
          ],
        ],
      ),
    );
  }
}

String errorMessage(Object e) => e is ApiError ? e.message : e.toString();

class EmptyView extends StatelessWidget {
  const EmptyView({super.key, required this.title, this.help, this.italic = false});
  final String title;
  final String? help;
  final bool italic;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 28),
        child: Column(
          children: [
            Text(title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: help == null ? TwSize.textXs : TwSize.textSm,
                  fontWeight: help == null ? FontWeight.w400 : FontWeight.w500,
                  fontStyle: italic ? FontStyle.italic : FontStyle.normal,
                  color: help == null ? context.tw(Tw.zinc500, Tw.zinc400) : context.tw(Tw.zinc900, Tw.zinc100),
                )),
            if (help != null) ...[
              const SizedBox(height: 4),
              Text(help!, textAlign: TextAlign.center, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
            ],
          ],
        ),
      );
}

/// Tiêu đề khối có icon (SectionCard header của web)
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.icon, required this.title, this.subtitle, this.trailing, this.danger = false});
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? context.tw(Tw.red600, Tw.red400) : context.tw(Tw.zinc700, Tw.zinc300);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800)))),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Flexible(
            child: Text(title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w600, color: context.tw(Tw.zinc900, Tw.zinc100))),
          ),
          if (subtitle != null)
            Text('  ·  $subtitle', style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
          const Spacer(),
          ?trailing,
        ],
      ),
    );
  }
}

/// Nút phụ: bg-zinc-100 dark:bg-zinc-800 rounded-lg
class SoftButton extends StatelessWidget {
  const SoftButton({super.key, required this.label, this.icon, required this.onPressed, this.danger = false});
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final fg = danger ? context.tw(Tw.red600, Tw.red400) : context.tw(Tw.zinc900, Tw.zinc100);
    return TextButton.icon(
      onPressed: onPressed,
      icon: icon == null ? const SizedBox.shrink() : Icon(icon, size: 14, color: fg),
      label: Text(label, style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: fg)),
      style: TextButton.styleFrom(
        backgroundColor: danger ? context.tw(Tw.red50, Tw.alpha(Tw.red900, 0.2)) : context.tw(Tw.zinc100, Tw.zinc800),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        minimumSize: const Size(0, 30),
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(TwSize.radiusLg)),
      ),
    );
  }
}

Future<bool> confirmDialog(BuildContext context, String message, {String? confirmLabel, bool danger = true}) async {
  final t = AppLocalizations.of(context);
  final ok = await showDialog<bool>(
    context: context,
    builder: (c) => AlertDialog(
      content: Text(message, style: const TextStyle(fontSize: TwSize.textSm)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t.commonCancel)),
        FilledButton(
          style: danger ? FilledButton.styleFrom(backgroundColor: c.tw(Tw.red600, Tw.red500), foregroundColor: Tw.white) : null,
          onPressed: () => Navigator.pop(c, true),
          child: Text(confirmLabel ?? t.commonDelete),
        ),
      ],
    ),
  );
  return ok == true;
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message),
      behavior: SnackBarBehavior.floating,
      backgroundColor: error ? Tw.red600 : null,
    ));
}

/// Xem ảnh toàn màn hình: vuốt trái/phải, pinch-zoom, đếm "2 / 5" (lightbox của web).
Future<void> openImageViewer(BuildContext context, List<String> urls, {int initial = 0}) {
  return Navigator.of(context, rootNavigator: true).push(PageRouteBuilder(
    opaque: false,
    barrierColor: Colors.black87,
    pageBuilder: (_, _, _) => _ImageViewer(urls: urls, initial: initial),
    transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
  ));
}

class _ImageViewer extends StatefulWidget {
  const _ImageViewer({required this.urls, required this.initial});
  final List<String> urls;
  final int initial;

  @override
  State<_ImageViewer> createState() => _ImageViewerState();
}

class _ImageViewerState extends State<_ImageViewer> {
  late final PageController _pc = PageController(initialPage: widget.initial);
  late int _index = widget.initial;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final many = widget.urls.length > 1;
    Widget circleBtn(IconData icon, VoidCallback onTap, String label) => Material(
          color: Colors.white.withValues(alpha: 0.12),
          shape: const CircleBorder(),
          child: IconButton(onPressed: onTap, icon: Icon(icon, color: Colors.white), tooltip: label),
        );
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Stack(
          children: [
            PageView.builder(
              controller: _pc,
              itemCount: widget.urls.length,
              onPageChanged: (i) => setState(() => _index = i),
              itemBuilder: (_, i) => InteractiveViewer(
                minScale: 1,
                maxScale: 4,
                child: Center(child: CachedNetworkImage(imageUrl: widget.urls[i], fit: BoxFit.contain)),
              ),
            ),
            Positioned(top: 8, right: 8, child: circleBtn(LucideIcons.x, () => Navigator.pop(context), t.imageLightboxClose)),
            if (many)
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                  child: Text('${_index + 1} / ${widget.urls.length}', style: const TextStyle(color: Colors.white, fontSize: TwSize.textXs)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Màn "không có quyền" (AdminOnly của web)
class NoPermissionView extends StatelessWidget {
  const NoPermissionView({super.key, this.onBack});
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.all(16),
      child: AppCard(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Icon(LucideIcons.shieldAlert, size: 40, color: Tw.amber500),
            const SizedBox(height: 12),
            Text(t.accessNoPermissionTitle, textAlign: TextAlign.center, style: const TextStyle(fontSize: TwSize.textBase, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(t.accessNoPermissionDesc,
                textAlign: TextAlign.center, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
            if (onBack != null) ...[
              const SizedBox(height: 16),
              FilledButton(onPressed: onBack, child: Text(t.accessBackToDashboard)),
            ],
          ],
        ),
      ),
    );
  }
}
