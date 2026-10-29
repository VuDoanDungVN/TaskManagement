// Models map 1-1 với interface TypeScript của web (lib/api/*.ts) → JSON từ Worker
// được đọc đúng như bản web.

import '../core/theme/task_styles.dart';

String? _s(Object? v) => v?.toString();
int _i(Object? v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
int? _in(Object? v) => v == null ? null : _i(v);
List<Map<String, dynamic>> _list(Object? v) =>
    (v as List? ?? const []).whereType<Map>().map((e) => e.cast<String, dynamic>()).toList();

// ---------------------------------------------------------------- Users

enum SystemRole { admin, user }

enum UserStatus { active, disabled }

class AppUser {
  AppUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.avatarUrl,
    required this.emailVerified,
    required this.role,
    required this.status,
    required this.teamCount,
    required this.projectCount,
    required this.createdAt,
  });

  final String id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final bool emailVerified;
  final SystemRole role;
  final UserStatus status;
  final int? teamCount;
  final int? projectCount;
  final int createdAt;

  bool get isAdmin => role == SystemRole.admin;
  bool get isDisabled => status == UserStatus.disabled;

  /// Tên hiển thị như web: displayName || email
  String get name => (displayName?.trim().isNotEmpty ?? false) ? displayName! : email;

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: _s(j['id'])!,
        email: _s(j['email']) ?? '',
        displayName: _s(j['displayName']),
        avatarUrl: _s(j['avatarUrl']),
        emailVerified: j['emailVerified'] == true,
        role: j['role'] == 'admin' ? SystemRole.admin : SystemRole.user,
        status: j['status'] == 'disabled' ? UserStatus.disabled : UserStatus.active,
        teamCount: _in(j['teamCount']),
        projectCount: _in(j['projectCount']),
        createdAt: _i(j['createdAt']),
      );
}

class UserPage {
  UserPage(this.items, this.nextCursor);
  final List<AppUser> items;
  final String? nextCursor;
}

class SetupLinkResult {
  SetupLinkResult(this.setPasswordUrl, this.emailSent);
  final String setPasswordUrl;
  final bool emailSent;

  factory SetupLinkResult.fromJson(Map<String, dynamic> j) =>
      SetupLinkResult(_s(j['setPasswordUrl']) ?? '', j['emailSent'] == true);
}

class UserProject {
  UserProject({required this.projectId, required this.name, required this.thumbnailUrl});
  final String projectId;
  final String name;
  final String? thumbnailUrl;

  factory UserProject.fromJson(Map<String, dynamic> j) => UserProject(
        projectId: _s(j['projectId'])!,
        name: _s(j['name']) ?? '',
        thumbnailUrl: _s(j['thumbnailUrl']),
      );
}

class UserTeam {
  UserTeam({required this.teamId, required this.name, required this.role, required this.isOwner, required this.avatarUrl});
  final String teamId;
  final String name;
  final String role; // owner | admin | member
  final bool isOwner;
  final String? avatarUrl;

  factory UserTeam.fromJson(Map<String, dynamic> j) => UserTeam(
        teamId: _s(j['teamId'])!,
        name: _s(j['name']) ?? '',
        role: _s(j['role']) ?? 'member',
        isOwner: j['isOwner'] == true,
        avatarUrl: _s(j['avatarUrl']),
      );
}

// ---------------------------------------------------------------- Projects

class ProjectStats {
  const ProjectStats({this.total = 0, this.pending = 0, this.inProgress = 0, this.completed = 0});
  final int total;
  final int pending;
  final int inProgress;
  final int completed;

  factory ProjectStats.fromJson(Map<String, dynamic>? j) => j == null
      ? const ProjectStats()
      : ProjectStats(
          total: _i(j['total']),
          pending: _i(j['pending']),
          inProgress: _i(j['in-progress']),
          completed: _i(j['completed']),
        );
}

class Project {
  Project({
    required this.id,
    required this.name,
    required this.description,
    required this.thumbnailUrl,
    required this.teamId,
    required this.teamName,
    required this.stats,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String name;
  final String? description;
  final String? thumbnailUrl;
  final String? teamId;
  final String? teamName;
  final ProjectStats stats;
  final int createdAt;
  final int updatedAt;

  factory Project.fromJson(Map<String, dynamic> j) => Project(
        id: _s(j['id'])!,
        name: _s(j['name']) ?? '',
        description: _s(j['description']),
        thumbnailUrl: _s(j['thumbnailUrl']),
        teamId: _s(j['teamId']),
        teamName: _s(j['teamName']),
        stats: ProjectStats.fromJson((j['stats'] as Map?)?.cast<String, dynamic>()),
        createdAt: _i(j['createdAt']),
        updatedAt: _i(j['updatedAt']),
      );
}

class ProjectMember {
  ProjectMember({required this.id, required this.email, required this.displayName, required this.avatarUrl, required this.role});
  final String id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final SystemRole role;

  String get name => (displayName?.trim().isNotEmpty ?? false) ? displayName! : email;

  factory ProjectMember.fromJson(Map<String, dynamic> j) => ProjectMember(
        id: _s(j['id'])!,
        email: _s(j['email']) ?? '',
        displayName: _s(j['displayName']),
        avatarUrl: _s(j['avatarUrl']),
        role: j['role'] == 'admin' ? SystemRole.admin : SystemRole.user,
      );
}

// ---------------------------------------------------------------- Tasks

class Task {
  Task({
    required this.id,
    required this.projectId,
    required this.no,
    required this.title,
    required this.description,
    required this.status,
    required this.priority,
    required this.assignee,
    required this.tags,
    required this.startDate,
    required this.dueDate,
    required this.thumbnailUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.commentCount,
    required this.imageCount,
  });

  final String id;
  final String projectId;
  final int no;
  final String title;
  final String? description;
  final TaskStatus status;
  final TaskPriority priority;
  final String? assignee;
  final List<String> tags;
  final String? startDate; // YYYY-MM-DD
  final String? dueDate;
  final String? thumbnailUrl; // ảnh đại diện
  final int createdAt;
  final int updatedAt;
  final int commentCount;
  final int imageCount;

  String get noLabel => '#${no.toString().padLeft(2, '0')}';

  factory Task.fromJson(Map<String, dynamic> j) => Task(
        id: _s(j['id'])!,
        projectId: _s(j['projectId'])!,
        no: _i(j['no']),
        title: _s(j['title']) ?? '',
        description: _s(j['description']),
        status: TaskStatusApi.parse(_s(j['status']) ?? ''),
        priority: TaskPriorityApi.parse(_s(j['priority']) ?? ''),
        assignee: _s(j['assignee']),
        tags: (j['tags'] as List? ?? const []).map((e) => '$e').toList(),
        startDate: _s(j['startDate']),
        dueDate: _s(j['dueDate']),
        thumbnailUrl: _s(j['thumbnailUrl']),
        createdAt: _i(j['createdAt']),
        updatedAt: _i(j['updatedAt']),
        commentCount: _i(j['commentCount']),
        imageCount: _i(j['imageCount']),
      );
}

/// Dữ liệu form tạo/sửa task (giống TaskDraft của web — không có `no`, server tự cấp).
class TaskDraft {
  TaskDraft({
    required this.title,
    this.description,
    this.status = TaskStatus.pending,
    this.priority = TaskPriority.medium,
    this.assignee,
    this.tags = const [],
    this.startDate,
    this.dueDate,
  });

  String title;
  String? description;
  TaskStatus status;
  TaskPriority priority;
  String? assignee;
  List<String> tags;
  String? startDate;
  String? dueDate;

  Map<String, dynamic> toJson() => {
        'title': title.trim(),
        'description': (description?.trim().isEmpty ?? true) ? null : description!.trim(),
        'status': status.api,
        'priority': priority.api,
        'assignee': (assignee?.trim().isEmpty ?? true) ? null : assignee!.trim(),
        'tags': tags,
        'startDate': (startDate?.isEmpty ?? true) ? null : startDate,
        'dueDate': (dueDate?.isEmpty ?? true) ? null : dueDate,
      };
}

class TaskImage {
  TaskImage({required this.id, required this.url, required this.position});
  final String id;
  final String url;
  final int position;

  factory TaskImage.fromJson(Map<String, dynamic> j) =>
      TaskImage(id: _s(j['id'])!, url: _s(j['url']) ?? '', position: _i(j['position']));
}

/// Giới hạn khớp Worker (task-images.ts / uploads.ts)
const taskImageLimit = 10;
const taskImageMaxBytes = 5 * 1024 * 1024;

// ---------------------------------------------------------------- Comments

class CommentAttachment {
  CommentAttachment({required this.id, required this.fileName, required this.fileSize, required this.mimeType, required this.fileUrl});
  final String id;
  final String fileName;
  final int fileSize;
  final String mimeType;
  final String? fileUrl;

  bool get isImage => mimeType.startsWith('image/');
  bool get isPdf => mimeType == 'application/pdf';

  factory CommentAttachment.fromJson(Map<String, dynamic> j) => CommentAttachment(
        id: _s(j['id'])!,
        fileName: _s(j['fileName']) ?? 'file',
        fileSize: _i(j['fileSize']),
        mimeType: _s(j['mimeType']) ?? '',
        fileUrl: _s(j['fileUrl']),
      );
}

class Comment {
  Comment({
    required this.id,
    required this.taskId,
    required this.body,
    required this.parentId,
    required this.replyToId,
    required this.replyToName,
    required this.attachments,
    required this.createdAt,
    required this.updatedAt,
    required this.authorId,
    required this.authorName,
    required this.authorAvatarUrl,
  });

  final String id;
  final String taskId;
  final String body;
  final String? parentId; // null = bình luận gốc
  final String? replyToId;
  final String? replyToName;
  final List<CommentAttachment> attachments;
  final int createdAt;
  final int updatedAt;
  final String authorId;
  final String authorName;
  final String? authorAvatarUrl;

  bool get edited => updatedAt > createdAt;

  factory Comment.fromJson(Map<String, dynamic> j) {
    final author = (j['author'] as Map?)?.cast<String, dynamic>() ?? const {};
    final reply = (j['replyTo'] as Map?)?.cast<String, dynamic>();
    // Giống authorDisplayName() của web: displayName || phần trước @ của email
    String nameOf(Object? display, Object? email) {
      final d = _s(display);
      if (d?.trim().isNotEmpty ?? false) return d!.trim();
      return (_s(email) ?? '').split('@').first;
    }

    return Comment(
      id: _s(j['id'])!,
      taskId: _s(j['taskId']) ?? '',
      body: _s(j['body']) ?? '',
      parentId: _s(j['parentId']),
      replyToId: reply == null ? null : _s(reply['id']),
      replyToName: reply == null ? null : nameOf(reply['authorDisplayName'], reply['authorEmail']),
      attachments: _list(j['attachments']).map(CommentAttachment.fromJson).toList(),
      createdAt: _i(j['createdAt']),
      updatedAt: _i(j['updatedAt']),
      authorId: _s(author['id']) ?? '',
      authorName: nameOf(author['displayName'], author['email']),
      authorAvatarUrl: _s(author['avatarUrl']),
    );
  }
}

const commentAttachmentMaxBytes = 25 * 1024 * 1024;
const commentAttachmentMaxCount = 10;
const commentAttachmentExtensions = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', //
  'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'pdf',
];

// ---------------------------------------------------------------- Teams (admin)

class Team {
  Team({
    required this.id,
    required this.name,
    required this.description,
    required this.avatarUrl,
    required this.visibility,
    required this.memberCount,
    required this.myRole,
  });

  final String id;
  final String name;
  final String? description;
  final String? avatarUrl;
  final String visibility; // private | public
  final int memberCount;
  final String? myRole; // owner | admin | member | null

  bool get canManage => myRole == 'owner' || myRole == 'admin';

  factory Team.fromJson(Map<String, dynamic> j) => Team(
        id: _s(j['id'])!,
        name: _s(j['name']) ?? '',
        description: _s(j['description']),
        avatarUrl: _s(j['avatarUrl']),
        visibility: _s(j['visibility']) ?? 'private',
        memberCount: _i(j['memberCount']),
        myRole: _s(j['myRole']),
      );
}

class TeamMember {
  TeamMember({required this.userId, required this.role, required this.email, required this.displayName, required this.avatarUrl});
  final String userId;
  final String role;
  final String? email;
  final String? displayName;
  final String? avatarUrl;

  String get name => (displayName?.trim().isNotEmpty ?? false) ? displayName! : (email ?? '');

  factory TeamMember.fromJson(Map<String, dynamic> j) => TeamMember(
        userId: _s(j['userId'])!,
        role: _s(j['role']) ?? 'member',
        email: _s(j['email']),
        displayName: _s(j['displayName']),
        avatarUrl: _s(j['avatarUrl']),
      );
}

class TeamInvite {
  TeamInvite({required this.id, required this.email, required this.role, required this.status});
  final String id;
  final String email;
  final String role;
  final String status;

  factory TeamInvite.fromJson(Map<String, dynamic> j) => TeamInvite(
        id: _s(j['id'])!,
        email: _s(j['email']) ?? '',
        role: _s(j['role']) ?? 'member',
        status: _s(j['status']) ?? 'pending',
      );
}

class TeamProject {
  TeamProject({required this.id, required this.name, required this.thumbnailUrl});
  final String id;
  final String name;
  final String? thumbnailUrl;

  factory TeamProject.fromJson(Map<String, dynamic> j) =>
      TeamProject(id: _s(j['id'])!, name: _s(j['name']) ?? '', thumbnailUrl: _s(j['thumbnailUrl']));
}

List<T> parseItems<T>(Object? data, T Function(Map<String, dynamic>) f) =>
    _list((data as Map?)?['items']).map(f).toList();
