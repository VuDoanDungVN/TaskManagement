import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/router.dart';
import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/common.dart';
import 'teams_screen.dart';

/// Chi tiết nhóm (admin) — team-detail.tsx: thông tin, thành viên (đổi vai trò / xoá / rời nhóm),
/// lời mời (gửi / huỷ), dự án của nhóm (thêm / gỡ). Quyền theo vai trò trong nhóm như server.
class TeamDetailScreen extends ConsumerStatefulWidget {
  const TeamDetailScreen({super.key, required this.teamId});
  final String teamId;

  @override
  ConsumerState<TeamDetailScreen> createState() => _TeamDetailScreenState();
}

class _TeamDetailScreenState extends ConsumerState<TeamDetailScreen> {
  final _inviteCtrl = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _inviteCtrl.dispose();
    super.dispose();
  }

  String get _id => widget.teamId;

  /// Chạy thao tác + làm mới dữ liệu liên quan qua [after] (gọi ref.invalidate).
  Future<void> _run(Future<void> Function() f, {void Function()? after}) async {
    setState(() => _busy = true);
    try {
      await f();
      after?.call();
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final teamQ = ref.watch(teamProvider(_id));
    final team = teamQ.value;
    final repo = ref.read(teamsRepoProvider);
    final myId = ref.watch(uidProvider);

    if (team == null) {
      return Scaffold(
        appBar: AppBar(),
        body: teamQ.isLoading ? LoadingView(label: t.teamDetailLoading) : ErrorView(error: teamQ.error ?? t.teamDetailNotFound),
      );
    }
    final manage = team.canManage;
    final members = ref.watch(teamMembersProvider(_id));
    final projects = ref.watch(teamProjectsProvider(_id));
    final invites = manage ? ref.watch(teamInvitesProvider(_id)) : null;
    final h = const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w600);

    String roleText(String r) => switch (r) {
          'owner' => t.teamDetailRoleOwner,
          'admin' => t.teamDetailRoleAdmin,
          _ => t.teamDetailRoleMember,
        };

    return Scaffold(
      appBar: AppBar(
        title: Text(team.name, overflow: TextOverflow.ellipsis),
        actions: [
          if (manage) IconButton(tooltip: t.commonEdit, icon: const Icon(LucideIcons.pencil, size: 18), onPressed: () => showTeamFormSheet(context, initial: team)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(teamProvider(_id));
          ref.invalidate(teamMembersProvider(_id));
          ref.invalidate(teamProjectsProvider(_id));
          if (manage) ref.invalidate(teamInvitesProvider(_id));
          await ref.read(teamProvider(_id).future);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            AppCard(
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                ClipRRect(borderRadius: BorderRadius.circular(TwSize.radiusXl), child: SizedBox.square(dimension: 56, child: NetImage(url: team.avatarUrl))),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(team.name, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w700)),
                    if (team.description?.isNotEmpty ?? false)
                      Text(team.description!, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
                    const SizedBox(height: 8),
                    Wrap(spacing: 6, runSpacing: 6, children: [
                      neutralPill(context, team.visibility == 'public' ? t.teamDetailVisibilityPublic : t.teamDetailVisibilityPrivate,
                          icon: team.visibility == 'public' ? LucideIcons.globe : LucideIcons.lock),
                      neutralPill(context, t.teamDetailMembersCount(team.memberCount), icon: LucideIcons.users),
                      if (team.myRole != null) neutralPill(context, teamRoleLabel(t, team.myRole)),
                    ]),
                  ]),
                ),
              ]),
            ),
            const SizedBox(height: 16),

            // ---------------- Thành viên
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                SectionHeader(icon: LucideIcons.users, title: t.teamDetailMembersTitle, subtitle: '${members.value?.length ?? 0}'),
                if (members.isLoading)
                  const LoadingView()
                else
                  for (final m in members.value ?? const <TeamMember>[])
                    ListTile(
                      leading: UserAvatar(name: m.name, url: m.avatarUrl, size: 32),
                      title: Row(children: [
                        Flexible(child: Text(m.name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textSm))),
                        if (m.userId == myId) ...[const SizedBox(width: 6), neutralPill(context, t.teamDetailYou)],
                      ]),
                      subtitle: Text(roleText(m.role), style: const TextStyle(fontSize: TwSize.text11)),
                      trailing: _memberMenu(t, team, m, myId, repo),
                    ),
              ]),
            ),
            const SizedBox(height: 16),

            // ---------------- Lời mời (owner/admin nhóm)
            if (manage) ...[
              AppCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Text(t.teamDetailInviteTitle, style: h),
                  const SizedBox(height: 8),
                  TextField(controller: _inviteCtrl, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(hintText: t.teamDetailInvitePlaceholder)),
                  const SizedBox(height: 4),
                  Text(t.teamDetailInviteHint, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: FilledButton(
                      onPressed: _busy
                          ? null
                          : () {
                              final emails = _inviteCtrl.text.split(RegExp(r'[,\s]+')).map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
                              if (emails.isEmpty) return;
                              if (emails.any((e) => !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(e))) {
                                showSnack(context, t.teamDetailInviteInvalid, error: true);
                                return;
                              }
                              _run(() async {
                                await repo.invite(_id, emails);
                                _inviteCtrl.clear();
                              }, after: () { ref.invalidate(teamInvitesProvider(_id)); });
                            },
                      child: Text(_busy ? t.teamDetailInviteSending : t.teamDetailInviteSubmit, style: const TextStyle(fontSize: TwSize.textXs)),
                    ),
                  ),
                  const Divider(height: 24),
                  Text(t.teamDetailPendingTitle, style: h),
                  const SizedBox(height: 4),
                  if (invites!.isLoading)
                    const LoadingView()
                  else if ((invites.value ?? const []).where((i) => i.status == 'pending').isEmpty)
                    EmptyView(title: t.teamDetailPendingEmpty)
                  else
                    for (final inv in invites.value!.where((i) => i.status == 'pending'))
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(LucideIcons.mail, size: 18),
                        title: Text(inv.email, style: const TextStyle(fontSize: TwSize.textSm)),
                        subtitle: Text('${t.teamDetailStatusPending} · ${roleText(inv.role)}', style: const TextStyle(fontSize: TwSize.text11)),
                        trailing: TextButton(
                          onPressed: _busy ? null : () => _run(() => repo.cancelInvite(_id, inv.id), after: () { ref.invalidate(teamInvitesProvider(_id)); }),
                          child: Text(t.teamDetailCancelInvite),
                        ),
                      ),
                ]),
              ),
              const SizedBox(height: 16),
            ],

            // ---------------- Dự án của nhóm
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                SectionHeader(
                  icon: LucideIcons.folderKanban,
                  title: t.teamDetailProjectsTitle,
                  trailing: manage
                      ? SoftButton(label: t.teamDetailAddProject, icon: LucideIcons.plus, onPressed: () => _addProject(context, projects.value ?? const []))
                      : null,
                ),
                if (projects.isLoading)
                  const LoadingView()
                else if ((projects.value ?? const []).isEmpty)
                  EmptyView(title: t.teamDetailProjectsEmpty)
                else
                  for (final p in projects.value!)
                    ListTile(
                      onTap: () => GoRouter.of(context).go(projectPath(p.id)),
                      leading: ClipRRect(borderRadius: BorderRadius.circular(TwSize.radiusMd), child: SizedBox.square(dimension: 32, child: NetImage(url: p.thumbnailUrl, iconSize: 14))),
                      title: Text(p.name, style: const TextStyle(fontSize: TwSize.textSm)),
                      trailing: manage
                          ? TextButton(
                              onPressed: _busy
                                  ? null
                                  : () async {
                                      if (!await confirmDialog(context, t.teamDetailRemoveProjectConfirm, confirmLabel: t.teamDetailRemoveProject)) return;
                                      _run(() => repo.unassignProject(_id, p.id), after: () { ref.invalidate(teamProjectsProvider(_id)); ref.invalidate(projectsProvider); });
                                    },
                              child: Text(t.teamDetailRemoveProject),
                            )
                          : null,
                    ),
              ]),
            ),
          ],
        ),
      ),
    );
  }

  Widget? _memberMenu(AppLocalizations t, Team team, TeamMember m, String? myId, TeamsRepo repo) {
    final isMe = m.userId == myId;
    final options = <PopupMenuEntry<String>>[];
    if (team.canManage && !isMe && m.role != 'owner') {
      options.add(PopupMenuItem(
        value: m.role == 'admin' ? 'member' : 'admin',
        child: Text(m.role == 'admin' ? t.teamDetailMakeMember : t.teamDetailMakeAdmin, style: const TextStyle(fontSize: TwSize.textXs)),
      ));
      options.add(PopupMenuItem(value: 'remove', child: Text(t.teamDetailRemoveMember, style: const TextStyle(fontSize: TwSize.textXs, color: Tw.red600))));
    }
    if (isMe && m.role != 'owner') {
      options.add(PopupMenuItem(value: 'leave', child: Text(t.teamDetailLeaveTeam, style: const TextStyle(fontSize: TwSize.textXs, color: Tw.red600))));
    }
    if (options.isEmpty) return null;
    void inv() {
      ref.invalidate(teamMembersProvider(_id));
      ref.invalidate(teamProvider(_id));
      ref.invalidate(teamsProvider);
    }

    return PopupMenuButton<String>(
      icon: const Icon(LucideIcons.ellipsis, size: 18),
      itemBuilder: (_) => options,
      onSelected: (v) async {
        switch (v) {
          case 'admin' || 'member':
            _run(() => repo.setMemberRole(_id, m.userId, v), after: inv);
          case 'remove':
            if (await confirmDialog(context, t.teamDetailRemoveConfirm)) _run(() => repo.removeMember(_id, m.userId), after: inv);
          case 'leave':
            if (await confirmDialog(context, t.teamDetailLeaveConfirm, confirmLabel: t.teamDetailLeaveTeam)) {
              await _run(() => repo.removeMember(_id, m.userId), after: () { ref.invalidate(teamsProvider); });
              if (mounted) GoRouter.of(context).go('/teams');
            }
        }
      },
    );
  }

  Future<void> _addProject(BuildContext context, List<TeamProject> current) async {
    final t = AppLocalizations.of(context);
    final all = await ref.read(projectsProvider.future);
    final ids = current.map((p) => p.id).toSet();
    final candidates = all.where((p) => !ids.contains(p.id)).toList();
    if (!context.mounted) return;
    final picked = await showModalBottomSheet<String>(
      context: context,
      useRootNavigator: true,
      builder: (c) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t.teamDetailAddProjectTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w600)),
              Text(t.teamDetailAddProjectDesc, style: TextStyle(fontSize: TwSize.textSm, color: c.tw(Tw.zinc600, Tw.zinc400))),
            ]),
          ),
          if (candidates.isEmpty)
            EmptyView(title: t.teamDetailAddProjectEmpty)
          else
            Flexible(
              child: ListView(shrinkWrap: true, children: [
                for (final p in candidates)
                  ListTile(
                    leading: ClipRRect(borderRadius: BorderRadius.circular(TwSize.radiusMd), child: SizedBox.square(dimension: 32, child: NetImage(url: p.thumbnailUrl, iconSize: 14))),
                    title: Text(p.name, style: const TextStyle(fontSize: TwSize.textSm)),
                    onTap: () => Navigator.pop(c, p.id),
                  ),
              ]),
            ),
        ]),
      ),
    );
    if (picked == null) return;
    await _run(() => ref.read(teamsRepoProvider).assignProject(_id, picked), after: () { ref.invalidate(teamProjectsProvider(_id)); ref.invalidate(projectsProvider); });
  }
}
