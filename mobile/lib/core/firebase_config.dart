import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

/// Cấu hình Firebase lấy từ --dart-define-from-file=config/firebase.json
/// (giá trị copy từ google-services.json / GoogleService-Info.plist của Firebase Console).
/// Dùng options tường minh → KHÔNG cần thêm plist vào Xcode hay plugin google-services vào Gradle.
abstract final class FirebaseConfig {
  static const _projectId = String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: 'task-management-pro-2026');
  static const _senderId = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const _storageBucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');

  static const _androidApiKey = String.fromEnvironment('FIREBASE_ANDROID_API_KEY');
  static const _androidAppId = String.fromEnvironment('FIREBASE_ANDROID_APP_ID');

  static const _iosApiKey = String.fromEnvironment('FIREBASE_IOS_API_KEY');
  static const _iosAppId = String.fromEnvironment('FIREBASE_IOS_APP_ID');
  static const _iosBundleId = String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID', defaultValue: 'jp.co.occ.taskmanagement');

  /// null nếu thiếu cấu hình cho nền tảng hiện tại → app hiện màn hướng dẫn.
  static FirebaseOptions? get current {
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      if (_iosApiKey.isEmpty || _iosAppId.isEmpty) return null;
      return const FirebaseOptions(
        apiKey: _iosApiKey,
        appId: _iosAppId,
        messagingSenderId: _senderId,
        projectId: _projectId,
        storageBucket: _storageBucket,
        iosBundleId: _iosBundleId,
      );
    }
    if (_androidApiKey.isEmpty || _androidAppId.isEmpty) return null;
    return const FirebaseOptions(
      apiKey: _androidApiKey,
      appId: _androidAppId,
      messagingSenderId: _senderId,
      projectId: _projectId,
      storageBucket: _storageBucket,
    );
  }
}
