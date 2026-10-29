import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_bar.dart';
import '../../widgets/common.dart';

const _pageSize = 20;

/// Quản lý người dùng (admin) — bản mobile của member-list.tsx: danh sách gọn, menu ⋯,
/// tạo tài khoản, gửi lại link đặt mật khẩu, khoá/mở khoá, gán dự án, nhóm.
class MembersScreen extends ConsumerStatefulWidget {
  const MembersScreen({super.key});

  @override
  ConsumerState<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends ConsumerState<MembersScreen> {
  final _scroll = ScrollController();
  Timer? _debounce;
  String _search = '';
  final List<AppUser> _users = [];
  String? _cursor;
  bool _hasMore = true;
  bool _loading = false;
  Object? _error;
  String? _actionError;

  @override
  void initState() {
    super.initState();
    _reload();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 200) _loadMore();
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    _users.clear();
    _cursor = null;
    _hasMore = true;
    _error = null;
    await _loadMore();
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    setState(() => _loading = true);
    try {
      final page = await ref.read(usersRepoProvider).list(limit: _pageSize, cursor: _cursor, search: _search.trim());
      _users.addAll(page.items);
      _cursor = page.nextCursor;
      _hasMore = page.nextCursor != null;
    } catch (e) {
      _error = e;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _replace(AppUser u) => setState(() {
        final i = _users.indexWhere((x) => x.id == u.id);
        if (i >= 0) _users[i] = u;
      });

  Future<void> _toggleLock(AppUser u) async {
    final t = AppLocalizations.of(context);
    final locking = !u.isDisabled;
    final ok = await confirmDialog(
      context,
      locking ? t.accessLockConfirm(u.email) : t.accessUnlockConfirm(u.email),
      confirmLabel: locking ? t.accessActionLock : t.accessActionUnlock,
      danger: locking,
    );
    if (!ok) return;
    try {
      _replace(await ref.read(usersRepoProvider).update(u.id, status: locking ? UserStatus.disabled : UserStatus.active));
    } catch (e) {
      setState(() => _actionError = errorMessage(e));
    }
  }

  Future<void> _resend(AppUser u) async {
    try {
      final res = await ref.read(usersRepoProvider).resendSetupLink(u.id);
      if (mounted) showSetupLinkSheet(context, email: u.email, result: res, title: AppLocalizations.of(context).accessResendTitle);
    } catch (e) {
      setState(() => _actionError = errorMessage(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final isAdmin = ref.watch(isAdminProvider);
    final meQ = ref.watch(meProvider);
    final myId = meQ.value?.id;

    if (meQ.isLoading) return Scaffold(appBar: TabAppBar(title: t.navMembers), body: const LoadingView());
    if (!isAdmin) {
      return Scaffold(
        appBar: TabAppBar(title: t.navMembers),
        body: NoPermissionView(onBack: () => GoRouter.of(context).go('/dashboard')),
      );
    }

    return Scaffold(
      appBar: TabAppBar(title: t.navMembers),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: ListView(
          controller: _scroll,
          padding: const EdgeInsets.all(16),
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(children: [
                    Icon(LucideIcons.usersRound, size: 16, color: context.tw(Tw.zinc900, Tw.zinc50)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(t.membersListTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w700))),
                  ]),
                  const SizedBox(height: 2),
                  Text(t.membersListSubtitle, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc500, Tw.zinc400))),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () async {
                      final created = await showCreateAccountSheet(context);
                      if (created == true) _reload();
                    },
                    icon: const Icon(LucideIcons.userPlus, size: 14),
                    label: Text(t.accessCreateAccount, style: const TextStyle(fontSize: TwSize.textXs)),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    decoration: InputDecoration(
                      hintText: t.membersListSearchPlaceholder,
                      prefixIcon: const Icon(LucideIcons.search, size: 16),
                      prefixIconConstraints: const BoxConstraints(minWidth: 36),
                    ),
                    onChanged: (v) {
                      _search = v;
                      _debounce?.cancel();
                      _debounce = Timer(const Duration(milliseconds: 300), _reload);
                    },
                  ),
                  if (_actionError != null) ...[
                    const SizedBox(height: 8),
                    Text(_actionError!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
                  ],
                  const SizedBox(height: 12),
                  if (_users.isEmpty && _loading)
                    LoadingView(label: t.membersListLoading)
                  else if (_users.isEmpty && _error != null)
                    ErrorView(error: _error!, onRetry: _reload)
                  else if (_users.isEmpty)
                    EmptyView(title: t.membersListEmptyTitle, help: _search.isNotEmpty ? t.membersListEmptyHelpSearch : t.membersListEmptyHelp)
                  else ...[
                    Container(
                      decoration: BoxDecoration(border: Border.symmetric(horizontal: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800)))),
                      child: Column(children: [
                        for (var i = 0; i < _users.length; i++) ...[
                          if (i > 0) const Divider(),
                          _UserRow(
                            user: _users[i],
                            isMe: _users[i].id == myId,
                            onEdit: () async {
                              final u = await showEditUserSheet(context, _users[i], isSelf: _users[i].id == myId);
                              if (u != null) _replace(u);
                            },
                            onProjects: () async {
                              final changed = await showUserProjectsSheet(context, _users[i]);
                              if (changed == true) _reload();
                            },
                            onTeams: () => showUserTeamsSheet(context, _users[i]),
                            onResend: () => _resend(_users[i]),
                            onToggleLock: () => _toggleLock(_users[i]),
                          ),
                        ],
                      ]),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: _loading
                          ? LoadingView(label: t.membersListLoadingMore)
                          : _hasMore
                              ? SoftButton(label: t.membersListLoadMore, onPressed: _loadMore)
                              : Text(t.membersListEndOfList, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc400, Tw.zinc500))),
                    ),
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

Widget userRoleBadge(BuildContext context, AppUser u) {
  final t = AppLocalizations.of(context);
  return u.isAdmin
      ? Pill(rounded: false, label: t.accessRoleAdmin, icon: LucideIcons.shieldCheck,
          bg: context.tw(Tw.amber100, Tw.alpha(Tw.amber900, 0.3)), fg: context.tw(Tw.amber700, Tw.amber400))
      : Pill(rounded: false, label: t.accessRoleCustomer,
          bg: context.tw(Tw.blue100, Tw.alpha(Tw.blue900, 0.3)), fg: context.tw(Tw.blue700, Tw.blue400));
}

class _UserRow extends StatelessWidget {
  const _UserRow({
    required this.user,
    required this.isMe,
    required this.onEdit,
    required this.onProjects,
    required this.onTeams,
    required this.onResend,
    required this.onToggleLock,
  });
  final AppUser user;
  final bool isMe;
  final VoidCallback onEdit, onProjects, onTeams, onResend, onToggleLock;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final u = user;
    return Opacity(
      opacity: u.isDisabled ? 0.6 : 1,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          UserAvatar(name: u.name, url: u.avatarUrl, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: Text(u.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500))),
                if (isMe) ...[
                  const SizedBox(width: 6),
                  Pill(rounded: false, label: t.membersListYou,
                      bg: context.tw(Tw.blue100, Tw.alpha(Tw.blue900, 0.3)), fg: context.tw(Tw.blue600, Tw.blue400)),
                ],
              ]),
              Text(u.email, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
              const SizedBox(height: 6),
              Wrap(spacing: 6, runSpacing: 6, children: [
                userRoleBadge(context, u),
                u.isDisabled
                    ? Pill(rounded: false, label: t.accessStatusDisabled, icon: LucideIcons.lock,
                        bg: context.tw(Tw.red100, Tw.alpha(Tw.red900, 0.3)), fg: context.tw(Tw.red700, Tw.red400))
                    : Pill(rounded: false, label: t.accessStatusActive,
                        bg: context.tw(Tw.emerald100, Tw.alpha(Tw.emerald900, 0.3)), fg: context.tw(Tw.emerald700, Tw.emerald400)),
                u.isAdmin
                    ? neutralPill(context, t.membersListTeamCountLabel(u.teamCount ?? 0), icon: LucideIcons.usersRound)
                    : neutralPill(context, t.accessProjectCountLabel(u.projectCount ?? 0), icon: LucideIcons.folderKanban),
              ]),
            ]),
          ),
          PopupMenuButton<String>(
            tooltip: t.accessMoreActions,
            icon: Icon(LucideIcons.ellipsis, size: 18, color: context.tw(Tw.zinc500, Tw.zinc400)),
            onSelected: (v) => switch (v) {
              'edit' => onEdit(),
              'projects' => onProjects(),
              'teams' => onTeams(),
              'resend' => onResend(),
              'lock' => onToggleLock(),
              _ => null,
            },
            itemBuilder: (_) => [
              _item('edit', LucideIcons.userCog, t.membersListActionEdit),
              u.isAdmin
                  ? _item('teams', LucideIcons.usersRound, t.membersListActionManageTeams)
                  : _item('projects', LucideIcons.folderKanban, t.accessActionProjects),
              _item('resend', LucideIcons.mail, t.accessActionResendLink),
              if (!isMe) ...[
                const PopupMenuDivider(),
                _item('lock', u.isDisabled ? LucideIcons.lockOpen : LucideIcons.lock,
                    u.isDisabled ? t.accessActionUnlock : t.accessActionLock,
                    color: u.isDisabled ? null : context.tw(Tw.red600, Tw.red400)),
              ],
            ],
          ),
        ]),
      ),
    );
  }

  PopupMenuItem<String> _item(String v, IconData icon, String label, {Color? color}) => PopupMenuItem(
        value: v,
        height: 40,
        child: Row(children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: TwSize.textXs, color: color)),
        ]),
      );
}

// ============================================================ Sheets

Future<T?> _sheet<T>(BuildContext context, Widget child, {double heightFactor = 0.9}) => showModalBottomSheet<T>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (c) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(c).viewInsets.bottom),
        child: FractionallySizedBox(heightFactor: heightFactor, child: child),
      ),
    );

class _SheetScaffold extends StatelessWidget {
  const _SheetScaffold({required this.title, this.subtitle, required this.children, this.footer});
  final String title;
  final String? subtitle;
  final List<Widget> children;
  final Widget? footer;

  @override
  Widget build(BuildContext context) => Column(children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            children: [
              Text(title, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w600)),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc600, Tw.zinc400))),
              ],
              const SizedBox(height: 16),
              ...children,
            ],
          ),
        ),
        if (footer != null)
          SafeArea(
            top: false,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              decoration: BoxDecoration(border: Border(top: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800)))),
              child: footer,
            ),
          ),
      ]);
}

TextStyle _label(BuildContext c) => TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: c.tw(Tw.zinc700, Tw.zinc300));

/// Chọn dự án bằng checkbox + tìm kiếm (ProjectPicker của web)
class _ProjectPicker extends ConsumerStatefulWidget {
  const _ProjectPicker({required this.selected, required this.onChanged});
  final Set<String> selected;
  final ValueChanged<Set<String>> onChanged;

  @override
  ConsumerState<_ProjectPicker> createState() => _ProjectPickerState();
}

class _ProjectPickerState extends ConsumerState<_ProjectPicker> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(projectsProvider);
    final all = q.value ?? const <Project>[];
    final list = _q.isEmpty ? all : all.where((p) => p.name.toLowerCase().contains(_q.toLowerCase())).toList();
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      TextField(
        onChanged: (v) => setState(() => _q = v.trim()),
        decoration: InputDecoration(
          hintText: t.accessSearchProjects,
          prefixIcon: const Icon(LucideIcons.search, size: 16),
          prefixIconConstraints: const BoxConstraints(minWidth: 36),
        ),
      ),
      const SizedBox(height: 8),
      Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          border: Border.all(color: context.tw(Tw.zinc100, Tw.zinc800)),
        ),
        clipBehavior: Clip.antiAlias,
        child: q.isLoading
            ? const LoadingView()
            : list.isEmpty
                ? EmptyView(title: t.accessNoProjectsAvailable)
                : Column(children: [
                    for (var i = 0; i < list.length; i++) ...[
                      if (i > 0) const Divider(),
                      CheckboxListTile(
                        dense: true,
                        controlAffinity: ListTileControlAffinity.leading,
                        value: widget.selected.contains(list[i].id),
                        onChanged: (v) {
                          final next = {...widget.selected};
                          v == true ? next.add(list[i].id) : next.remove(list[i].id);
                          widget.onChanged(next);
                        },
                        secondary: ClipRRect(
                          borderRadius: BorderRadius.circular(TwSize.radiusMd),
                          child: SizedBox.square(dimension: 28, child: NetImage(url: list[i].thumbnailUrl, iconSize: 14)),
                        ),
                        title: Text(list[i].name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textSm)),
                      ),
                    ],
                  ]),
      ),
      const SizedBox(height: 6),
      Text(t.accessSelectedCount(widget.selected.length), style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
    ]);
  }
}

/// Hiển thị link đặt mật khẩu + trạng thái gửi email (SetupLinkView của web)
class SetupLinkView extends StatelessWidget {
  const SetupLinkView({super.key, required this.email, required this.result});
  final String email;
  final SetupLinkResult result;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final ok = result.emailSent;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ok ? context.tw(const Color(0xFFECFDF5), Tw.alpha(Tw.emerald900, 0.2)) : context.tw(const Color(0xFFFFFBEB), Tw.alpha(Tw.amber900, 0.2)),
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(ok ? LucideIcons.circleCheck : LucideIcons.triangleAlert, size: 16,
              color: ok ? context.tw(Tw.emerald700, Tw.emerald400) : context.tw(Tw.amber700, Tw.amber400)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(ok ? t.accessCreatedEmailSent(email) : t.accessCreatedEmailFailed(email),
                style: TextStyle(fontSize: TwSize.textXs, color: ok ? context.tw(Tw.emerald700, Tw.emerald400) : context.tw(Tw.amber700, Tw.amber400))),
          ),
        ]),
      ),
      const SizedBox(height: 12),
      Text(t.accessSetPasswordLink, style: _label(context)),
      const SizedBox(height: 4),
      SelectableText(result.setPasswordUrl, style: const TextStyle(fontSize: TwSize.textXs, fontFamily: 'monospace')),
      const SizedBox(height: 8),
      Align(
        alignment: Alignment.centerLeft,
        child: SoftButton(
          label: t.accessCopy,
          icon: LucideIcons.copy,
          onPressed: () async {
            await Clipboard.setData(ClipboardData(text: result.setPasswordUrl));
            if (context.mounted) showSnack(context, t.accessCopied);
          },
        ),
      ),
    ]);
  }
}

Future<void> showSetupLinkSheet(BuildContext context, {required String email, required SetupLinkResult result, required String title}) {
  final t = AppLocalizations.of(context);
  return _sheet(
    context,
    Builder(
      builder: (c) => _SheetScaffold(
        title: title,
        subtitle: email,
        footer: SizedBox(width: double.infinity, child: FilledButton(onPressed: () => Navigator.pop(c), child: Text(t.accessDone))),
        children: [SetupLinkView(email: email, result: result)],
      ),
    ),
    heightFactor: 0.6,
  );
}

// ------------------------------------------------------------ Tạo tài khoản

Future<bool?> showCreateAccountSheet(BuildContext context) => _sheet<bool>(context, const _CreateAccountSheet());

class _CreateAccountSheet extends ConsumerStatefulWidget {
  const _CreateAccountSheet();

  @override
  ConsumerState<_CreateAccountSheet> createState() => _CreateAccountSheetState();
}

class _CreateAccountSheetState extends ConsumerState<_CreateAccountSheet> {
  final _email = TextEditingController();
  final _name = TextEditingController();
  SystemRole _role = SystemRole.user;
  Set<String> _projects = {};
  bool _saving = false;
  String? _error;
  SetupLinkResult? _result;

  @override
  void dispose() {
    _email.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _saving) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final res = await ref.read(usersRepoProvider).create(
            email: _email.text.trim(),
            displayName: _name.text.trim().isEmpty ? null : _name.text.trim(),
            role: _role,
            projectIds: _role == SystemRole.user ? _projects.toList() : const [],
          );
      setState(() => _result = res.link);
    } catch (e) {
      setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    if (_result != null) {
      return _SheetScaffold(
        title: t.accessCreatedTitle,
        subtitle: _email.text.trim(),
        footer: SizedBox(width: double.infinity, child: FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(t.accessDone))),
        children: [SetupLinkView(email: _email.text.trim(), result: _result!)],
      );
    }
    Widget roleOption(SystemRole r, String label, String hint) {
      final active = _role == r;
      return Expanded(
        child: GestureDetector(
          onTap: () => setState(() => _role = r),
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: active ? context.tw(Tw.zinc50, Tw.alpha(Tw.zinc800, 0.6)) : null,
              borderRadius: BorderRadius.circular(TwSize.radiusLg),
              border: Border.all(color: active ? context.tw(Tw.zinc900, Tw.zinc100) : context.tw(Tw.zinc200, Tw.zinc700)),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: const TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(hint, style: TextStyle(fontSize: TwSize.text10, color: context.tw(Tw.zinc500, Tw.zinc400))),
            ]),
          ),
        ),
      );
    }

    return _SheetScaffold(
      title: t.accessCreateTitle,
      subtitle: t.accessCreateDesc,
      footer: Row(children: [
        Expanded(child: OutlinedButton(onPressed: _saving ? null : () => Navigator.pop(context), child: Text(t.commonCancel))),
        const SizedBox(width: 8),
        Expanded(child: FilledButton(onPressed: _saving ? null : _submit, child: Text(_saving ? t.accessCreating : t.accessCreateSubmit))),
      ]),
      children: [
        Text('${t.accessEmailLabel} *', style: _label(context)),
        const SizedBox(height: 4),
        TextField(controller: _email, keyboardType: TextInputType.emailAddress, autofocus: true, decoration: InputDecoration(hintText: t.accessEmailPlaceholder)),
        const SizedBox(height: 12),
        Text(t.accessNameLabel, style: _label(context)),
        const SizedBox(height: 4),
        TextField(controller: _name, decoration: InputDecoration(hintText: t.accessNamePlaceholder)),
        const SizedBox(height: 12),
        Text(t.accessRoleLabel, style: _label(context)),
        const SizedBox(height: 6),
        Row(children: [
          roleOption(SystemRole.user, t.accessRoleCustomer, t.accessRoleCustomerHint),
          const SizedBox(width: 8),
          roleOption(SystemRole.admin, t.accessRoleAdmin, t.accessRoleAdminHint),
        ]),
        if (_role == SystemRole.user) ...[
          const SizedBox(height: 12),
          Text(t.accessProjectsLabel, style: _label(context)),
          const SizedBox(height: 2),
          Text(t.accessProjectsHint, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
          const SizedBox(height: 6),
          _ProjectPicker(selected: _projects, onChanged: (s) => setState(() => _projects = s)),
        ],
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
        ],
      ],
    );
  }
}

// ------------------------------------------------------------ Sửa người dùng

Future<AppUser?> showEditUserSheet(BuildContext context, AppUser user, {required bool isSelf}) =>
    _sheet<AppUser>(context, _EditUserSheet(user: user, isSelf: isSelf), heightFactor: 0.6);

class _EditUserSheet extends ConsumerStatefulWidget {
  const _EditUserSheet({required this.user, required this.isSelf});
  final AppUser user;
  final bool isSelf;

  @override
  ConsumerState<_EditUserSheet> createState() => _EditUserSheetState();
}

class _EditUserSheetState extends ConsumerState<_EditUserSheet> {
  late final _name = TextEditingController(text: widget.user.displayName ?? '');
  late SystemRole _role = widget.user.role;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final u = await ref.read(usersRepoProvider).update(widget.user.id, displayName: _name.text, role: _role);
      if (widget.isSelf) ref.invalidate(meProvider);
      if (mounted) Navigator.pop(context, u);
    } catch (e) {
      setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return _SheetScaffold(
      title: t.membersListEditTitle,
      subtitle: widget.user.email,
      footer: Row(children: [
        Expanded(child: OutlinedButton(onPressed: _saving ? null : () => Navigator.pop(context), child: Text(t.commonCancel))),
        const SizedBox(width: 8),
        Expanded(child: FilledButton(onPressed: _saving ? null : _save, child: Text(_saving ? t.commonSaving : t.membersListEditSubmit))),
      ]),
      children: [
        Text(t.membersListEditNameLabel, style: _label(context)),
        const SizedBox(height: 4),
        TextField(controller: _name, decoration: InputDecoration(hintText: t.membersListEditNamePlaceholder)),
        const SizedBox(height: 12),
        Text(t.membersListEditRoleLabel, style: _label(context)),
        const SizedBox(height: 6),
        SegmentedButton<SystemRole>(
          segments: [
            // Không cho admin tự hạ cấp chính mình
            ButtonSegment(value: SystemRole.user, label: Text(t.membersListEditRoleUser), enabled: !widget.isSelf),
            ButtonSegment(value: SystemRole.admin, label: Text(t.membersListEditRoleAdmin)),
          ],
          selected: {_role},
          onSelectionChanged: (s) => setState(() => _role = s.first),
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
        ],
      ],
    );
  }
}

// ------------------------------------------------------------ Dự án của user

Future<bool?> showUserProjectsSheet(BuildContext context, AppUser user) => _sheet<bool>(context, _UserProjectsSheet(user: user));

class _UserProjectsSheet extends ConsumerStatefulWidget {
  const _UserProjectsSheet({required this.user});
  final AppUser user;

  @override
  ConsumerState<_UserProjectsSheet> createState() => _UserProjectsSheetState();
}

class _UserProjectsSheetState extends ConsumerState<_UserProjectsSheet> {
  Set<String>? _selected;
  bool _saving = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(userProjectsProvider(widget.user.id));
    _selected ??= q.value?.map((p) => p.projectId).toSet();

    Future<void> save() async {
      setState(() {
        _saving = true;
        _error = null;
      });
      try {
        await ref.read(usersRepoProvider).setProjects(widget.user.id, _selected!.toList());
        ref.invalidate(userProjectsProvider(widget.user.id));
        ref.invalidate(projectsProvider);
        if (context.mounted) Navigator.pop(context, true);
      } catch (e) {
        setState(() => _error = errorMessage(e));
      } finally {
        if (mounted) setState(() => _saving = false);
      }
    }

    return _SheetScaffold(
      title: t.accessUserProjectsTitle(widget.user.name),
      subtitle: t.accessUserProjectsDesc,
      footer: Row(children: [
        Expanded(child: OutlinedButton(onPressed: _saving ? null : () => Navigator.pop(context), child: Text(t.commonCancel))),
        const SizedBox(width: 8),
        Expanded(
          child: FilledButton(
            onPressed: _saving || _selected == null ? null : save,
            child: Text(_saving ? t.commonSaving : t.accessSaveProjects),
          ),
        ),
      ]),
      children: [
        if (_selected == null)
          q.hasError ? ErrorView(error: q.error!) : const LoadingView()
        else
          _ProjectPicker(selected: _selected!, onChanged: (s) => setState(() => _selected = s)),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
        ],
      ],
    );
  }
}

// ------------------------------------------------------------ Nhóm của user (admin)

Future<void> showUserTeamsSheet(BuildContext context, AppUser user) => _sheet(context, _UserTeamsSheet(user: user));

class _UserTeamsSheet extends ConsumerStatefulWidget {
  const _UserTeamsSheet({required this.user});
  final AppUser user;

  @override
  ConsumerState<_UserTeamsSheet> createState() => _UserTeamsSheetState();
}

class _UserTeamsSheetState extends ConsumerState<_UserTeamsSheet> {
  List<Team> _all = [];
  String? _selectedTeam;
  String _role = 'member';
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    ref.read(teamsRepoProvider).all().then((v) {
      if (mounted) setState(() => _all = v);
    }).catchError((Object e) {
      if (mounted) setState(() => _error = errorMessage(e));
    });
  }

  Future<void> _run(Future<void> Function() f) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await f();
      ref.invalidate(userTeamsProvider(widget.user.id));
      ref.invalidate(teamsProvider);
    } catch (e) {
      setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final repo = ref.read(usersRepoProvider);
    final q = ref.watch(userTeamsProvider(widget.user.id));
    final joined = q.value ?? const <UserTeam>[];
    final joinedIds = joined.map((x) => x.teamId).toSet();
    final candidates = _all.where((x) => !joinedIds.contains(x.id)).toList();

    String roleText(UserTeam x) => x.isOwner
        ? t.membersListTeamsOwnerBadge
        : x.role == 'admin'
            ? t.membersListTeamsRoleAdmin
            : t.membersListTeamsRoleMember;

    return _SheetScaffold(
      title: t.membersListTeamsTitle(widget.user.name),
      subtitle: t.membersListTeamsDesc,
      children: [
        if (_error != null) ...[
          Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
          const SizedBox(height: 8),
        ],
        Text(t.membersListTeamsAddTitle, style: _label(context)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          initialValue: _selectedTeam,
          isExpanded: true,
          hint: Text(t.membersListTeamsSelectTeamPlaceholder),
          items: [for (final x in candidates) DropdownMenuItem(value: x.id, child: Text(x.name, overflow: TextOverflow.ellipsis))],
          onChanged: (v) => setState(() => _selectedTeam = v),
        ),
        const SizedBox(height: 8),
        Row(children: [
          SegmentedButton<String>(
            segments: [
              ButtonSegment(value: 'member', label: Text(t.membersListTeamsAddRoleMember)),
              ButtonSegment(value: 'admin', label: Text(t.membersListTeamsAddRoleAdmin)),
            ],
            selected: {_role},
            onSelectionChanged: (s) => setState(() => _role = s.first),
          ),
          const Spacer(),
          FilledButton(
            onPressed: _busy || _selectedTeam == null
                ? null
                : () => _run(() async {
                      await repo.addToTeam(widget.user.id, _selectedTeam!, role: _role);
                      setState(() => _selectedTeam = null);
                    }),
            child: Text(_busy ? t.membersListTeamsAdding : t.membersListTeamsAddSubmit, style: const TextStyle(fontSize: TwSize.textXs)),
          ),
        ]),
        const SizedBox(height: 16),
        Text(t.membersListTeamCountLabel(joined.length), style: _label(context)),
        const SizedBox(height: 6),
        if (q.isLoading)
          LoadingView(label: t.membersListTeamsLoading)
        else if (joined.isEmpty)
          EmptyView(title: t.membersListTeamsEmpty)
        else
          for (final x in joined)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(TwSize.radiusMd),
                child: SizedBox.square(dimension: 28, child: NetImage(url: x.avatarUrl, iconSize: 14)),
              ),
              title: Text(x.name, style: const TextStyle(fontSize: TwSize.textSm)),
              subtitle: Text(roleText(x), style: const TextStyle(fontSize: TwSize.text11)),
              trailing: IconButton(
                tooltip: t.membersListTeamsRemove,
                onPressed: x.isOwner || _busy ? null : () => _run(() => repo.removeFromTeam(widget.user.id, x.teamId)),
                icon: const Icon(LucideIcons.trash2, size: 16),
              ),
            ),
      ],
    );
  }
}
