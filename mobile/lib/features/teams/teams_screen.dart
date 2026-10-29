import 'package:flutter/material.dart';
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
import '../shell/app_shell.dart';

String teamRoleLabel(AppLocalizations t, String? role) => switch (role) {
      'owner' => t.teamsListCardRoleOwner,
      'admin' => t.teamsListCardRoleAdmin,
      _ => t.teamsListCardRoleMember,
    };

/// Danh sách nhóm (admin) — team-list.tsx: thẻ nhóm, tạo nhóm, xoá (chủ nhóm, gõ XOA để xác nhận).
class TeamsScreen extends ConsumerWidget {
  const TeamsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final meQ = ref.watch(meProvider);
    if (meQ.isLoading) return Scaffold(appBar: TabAppBar(title: t.navTeamList), body: const LoadingView());
    if (!ref.watch(isAdminProvider)) {
      return Scaffold(appBar: TabAppBar(title: t.navTeamList), body: NoPermissionView(onBack: () => GoRouter.of(context).go('/dashboard')));
    }

    final q = ref.watch(teamsProvider);
    final teams = q.value ?? const <Team>[];
    Future<void> refresh() async {
      ref.invalidate(teamsProvider);
      await ref.read(teamsProvider.future);
    }

    return Scaffold(
      appBar: TabAppBar(title: t.navTeamList),
      body: RefreshIndicator(
        onRefresh: refresh,
        child: ListView(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + navBarClearance(context)),
          children: [
            AppCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Row(children: [
                  Icon(LucideIcons.usersRound, size: 16, color: context.tw(Tw.zinc900, Tw.zinc50)),
                  const SizedBox(width: 8),
                  Expanded(child: Text(t.teamsListTitle, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w700))),
                  Text(t.teamsListCountLabel(teams.length), style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
                ]),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => showTeamFormSheet(context),
                  icon: const Icon(LucideIcons.plus, size: 14),
                  label: Text(t.navCreateTeam, style: const TextStyle(fontSize: TwSize.textXs)),
                ),
                const SizedBox(height: 16),
                if (q.isLoading)
                  LoadingView(label: t.teamsListLoading)
                else if (q.hasError)
                  ErrorView(error: q.error!, onRetry: refresh)
                else if (teams.isEmpty)
                  EmptyView(title: t.teamsListEmptyTitle)
                else
                  for (final team in teams) ...[_TeamCard(team: team), const SizedBox(height: 12)],
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class _TeamCard extends ConsumerWidget {
  const _TeamCard({required this.team});
  final Team team;

  Future<void> _delete(BuildContext context, WidgetRef ref) async {
    final t = AppLocalizations.of(context);
    final word = t.teamsListDeleteConfirmWord;
    final ctrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => StatefulBuilder(
        builder: (c, set) => AlertDialog(
          title: Text(t.teamsListDeleteTitle, style: const TextStyle(fontSize: TwSize.textBase)),
          content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t.teamsListDeleteMessage(team.name), style: const TextStyle(fontSize: TwSize.textSm)),
            const SizedBox(height: 12),
            Text(t.teamsListDeleteConfirmPrompt(word), style: const TextStyle(fontSize: TwSize.textXs)),
            const SizedBox(height: 6),
            TextField(controller: ctrl, onChanged: (_) => set(() {}), decoration: InputDecoration(hintText: t.teamsListDeletePlaceholder(word))),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(c, false), child: Text(t.commonCancel)),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Tw.red600, foregroundColor: Tw.white),
              onPressed: ctrl.text.trim() == word ? () => Navigator.pop(c, true) : null,
              child: Text(t.teamsListDeleteSubmit),
            ),
          ],
        ),
      ),
    );
    ctrl.dispose();
    if (ok != true) return;
    try {
      await ref.read(teamsRepoProvider).remove(team.id);
      ref.invalidate(teamsProvider);
      ref.invalidate(projectsProvider);
    } catch (e) {
      if (context.mounted) showSnack(context, '${t.teamsListDeleteError} ${errorMessage(e)}', error: true);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return AppCard(
      padding: const EdgeInsets.all(12),
      onTap: () => GoRouter.of(context).go('/teams/${team.id}'),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(TwSize.radiusLg),
          child: SizedBox.square(dimension: 48, child: NetImage(url: team.avatarUrl)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(team.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: TwSize.textSm, fontWeight: FontWeight.w600)),
            if (team.description?.isNotEmpty ?? false)
              Text(team.description!, maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc600, Tw.zinc400))),
            const SizedBox(height: 8),
            Wrap(spacing: 6, runSpacing: 6, children: [
              neutralPill(context, t.teamsListCardMembersCount(team.memberCount), icon: LucideIcons.users),
              neutralPill(context, team.visibility == 'public' ? t.teamsListCardVisibilityPublic : t.teamsListCardVisibilityPrivate,
                  icon: team.visibility == 'public' ? LucideIcons.globe : LucideIcons.lock),
              if (team.myRole != null) neutralPill(context, teamRoleLabel(t, team.myRole)),
            ]),
          ]),
        ),
        if (team.myRole == 'owner')
          IconButton(
            tooltip: t.teamsListDeleteAria,
            onPressed: () => _delete(context, ref),
            icon: Icon(LucideIcons.trash2, size: 16, color: context.tw(Tw.zinc400, Tw.zinc500)),
          ),
      ]),
    );
  }
}

/// Tạo / sửa nhóm — TeamDialog của web (tên, mô tả, quyền riêng tư; tạo mới có thể mời email).
Future<void> showTeamFormSheet(BuildContext context, {Team? initial}) => showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      builder: (c) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(c).viewInsets.bottom),
        child: _TeamFormSheet(initial: initial),
      ),
    );

class _TeamFormSheet extends ConsumerStatefulWidget {
  const _TeamFormSheet({this.initial});
  final Team? initial;

  @override
  ConsumerState<_TeamFormSheet> createState() => _TeamFormSheetState();
}

class _TeamFormSheetState extends ConsumerState<_TeamFormSheet> {
  late final _name = TextEditingController(text: widget.initial?.name ?? '');
  late final _desc = TextEditingController(text: widget.initial?.description ?? '');
  final _invites = TextEditingController();
  late String _visibility = widget.initial?.visibility ?? 'private';
  bool _saving = false;
  bool _touched = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _desc.dispose();
    _invites.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    setState(() => _touched = true);
    if (_name.text.trim().isEmpty) return;
    final emails = _invites.text.split(RegExp(r'[,\s]+')).map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    if (emails.any((e) => !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(e))) {
      setState(() => _error = t.teamDialogInviteInvalid);
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    final repo = ref.read(teamsRepoProvider);
    final desc = _desc.text.trim().isEmpty ? null : _desc.text.trim();
    try {
      if (widget.initial == null) {
        final team = await repo.create(name: _name.text.trim(), description: desc, visibility: _visibility);
        if (emails.isNotEmpty) await repo.invite(team.id, emails).catchError((_) {});
      } else {
        await repo.update(widget.initial!.id, name: _name.text.trim(), description: desc, visibility: _visibility);
        ref.invalidate(teamProvider(widget.initial!.id));
      }
      ref.invalidate(teamsProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = '${t.teamDialogCreateError} ${errorMessage(e)}');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final label = TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300));
    Widget vis(String v, String title, String hint, IconData icon) {
      final active = _visibility == v;
      return GestureDetector(
        onTap: () => setState(() => _visibility = v),
        child: Container(
          margin: const EdgeInsets.only(top: 6),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(TwSize.radiusLg),
            border: Border.all(color: active ? context.tw(Tw.zinc900, Tw.zinc100) : context.tw(Tw.zinc200, Tw.zinc700)),
            color: active ? context.tw(Tw.zinc50, Tw.alpha(Tw.zinc800, 0.6)) : null,
          ),
          child: Row(children: [
            Icon(icon, size: 16),
            const SizedBox(width: 10),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: const TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w600)),
                Text(hint, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
              ]),
            ),
            if (active) const Icon(LucideIcons.check, size: 16),
          ]),
        ),
      );
    }

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(widget.initial == null ? t.teamDialogCreateTitle : t.commonEdit, style: const TextStyle(fontSize: TwSize.textLg, fontWeight: FontWeight.w600)),
          if (widget.initial == null) ...[
            const SizedBox(height: 4),
            Text(t.teamDialogCreateDesc, style: TextStyle(fontSize: TwSize.textSm, color: context.tw(Tw.zinc600, Tw.zinc400))),
          ],
          const SizedBox(height: 16),
          Text('${t.teamDialogNameLabel} *', style: label),
          const SizedBox(height: 4),
          TextField(
            controller: _name,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: t.teamDialogNamePlaceholder,
              errorText: _touched && _name.text.trim().isEmpty ? t.teamDialogNameRequired : null,
            ),
          ),
          const SizedBox(height: 12),
          Text(t.teamDialogDescriptionLabel, style: label),
          const SizedBox(height: 4),
          TextField(controller: _desc, maxLines: 3, decoration: InputDecoration(hintText: t.teamDialogDescriptionPlaceholder)),
          const SizedBox(height: 12),
          Text(t.teamDialogVisibilityLabel, style: label),
          vis('private', t.teamDialogVisibilityPrivate, t.teamDialogVisibilityPrivateHint, LucideIcons.lock),
          vis('public', t.teamDialogVisibilityPublic, t.teamDialogVisibilityPublicHint, LucideIcons.globe),
          if (widget.initial == null) ...[
            const SizedBox(height: 12),
            Text(t.teamDialogInviteLabel, style: label),
            const SizedBox(height: 4),
            TextField(controller: _invites, keyboardType: TextInputType.emailAddress, decoration: InputDecoration(hintText: t.teamDialogInvitePlaceholder)),
            const SizedBox(height: 4),
            Text(t.teamDialogInviteHint, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
          ],
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.red600, Tw.red400))),
          ],
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: OutlinedButton(onPressed: _saving ? null : () => Navigator.pop(context), child: Text(t.commonCancel))),
            const SizedBox(width: 8),
            Expanded(
              child: FilledButton(
                onPressed: _saving ? null : _submit,
                child: Text(_saving ? t.teamDialogCreating : (widget.initial == null ? t.teamDialogSubmit : t.commonSave)),
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}
