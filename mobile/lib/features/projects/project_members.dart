import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/common.dart';

const _avatarLimit = 5;

Widget roleBadge(BuildContext context, SystemRole role) {
  final t = AppLocalizations.of(context);
  final admin = role == SystemRole.admin;
  return Pill(
    rounded: false,
    label: admin ? t.accessRoleAdmin : t.accessRoleCustomer,
    icon: admin ? LucideIcons.shieldCheck : null,
    bg: admin ? context.tw(Tw.amber100, Tw.alpha(Tw.amber900, 0.3)) : context.tw(Tw.zinc100, Tw.zinc800),
    fg: admin ? context.tw(Tw.amber700, Tw.amber400) : context.tw(Tw.zinc600, Tw.zinc300),
  );
}

/// Khung "Thành viên dự án" bản mobile (project-members.tsx): tiêu đề + nút ⚙ (admin),
/// hàng avatar xếp chồng + "N thành viên", bấm để mở danh sách dọc (hiệu ứng trượt).
class ProjectMembersCard extends ConsumerStatefulWidget {
  const ProjectMembersCard({super.key, required this.projectId});
  final String projectId;

  @override
  ConsumerState<ProjectMembersCard> createState() => _ProjectMembersCardState();
}

class _ProjectMembersCardState extends ConsumerState<ProjectMembersCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final q = ref.watch(projectMembersProvider(widget.projectId));
    final members = q.value ?? const <ProjectMember>[];
    final isAdmin = ref.watch(isAdminProvider);

    return AppCard(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(children: [
            Icon(LucideIcons.users, size: 16, color: context.tw(Tw.zinc700, Tw.zinc300)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(t.accessProjectMembers, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w600)),
            ),
            if (isAdmin)
              SizedBox.square(
                dimension: 32,
                child: IconButton.filledTonal(
                  tooltip: t.accessManageMembers,
                  padding: EdgeInsets.zero,
                  style: IconButton.styleFrom(
                    backgroundColor: context.tw(Tw.zinc100, Tw.zinc800),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(TwSize.radiusLg)),
                  ),
                  onPressed: () => showManageMembersSheet(context, widget.projectId),
                  icon: Icon(LucideIcons.settings2, size: 16, color: context.tw(Tw.zinc900, Tw.zinc100)),
                ),
              ),
          ]),
          const SizedBox(height: 8),
          if (q.isLoading)
            const Align(alignment: Alignment.centerLeft, child: SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2)))
          else if (members.isEmpty)
            Text(t.accessNoMembers, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc500, Tw.zinc400)))
          else ...[
            InkWell(
              onTap: () => setState(() => _expanded = !_expanded),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(children: [
                  SizedBox(
                    height: 28,
                    width: 28 + 20.0 * ((members.length > _avatarLimit ? _avatarLimit + 1 : members.length) - 1),
                    child: Stack(children: [
                      for (var i = 0; i < members.length && i < _avatarLimit; i++)
                        Positioned(left: 20.0 * i, child: UserAvatar(name: members[i].name, url: members[i].avatarUrl, size: 28, ring: true)),
                      if (members.length > _avatarLimit)
                        Positioned(
                          left: 20.0 * _avatarLimit,
                          child: Container(
                            width: 28,
                            height: 28,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: context.tw(Tw.zinc200, Tw.zinc700),
                              border: Border.all(color: context.tw(Tw.white, Tw.darkBg), width: 2),
                            ),
                            child: Text('+${members.length - _avatarLimit}',
                                style: TextStyle(fontSize: TwSize.text10, fontWeight: FontWeight.w600, color: context.tw(Tw.zinc700, Tw.zinc200))),
                          ),
                        ),
                    ]),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(t.accessProjectMembersCount(members.length),
                        style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
                  ),
                  AnimatedRotation(
                    turns: _expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(LucideIcons.chevronDown, size: 16, color: context.tw(Tw.zinc400, Tw.zinc500)),
                  ),
                ]),
              ),
            ),
            Collapse(
              open: _expanded,
              child: Container(
                margin: const EdgeInsets.only(top: 8),
                decoration: BoxDecoration(border: Border(top: BorderSide(color: context.tw(Tw.zinc100, Tw.zinc800)))),
                child: Column(children: [
                  for (var i = 0; i < members.length; i++) ...[
                    if (i > 0) const Divider(),
                    _MemberRow(member: members[i]),
                  ],
                ]),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MemberRow extends StatelessWidget {
  const _MemberRow({required this.member, this.trailing});
  final ProjectMember member;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(children: [
          UserAvatar(name: member.name, url: member.avatarUrl, size: 30),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(member.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w500)),
              if (member.displayName?.isNotEmpty ?? false)
                Text(member.email, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
            ]),
          ),
          roleBadge(context, member.role),
          ?trailing,
        ]),
      );
}

/// Quản lý thành viên dự án (admin) — ProjectMembersDialog của web.
Future<void> showManageMembersSheet(BuildContext context, String projectId) => showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (_) => FractionallySizedBox(heightFactor: 0.9, child: _ManageMembersSheet(projectId: projectId)),
    );

class _ManageMembersSheet extends ConsumerStatefulWidget {
  const _ManageMembersSheet({required this.projectId});
  final String projectId;

  @override
  ConsumerState<_ManageMembersSheet> createState() => _ManageMembersSheetState();
}

class _ManageMembersSheetState extends ConsumerState<_ManageMembersSheet> {
  Timer? _debounce;
  String _search = '';
  List<AppUser> _candidates = [];
  bool _loading = true;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final page = await ref.read(usersRepoProvider).list(limit: 20, search: _search.trim());
      if (mounted) setState(() => _candidates = page.items);
    } catch (e) {
      if (mounted) setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _run(Future<void> Function() action) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await action();
      ref.invalidate(projectMembersProvider(widget.projectId));
    } catch (e) {
      setState(() => _error = errorMessage(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final repo = ref.read(projectsRepoProvider);
    final members = ref.watch(projectMembersProvider(widget.projectId)).value ?? const <ProjectMember>[];
    final memberIds = members.map((m) => m.id).toSet();
    final candidates = _candidates.where((u) => !memberIds.contains(u.id) && !u.isDisabled).toList();
    final h = TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w600, color: context.tw(Tw.zinc700, Tw.zinc300));

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        children: [
          Text(t.accessMembersDialogTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(t.accessMembersDialogDesc, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc600, Tw.zinc400))),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
          ],
          const SizedBox(height: 16),
          Text(t.accessAddMemberTitle, style: h),
          const SizedBox(height: 6),
          TextField(
            decoration: InputDecoration(
              hintText: t.accessSearchUsers,
              prefixIcon: const Icon(LucideIcons.search, size: 16),
              prefixIconConstraints: const BoxConstraints(minWidth: 36),
            ),
            onChanged: (v) {
              _search = v;
              _debounce?.cancel();
              _debounce = Timer(const Duration(milliseconds: 300), _load);
            },
          ),
          const SizedBox(height: 8),
          _Bordered(
            child: _loading
                ? const LoadingView()
                : candidates.isEmpty
                    ? EmptyView(title: t.accessNoCandidates)
                    : Column(children: [
                        for (var i = 0; i < candidates.length; i++) ...[
                          if (i > 0) const Divider(),
                          _UserLine(
                            name: candidates[i].name,
                            email: candidates[i].email,
                            avatarUrl: candidates[i].avatarUrl,
                            action: IconButton.filled(
                              tooltip: t.accessAddMemberTitle,
                              iconSize: 14,
                              constraints: const BoxConstraints.tightFor(width: 28, height: 28),
                              padding: EdgeInsets.zero,
                              onPressed: _busy ? null : () => _run(() => repo.addMember(widget.projectId, candidates[i].id)),
                              icon: const Icon(LucideIcons.plus),
                            ),
                          ),
                        ],
                      ]),
          ),
          const SizedBox(height: 16),
          Text(t.accessProjectMembersCount(members.length), style: h),
          const SizedBox(height: 6),
          _Bordered(
            child: members.isEmpty
                ? EmptyView(title: t.accessNoMembers)
                : Column(children: [
                    for (var i = 0; i < members.length; i++) ...[
                      if (i > 0) const Divider(),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: _MemberRow(
                          member: members[i],
                          trailing: IconButton(
                            tooltip: t.accessRemoveMember,
                            onPressed: _busy ? null : () => _run(() => repo.removeMember(widget.projectId, members[i].id)),
                            icon: Icon(LucideIcons.trash2, size: 14, color: context.tw(Tw.zinc400, Tw.zinc500)),
                          ),
                        ),
                      ),
                    ],
                  ]),
          ),
        ],
      ),
    );
  }
}

class _Bordered extends StatelessWidget {
  const _Bordered({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          border: Border.all(color: context.tw(Tw.zinc100, Tw.zinc800)),
        ),
        clipBehavior: Clip.antiAlias,
        child: child,
      );
}

class _UserLine extends StatelessWidget {
  const _UserLine({required this.name, required this.email, required this.avatarUrl, required this.action});
  final String name;
  final String email;
  final String? avatarUrl;
  final Widget action;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(children: [
          UserAvatar(name: name, url: avatarUrl, size: 28),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textSm)),
              Text(email, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
            ]),
          ),
          action,
        ]),
      );
}
