// Repositories — map 1-1 với lib/api/*.ts của web, gọi cùng endpoint Worker.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/api/api_client.dart';
import 'models.dart';

String _e(String s) => Uri.encodeComponent(s);
Map<String, dynamic> _m(Object? d) => (d as Map).cast<String, dynamic>();

/// Một file cục bộ cần upload (ảnh/đính kèm).
class LocalFile {
  LocalFile({required this.path, required this.name, required this.size});
  final String path;
  final String name;
  final int size;
}

// ---------------------------------------------------------------- users.ts
class UsersRepo {
  UsersRepo(this._api);
  final ApiClient _api;

  Future<AppUser> me() async => AppUser.fromJson(_m(await _api.get('/users/me')));

  Future<AppUser> updateMe({String? displayName}) async =>
      AppUser.fromJson(_m(await _api.put('/users/me', {'displayName': displayName})));

  Future<UserPage> list({int limit = 20, String? cursor, String? search}) async {
    final d = _m(await _api.get('/users', query: {'limit': limit, 'cursor': cursor, 'search': search}));
    return UserPage(parseItems(d, AppUser.fromJson), d['nextCursor'] as String?);
  }

  Future<({AppUser user, SetupLinkResult link})> create({
    required String email,
    String? displayName,
    required SystemRole role,
    List<String> projectIds = const [],
  }) async {
    final d = _m(await _api.post('/users', {
      'email': email,
      'displayName': displayName,
      'role': role == SystemRole.admin ? 'admin' : 'user',
      'projectIds': projectIds,
    }));
    return (user: AppUser.fromJson(_m(d['user'])), link: SetupLinkResult.fromJson(d));
  }

  Future<AppUser> update(String id, {String? displayName, SystemRole? role, UserStatus? status}) async {
    final body = <String, dynamic>{};
    if (displayName != null) body['displayName'] = displayName.trim().isEmpty ? null : displayName.trim();
    if (role != null) body['role'] = role == SystemRole.admin ? 'admin' : 'user';
    if (status != null) body['status'] = status == UserStatus.disabled ? 'disabled' : 'active';
    return AppUser.fromJson(_m(await _api.put('/users/${_e(id)}', body)));
  }

  Future<SetupLinkResult> resendSetupLink(String id) async =>
      SetupLinkResult.fromJson(_m(await _api.post('/users/${_e(id)}/setup-link', const {})));

  Future<List<UserProject>> projects(String id) async =>
      parseItems(await _api.get('/users/${_e(id)}/projects'), UserProject.fromJson);

  Future<void> setProjects(String id, List<String> projectIds) =>
      _api.put('/users/${_e(id)}/projects', {'projectIds': projectIds});

  Future<List<UserTeam>> teams(String id) async => parseItems(await _api.get('/users/${_e(id)}/teams'), UserTeam.fromJson);

  Future<void> addToTeam(String id, String teamId, {String role = 'member'}) =>
      _api.post('/users/${_e(id)}/teams', {'teamId': teamId, 'role': role});

  Future<void> removeFromTeam(String id, String teamId) => _api.delete('/users/${_e(id)}/teams/${_e(teamId)}');
}

// ---------------------------------------------------------------- projects.ts
class ProjectsRepo {
  ProjectsRepo(this._api);
  final ApiClient _api;

  Future<List<Project>> list() async => parseItems(await _api.get('/projects'), Project.fromJson);

  Future<Project> get(String id) async => Project.fromJson(_m(await _api.get('/projects/${_e(id)}')));

  Future<Project> create({required String name, String? description}) async =>
      Project.fromJson(_m(await _api.post('/projects', {'name': name, 'description': description})));

  Future<List<ProjectMember>> members(String id) async =>
      parseItems(await _api.get('/projects/${_e(id)}/members'), ProjectMember.fromJson);

  Future<void> addMember(String id, String userId) => _api.post('/projects/${_e(id)}/members', {'userId': userId});

  Future<void> removeMember(String id, String userId) => _api.delete('/projects/${_e(id)}/members/${_e(userId)}');
}

// ---------------------------------------------------------------- tasks.ts
class TasksRepo {
  TasksRepo(this._api);
  final ApiClient _api;

  Future<List<Task>> listByProject(String projectId) async =>
      parseItems(await _api.get('/tasks', query: {'projectId': projectId}), Task.fromJson);

  /// Mọi task user truy cập được (Dashboard, Thông báo)
  Future<List<Task>> listAll() async => parseItems(await _api.get('/tasks'), Task.fromJson);

  Future<Task> get(String id) async => Task.fromJson(_m(await _api.get('/tasks/${_e(id)}')));

  Future<Task> create(String projectId, TaskDraft d) async =>
      Task.fromJson(_m(await _api.post('/tasks', {'projectId': projectId, ...d.toJson()})));

  Future<Task> update(String id, TaskDraft d) async => Task.fromJson(_m(await _api.put('/tasks/${_e(id)}', d.toJson())));

  Future<void> remove(String id) => _api.delete('/tasks/${_e(id)}');

  // Ảnh (task-images.ts)
  Future<List<TaskImage>> images(String id) async => parseItems(await _api.get('/tasks/${_e(id)}/images'), TaskImage.fromJson);

  Future<List<TaskImage>> uploadImage(String id, LocalFile f, {void Function(double)? onProgress}) async {
    final form = FormData.fromMap({'file': await multipartFromPath(f.path, f.name)});
    return parseItems(await _api.upload('/tasks/${_e(id)}/images', form, onProgress: onProgress), TaskImage.fromJson);
  }

  Future<void> reorderImages(String id, List<String> ids) => _api.put('/tasks/${_e(id)}/images/order', {'ids': ids});

  Future<void> deleteImage(String id, String imageId) => _api.delete('/tasks/${_e(id)}/images/${_e(imageId)}');
}

// ---------------------------------------------------------------- comments.ts
class CommentsRepo {
  CommentsRepo(this._api);
  final ApiClient _api;

  Future<List<Comment>> listByTask(String taskId) async =>
      parseItems(await _api.get('/tasks/${_e(taskId)}/comments'), Comment.fromJson);

  Future<Comment> create(String taskId, String body, {String? parentId, List<LocalFile> files = const []}) async {
    if (files.isEmpty) {
      return Comment.fromJson(_m(await _api.post('/tasks/${_e(taskId)}/comments', {'body': body, 'parentId': parentId})));
    }
    final form = FormData();
    form.fields.add(MapEntry('body', body));
    if (parentId != null) form.fields.add(MapEntry('parentId', parentId));
    for (final f in files) {
      form.files.add(MapEntry('file', await multipartFromPath(f.path, f.name)));
    }
    return Comment.fromJson(_m(await _api.upload('/tasks/${_e(taskId)}/comments', form)));
  }

  Future<Comment> update(String id, String body) async => Comment.fromJson(_m(await _api.put('/comments/${_e(id)}', {'body': body})));

  Future<void> remove(String id) => _api.delete('/comments/${_e(id)}');
}

// ---------------------------------------------------------------- teams.ts (admin)
class TeamsRepo {
  TeamsRepo(this._api);
  final ApiClient _api;

  Future<List<Team>> list() async => parseItems(await _api.get('/teams', query: {'limit': 50}), Team.fromJson);

  Future<List<Team>> all({String? search}) async => parseItems(await _api.get('/teams/all', query: {'search': search}), Team.fromJson);

  Future<Team> get(String id) async => Team.fromJson(_m(await _api.get('/teams/${_e(id)}')));

  Future<Team> create({required String name, String? description, String visibility = 'private'}) async =>
      Team.fromJson(_m(await _api.post('/teams', {'name': name, 'description': description, 'visibility': visibility})));

  Future<Team> update(String id, {required String name, String? description, required String visibility}) async =>
      Team.fromJson(_m(await _api.put('/teams/${_e(id)}', {'name': name, 'description': description, 'visibility': visibility})));

  Future<void> remove(String id) => _api.delete('/teams/${_e(id)}');

  Future<List<TeamMember>> members(String id) async => parseItems(await _api.get('/teams/${_e(id)}/members'), TeamMember.fromJson);

  Future<void> setMemberRole(String id, String userId, String role) =>
      _api.put('/teams/${_e(id)}/members/${_e(userId)}', {'role': role});

  Future<void> removeMember(String id, String userId) => _api.delete('/teams/${_e(id)}/members/${_e(userId)}');

  Future<List<TeamInvite>> invites(String id) async => parseItems(await _api.get('/teams/${_e(id)}/invites'), TeamInvite.fromJson);

  Future<void> invite(String id, List<String> emails, {String role = 'member'}) =>
      _api.post('/teams/${_e(id)}/invites', {'emails': emails, 'role': role});

  Future<void> cancelInvite(String id, String inviteId) => _api.delete('/teams/${_e(id)}/invites/${_e(inviteId)}');

  Future<List<TeamProject>> projects(String id) async => parseItems(await _api.get('/teams/${_e(id)}/projects'), TeamProject.fromJson);

  Future<void> assignProject(String id, String projectId) => _api.post('/teams/${_e(id)}/projects', {'projectId': projectId});

  Future<void> unassignProject(String id, String projectId) => _api.delete('/teams/${_e(id)}/projects/${_e(projectId)}');
}

// ---------------------------------------------------------------- uploads.ts
class UploadsRepo {
  UploadsRepo(this._api);
  final ApiClient _api;

  Future<void> avatar(LocalFile f) async =>
      _api.upload('/uploads/avatar', FormData.fromMap({'file': await multipartFromPath(f.path, f.name)}));

  Future<void> projectThumbnail(String projectId, LocalFile f) async => _api.upload(
        '/uploads/projects/${_e(projectId)}/thumbnail',
        FormData.fromMap({'file': await multipartFromPath(f.path, f.name)}),
      );
}

final usersRepoProvider = Provider((ref) => UsersRepo(ref.watch(apiClientProvider)));
final projectsRepoProvider = Provider((ref) => ProjectsRepo(ref.watch(apiClientProvider)));
final tasksRepoProvider = Provider((ref) => TasksRepo(ref.watch(apiClientProvider)));
final commentsRepoProvider = Provider((ref) => CommentsRepo(ref.watch(apiClientProvider)));
final teamsRepoProvider = Provider((ref) => TeamsRepo(ref.watch(apiClientProvider)));
final uploadsRepoProvider = Provider((ref) => UploadsRepo(ref.watch(apiClientProvider)));
