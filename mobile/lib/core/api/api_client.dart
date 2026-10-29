import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../env.dart';

/// Lỗi HTTP từ Worker — tương đương ApiError của web (lib/api/client.ts).
class ApiError implements Exception {
  ApiError(this.status, this.message);
  final int status;
  final String message;

  @override
  String toString() => message;
}

/// Client gọi Worker: tự gắn Firebase ID token, chuyển lỗi về [ApiError] với message
/// server trả về (`{ message }` hoặc `{ error }`), giống apiRequest() của web.
class ApiClient {
  ApiClient({String? baseUrl})
      : _dio = Dio(BaseOptions(
          baseUrl: (baseUrl ?? Env.apiUrl).replaceAll(RegExp(r'/$'), ''),
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 60),
          sendTimeout: const Duration(minutes: 5),
        )) {
    _dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        try {
          options.headers['Authorization'] = 'Bearer ${await user.getIdToken()}';
        } catch (_) {
          // Không lấy được token → gửi không kèm, server trả 401
        }
      }
      handler.next(options);
    }));
  }

  final Dio _dio;

  Future<T> get<T>(String path, {Map<String, dynamic>? query}) =>
      _send(() => _dio.get<T>(path, queryParameters: _clean(query)));

  Future<T> post<T>(String path, Object? body) => _send(() => _dio.post<T>(path, data: body));

  Future<T> put<T>(String path, Object? body) => _send(() => _dio.put<T>(path, data: body));

  Future<T> delete<T>(String path) => _send(() => _dio.delete<T>(path));

  /// Upload multipart, báo tiến trình 0–1 (giống uploadWithProgress của web).
  Future<T> upload<T>(String path, FormData form, {void Function(double fraction)? onProgress}) =>
      _send(() => _dio.post<T>(
            path,
            data: form,
            onSendProgress: (sent, total) {
              if (total > 0) onProgress?.call(sent / total);
            },
          ));

  Map<String, dynamic>? _clean(Map<String, dynamic>? q) {
    if (q == null) return null;
    final out = <String, dynamic>{};
    q.forEach((k, v) {
      if (v != null && v.toString().isNotEmpty) out[k] = v;
    });
    return out;
  }

  Future<T> _send<T>(Future<Response<T>> Function() run) async {
    try {
      final res = await run();
      return res.data as T;
    } on DioException catch (e) {
      final res = e.response;
      if (res == null) throw ApiError(0, e.message ?? 'Network error');
      final data = res.data;
      String message = 'HTTP ${res.statusCode}';
      if (data is Map) {
        message = (data['message'] ?? data['error'] ?? message).toString();
      }
      throw ApiError(res.statusCode ?? 0, message);
    }
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

/// MIME theo đuôi file — server kiểm tra MIME khi upload (ảnh task, đính kèm bình luận).
String mimeFromFileName(String name) {
  final ext = name.contains('.') ? name.split('.').last.toLowerCase() : '';
  return const {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv': 'text/csv',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'odt': 'application/vnd.oasis.opendocument.text',
        'ods': 'application/vnd.oasis.opendocument.spreadsheet',
        'odp': 'application/vnd.oasis.opendocument.presentation',
        'pdf': 'application/pdf',
      }[ext] ??
      'application/octet-stream';
}

/// Tạo MultipartFile từ đường dẫn file kèm đúng MIME.
Future<MultipartFile> multipartFromPath(String path, String fileName) =>
    MultipartFile.fromFile(path, filename: fileName, contentType: DioMediaType.parse(mimeFromFileName(fileName)));
