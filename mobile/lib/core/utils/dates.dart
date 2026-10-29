import '../../data/models.dart';
import '../../core/theme/task_styles.dart';

/// Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD (giống todayYMD() của web).
String todayYmd([DateTime? now]) => ymd(now ?? DateTime.now());

String ymd(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

DateTime? parseYmd(String? s) {
  if (s == null || s.isEmpty) return null;
  final p = s.split('-');
  if (p.length != 3) return null;
  final y = int.tryParse(p[0]), m = int.tryParse(p[1]), d = int.tryParse(p[2]);
  if (y == null || m == null || d == null) return null;
  return DateTime(y, m, d);
}

/// "YYYY-MM-DD" → "DD/MM/YYYY" (formatDate của web)
String? formatDate(String? s) {
  final d = parseYmd(s);
  if (d == null) return null;
  return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

/// "YYYY-MM-DD" → "DD/MM"
String? formatDateShort(String? s) => formatDate(s)?.substring(0, 5);

/// Unix ms → DD/MM/YYYY
String formatMs(int ms) {
  final d = DateTime.fromMillisecondsSinceEpoch(ms);
  return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

int daysBetween(String later, String earlier) {
  final a = parseYmd(later)!, b = parseYmd(earlier)!;
  return a.difference(b).inDays;
}

/// Quá hạn = có hạn, chưa xong, hạn < hôm nay (isOverdue của web)
bool isOverdue(Task t) {
  if (t.dueDate == null || t.status == TaskStatus.completed) return false;
  final due = parseYmd(t.dueDate);
  if (due == null) return false;
  final now = DateTime.now();
  return due.isBefore(DateTime(now.year, now.month, now.day));
}

/// "5m" / "3h" / "2d" — formatRelativeTime của web
String formatRelative(int ms, {required String justNow}) {
  final diff = DateTime.now().millisecondsSinceEpoch - ms;
  final m = (diff / 60000).round();
  if (m < 1) return justNow;
  if (m < 60) return '${m}m';
  final h = (m / 60).round();
  if (h < 24) return '${h}h';
  return '${(h / 24).round()}d';
}
