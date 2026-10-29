import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models.dart';
import '../../data/repositories.dart';

// ---------------------------------------------------------------- Auth

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);

/// idTokenChanges: phát cả khi đăng nhập/đăng xuất lẫn khi token làm mới.
final authUserProvider = StreamProvider<User?>((ref) => ref.watch(firebaseAuthProvider).idTokenChanges());

/// UID hiện tại. Mọi provider dữ liệu đều `watch` cái này → đổi tài khoản là toàn bộ
/// cache được tạo lại (tránh khách thấy dữ liệu đã cache của người trước — lỗi từng gặp ở web).
final uidProvider = Provider<String?>((ref) => ref.watch(authUserProvider).value?.uid);

final meProvider = FutureProvider<AppUser?>((ref) async {
  final uid = ref.watch(uidProvider);
  if (uid == null) return null;
  return ref.watch(usersRepoProvider).me();
});

final isAdminProvider = Provider<bool>((ref) => ref.watch(meProvider).value?.isAdmin ?? false);

/// Tên dùng làm "người phụ trách" mặc định (giống web: displayName || email).
final myNameProvider = Provider<String>((ref) => ref.watch(meProvider).value?.name ?? '');

// ---------------------------------------------------------------- Projects / Tasks

final projectsProvider = FutureProvider<List<Project>>((ref) async {
  ref.watch(uidProvider);
  return ref.watch(projectsRepoProvider).list();
});

final projectProvider = FutureProvider.autoDispose.family<Project, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(projectsRepoProvider).get(id);
});

final projectMembersProvider = FutureProvider.autoDispose.family<List<ProjectMember>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(projectsRepoProvider).members(id);
});

final allTasksProvider = FutureProvider<List<Task>>((ref) async {
  ref.watch(uidProvider);
  return ref.watch(tasksRepoProvider).listAll();
});

final projectTasksProvider = FutureProvider.autoDispose.family<List<Task>, String>((ref, projectId) async {
  ref.watch(uidProvider);
  return ref.watch(tasksRepoProvider).listByProject(projectId);
});

final taskProvider = FutureProvider.autoDispose.family<Task, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(tasksRepoProvider).get(id);
});

final taskImagesProvider = FutureProvider.autoDispose.family<List<TaskImage>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(tasksRepoProvider).images(id);
});

final commentsProvider = FutureProvider.autoDispose.family<List<Comment>, String>((ref, taskId) async {
  ref.watch(uidProvider);
  return ref.watch(commentsRepoProvider).listByTask(taskId);
});

/// Làm mới mọi dữ liệu liên quan tới 1 task sau khi tạo/sửa/xoá (giống invalidateQueries của web).
void invalidateTask(WidgetRef ref, {required String projectId, String? taskId}) {
  ref.invalidate(projectTasksProvider(projectId));
  ref.invalidate(allTasksProvider);
  ref.invalidate(projectsProvider); // stats của dự án
  if (taskId != null) {
    ref.invalidate(taskProvider(taskId));
    ref.invalidate(taskImagesProvider(taskId));
  }
}

// ---------------------------------------------------------------- Admin: users / teams

final userProjectsProvider = FutureProvider.autoDispose.family<List<UserProject>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(usersRepoProvider).projects(id);
});

final userTeamsProvider = FutureProvider.autoDispose.family<List<UserTeam>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(usersRepoProvider).teams(id);
});

final teamsProvider = FutureProvider<List<Team>>((ref) async {
  ref.watch(uidProvider);
  return ref.watch(teamsRepoProvider).list();
});

final teamProvider = FutureProvider.autoDispose.family<Team, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(teamsRepoProvider).get(id);
});

final teamMembersProvider = FutureProvider.autoDispose.family<List<TeamMember>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(teamsRepoProvider).members(id);
});

final teamInvitesProvider = FutureProvider.autoDispose.family<List<TeamInvite>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(teamsRepoProvider).invites(id);
});

final teamProjectsProvider = FutureProvider.autoDispose.family<List<TeamProject>, String>((ref, id) async {
  ref.watch(uidProvider);
  return ref.watch(teamsRepoProvider).projects(id);
});
