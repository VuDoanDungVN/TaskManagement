import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/dates.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/common.dart';

/// Trang hồ sơ đầy đủ (mở từ avatar trên TabAppBar) — thay cho bottom sheet rút gọn:
/// avatar lớn, đầy đủ thông tin tài khoản, nút Đăng xuất. KHÔNG có nút Cài đặt
/// (đã là tab riêng ở bottom nav).
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _uploading = false;
  bool _signingOut = false;

  Future<void> _changeAvatar() async {
    final t = AppLocalizations.of(context);
    // imageQuality/maxWidth → iOS chuyển HEIC sang JPEG (server chỉ nhận JPG/PNG/WEBP/GIF)
    final x = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
      maxWidth: 1024,
    );
    if (x == null) return;
    setState(() => _uploading = true);
    try {
      await ref
          .read(uploadsRepoProvider)
          .avatar(
            LocalFile(path: x.path, name: x.name, size: await x.length()),
          );
      ref.invalidate(meProvider);
    } catch (e) {
      if (mounted) {
        showSnack(
          context,
          '${t.profileUploadFailed} ${errorMessage(e)}',
          error: true,
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _signOut() async {
    setState(() => _signingOut = true);
    final nav = Navigator.of(context);
    await ref.read(firebaseAuthProvider).signOut();
    if (nav.canPop()) {
      nav.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final me = ref.watch(meProvider).value;
    final admin = me?.isAdmin ?? false;
    final muted = context.tw(Tw.zinc500, Tw.zinc400);

    Widget statTile(IconData icon, String value, String label) => Expanded(
      child: AppCard(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Icon(icon, size: 18, color: muted),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                fontSize: TwSize.textLg,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(fontSize: TwSize.text11, color: muted),
            ),
          ],
        ),
      ),
    );

    Widget infoRow(IconData icon, String text, {Color? color}) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color ?? muted),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: TwSize.textXs,
                color: color ?? context.tw(Tw.zinc700, Tw.zinc300),
              ),
            ),
          ),
        ],
      ),
    );

    return Scaffold(
      appBar: AppBar(title: Text(t.profileProfile)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Center(
              child: GestureDetector(
                onTap: _uploading ? null : _changeAvatar,
                child: Stack(
                  children: [
                    UserAvatar(
                      name: me?.name ?? '?',
                      url: me?.avatarUrl,
                      size: 84,
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: context.tw(Tw.zinc900, Tw.zinc50),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: context.tw(Tw.white, Tw.darkBg),
                            width: 2,
                          ),
                        ),
                        child: _uploading
                            ? Padding(
                                padding: const EdgeInsets.all(6),
                                child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  color: context.tw(Tw.white, Tw.zinc900),
                                ),
                              )
                            : Icon(
                                LucideIcons.camera,
                                size: 13,
                                color: context.tw(Tw.white, Tw.zinc900),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              me?.name ?? '',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: TwSize.textLg,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              me?.email ?? '',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: TwSize.textXs, color: muted),
            ),
            const SizedBox(height: 10),
            Center(
              child: Pill(
                label: admin ? t.accessRoleAdmin : t.accessRoleCustomer,
                icon: admin ? LucideIcons.shieldCheck : null,
                bg: admin
                    ? context.tw(Tw.amber100, Tw.alpha(Tw.amber900, 0.3))
                    : context.tw(Tw.blue100, Tw.alpha(Tw.blue900, 0.3)),
                fg: admin
                    ? context.tw(Tw.amber700, Tw.amber400)
                    : context.tw(Tw.blue700, Tw.blue400),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                statTile(
                  LucideIcons.folderKanban,
                  '${me?.projectCount ?? 0}',
                  t.profileStatProjects,
                ),
                const SizedBox(width: 12),
                statTile(
                  LucideIcons.usersRound,
                  '${me?.teamCount ?? 0}',
                  t.profileStatTeams,
                ),
              ],
            ),
            const SizedBox(height: 12),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              child: Column(
                children: [
                  infoRow(
                    me?.emailVerified ?? false
                        ? LucideIcons.badgeCheck
                        : LucideIcons.badgeAlert,
                    me?.emailVerified ?? false
                        ? t.profileEmailVerified
                        : t.profileEmailNotVerified,
                    color: me?.emailVerified ?? false
                        ? context.tw(Tw.emerald600, Tw.emerald400)
                        : context.tw(Tw.amber700, Tw.amber400),
                  ),
                  if (me != null) ...[
                    const Divider(height: 1),
                    infoRow(
                      LucideIcons.calendar,
                      t.profileJoinedOn(formatMs(me.createdAt)),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 46,
              child: OutlinedButton.icon(
                onPressed: _signingOut ? null : _signOut,
                style: OutlinedButton.styleFrom(
                  foregroundColor: context.tw(Tw.red600, Tw.red400),
                  side: BorderSide(
                    color: context.tw(Tw.red200, Tw.alpha(Tw.red500, 0.4)),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(TwSize.radiusXl),
                  ),
                ),
                icon: _signingOut
                    ? SizedBox.square(
                        dimension: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: context.tw(Tw.red600, Tw.red400),
                        ),
                      )
                    : const Icon(LucideIcons.logOut, size: 18),
                label: Text(
                  _signingOut ? t.profileSigningOut : t.profileSignOut,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
