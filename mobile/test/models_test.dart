import 'package:flutter_test/flutter_test.dart';
import 'package:taskmanagement/core/api/api_client.dart';
import 'package:taskmanagement/core/theme/task_styles.dart';
import 'package:taskmanagement/core/utils/dates.dart';
import 'package:taskmanagement/data/models.dart';

// JSON mẫu đúng định dạng Worker trả về (serializeTask / serializeProject / serializeComment…)
void main() {
  group('Task.fromJson', () {
    final json = {
      'id': 't1',
      'projectId': 'p1',
      'no': 3,
      'title': 'Thiết kế màn đăng nhập',
      'description': null,
      'status': 'in-progress',
      'priority': 'high',
      'assignee': 'Vũ Dũng',
      'tags': ['design', 'ui'],
      'startDate': '2026-10-01',
      'dueDate': '2026-10-05',
      'thumbnailKey': 'tasks/t1/images/a.png',
      'thumbnailUrl': 'https://api/files/tasks/t1/images/a.png',
      'createdAt': 1700000000000,
      'updatedAt': 1700000001000,
      'commentCount': 2,
      'imageCount': 4,
    };

    test('đọc đủ trường + enum trạng thái/ưu tiên', () {
      final t = Task.fromJson(json);
      expect(t.no, 3);
      expect(t.noLabel, '#03');
      expect(t.status, TaskStatus.inProgress);
      expect(t.priority, TaskPriority.high);
      expect(t.tags, ['design', 'ui']);
      expect(t.imageCount, 4);
      expect(t.commentCount, 2);
    });

    test('TaskDraft.toJson: không gửi `no`, chuỗi rỗng → null (giống web)', () {
      final d = TaskDraft(title: '  A  ', description: '  ', assignee: '', status: TaskStatus.completed, startDate: '', dueDate: '2026-10-10');
      final m = d.toJson();
      expect(m.containsKey('no'), isFalse);
      expect(m['title'], 'A');
      expect(m['description'], isNull);
      expect(m['assignee'], isNull);
      expect(m['status'], 'completed');
      expect(m['startDate'], isNull);
      expect(m['dueDate'], '2026-10-10');
    });
  });

  test('Project.fromJson đọc stats "in-progress"', () {
    final p = Project.fromJson({
      'id': 'p1',
      'name': 'Renta car',
      'stats': {'total': 5, 'pending': 1, 'in-progress': 2, 'completed': 2},
      'createdAt': 1,
      'updatedAt': 2,
    });
    expect(p.stats.inProgress, 2);
    expect(p.stats.total, 5);
  });

  test('Comment.fromJson: tên tác giả = displayName || phần trước @ của email', () {
    final c = Comment.fromJson({
      'id': 'c1',
      'taskId': 't1',
      'body': 'Hello',
      'parentId': 'c0',
      'replyTo': {'id': 'c0', 'authorId': 'u2', 'authorDisplayName': null, 'authorEmail': 'yen@gmail.com'},
      'attachments': [
        {'id': 'a1', 'fileKey': 'k', 'fileName': 'x.pdf', 'fileSize': 10, 'mimeType': 'application/pdf', 'fileUrl': 'u', 'createdAt': 1},
      ],
      'createdAt': 1,
      'updatedAt': 2,
      'author': {'id': 'u1', 'email': 'dung@gmail.com', 'displayName': null, 'avatarUrl': null},
    });
    expect(c.authorName, 'dung');
    expect(c.replyToName, 'yen');
    expect(c.edited, isTrue);
    expect(c.attachments.single.isPdf, isTrue);
  });

  test('AppUser.fromJson: role/status', () {
    final u = AppUser.fromJson({'id': 'u', 'email': 'a@b.c', 'role': 'admin', 'status': 'disabled', 'createdAt': 1});
    expect(u.isAdmin, isTrue);
    expect(u.isDisabled, isTrue);
    expect(u.name, 'a@b.c');
  });

  group('dates', () {
    test('formatDate / formatDateShort', () {
      expect(formatDate('2026-03-07'), '07/03/2026');
      expect(formatDateShort('2026-03-07'), '07/03');
      expect(formatDate(null), isNull);
    });

    test('isOverdue: chỉ khi chưa xong và hạn < hôm nay', () {
      Task make(String? due, String status) => Task.fromJson({
            'id': 'x', 'projectId': 'p', 'no': 1, 'title': 't', 'status': status, 'priority': 'low', //
            'dueDate': due, 'createdAt': 0, 'updatedAt': 0,
          });
      final yesterday = ymd(DateTime.now().subtract(const Duration(days: 1)));
      expect(isOverdue(make(yesterday, 'pending')), isTrue);
      expect(isOverdue(make(yesterday, 'completed')), isFalse);
      expect(isOverdue(make(todayYmd(), 'pending')), isFalse);
      expect(isOverdue(make(null, 'pending')), isFalse);
    });
  });

  test('mimeFromFileName khớp danh sách server chấp nhận', () {
    expect(mimeFromFileName('a.JPG'), 'image/jpeg');
    expect(mimeFromFileName('b.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(mimeFromFileName('c.pdf'), 'application/pdf');
    expect(mimeFromFileName('d.heic'), 'application/octet-stream');
  });
}
