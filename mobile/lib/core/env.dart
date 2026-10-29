/// Cấu hình theo môi trường, truyền khi build/run bằng --dart-define:
///
///   flutter run --dart-define=API_URL=http://10.0.2.2:8787      (Android emulator → Worker local)
///   flutter run --dart-define=API_URL=http://localhost:8787     (iOS simulator → Worker local)
///   flutter build ipa                                            (mặc định: Worker production)
abstract final class Env {
  /// Cùng Worker (Cloudflare) mà bản web dùng → dữ liệu luôn đồng bộ.
  static const apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://task-management-api.vudungit92.workers.dev',
  );
}
