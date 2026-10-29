import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/state/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_bar.dart';
import '../../widgets/common.dart';

/// Thông báo lỗi Firebase — giữ nguyên câu chữ như translateFirebaseError() của web (lib/auth/context.tsx).
String translateFirebaseError(String code) => switch (code) {
      'invalid-email' => 'Email không hợp lệ.',
      'user-not-found' || 'wrong-password' || 'invalid-credential' => 'Email hoặc mật khẩu không đúng.',
      'user-disabled' => 'Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.',
      'too-many-requests' => 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
      'network-request-failed' => 'Lỗi mạng. Kiểm tra kết nối và thử lại.',
      'operation-not-allowed' => 'Phương thức đăng nhập chưa được bật trong Firebase Console.',
      _ => 'Đã xảy ra lỗi. Vui lòng thử lại.',
    };

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key, this.denied = false});

  /// true khi bị đưa về từ AccessGate (tài khoản chưa được cấp / đã khoá) — `?denied=1` của web
  final bool denied;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _show = false;
  bool _submitting = false;
  String? _error;
  String? _info;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _info = null;
      _submitting = true;
    });
    try {
      await ref.read(firebaseAuthProvider).signInWithEmailAndPassword(email: _email.text.trim(), password: _password.text);
      // Router tự chuyển vào app khi trạng thái đăng nhập đổi
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _error = translateFirebaseError(e.code));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _forgot() async {
    final t = AppLocalizations.of(context);
    setState(() {
      _error = null;
      _info = null;
    });
    if (_email.text.trim().isEmpty) {
      setState(() => _error = t.authLoginForgotEmailPrompt);
      return;
    }
    try {
      await ref.read(firebaseAuthProvider).sendPasswordResetEmail(email: _email.text.trim());
      if (mounted) setState(() => _info = t.authLoginResetEmailSent);
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _error = translateFirebaseError(e.code));
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final label = TextStyle(fontSize: TwSize.textXs, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc700, Tw.zinc300));
    Widget notice(String text, {required bool danger}) => Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: danger ? context.tw(Tw.red50, Tw.alpha(Tw.red900, 0.4)) : context.tw(const Color(0xFFECFDF5), Tw.alpha(Tw.emerald900, 0.4)),
            borderRadius: BorderRadius.circular(TwSize.radiusLg),
          ),
          child: Text(text,
              style: TextStyle(
                fontSize: TwSize.text11,
                color: danger ? context.tw(Tw.red700, const Color(0xFFFCA5A5)) : context.tw(Tw.emerald700, const Color(0xFF6EE7B7)),
              )),
        );

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 40),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 448),
              child: AppCard(
                padding: const EdgeInsets.all(24),
                child: AutofillGroup(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Center(child: TaskLogo(size: 40)),
                      const SizedBox(height: 12),
                      Text(t.authLoginTitle, textAlign: TextAlign.center, style: const TextStyle(fontSize: TwSize.textXl, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(t.authLoginSubtitle,
                          textAlign: TextAlign.center, style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.zinc600, Tw.zinc400))),
                      const SizedBox(height: 24),
                      if (widget.denied) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: context.tw(const Color(0xFFFFFBEB), Tw.alpha(Tw.amber900, 0.2)),
                            borderRadius: BorderRadius.circular(TwSize.radiusLg),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(LucideIcons.shieldAlert, size: 16, color: context.tw(Tw.amber700, Tw.amber400)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text('${t.accessDeniedLogin} ${t.accessContactAdmin}',
                                    style: TextStyle(fontSize: TwSize.textXs, color: context.tw(Tw.amber700, const Color(0xFFFCD34D)))),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Text(t.authLoginEmailLabel, style: label),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(hintText: t.authLoginEmailPlaceholder),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Text(t.authLoginPasswordLabel, style: label),
                          const Spacer(),
                          GestureDetector(
                            onTap: _forgot,
                            child: Text(t.authLoginForgotPassword,
                                style: TextStyle(fontSize: TwSize.text11, fontWeight: FontWeight.w500, color: context.tw(Tw.zinc500, Tw.zinc400))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _password,
                        obscureText: !_show,
                        autofillHints: const [AutofillHints.password],
                        onSubmitted: (_) => _submitting ? null : _submit(),
                        decoration: InputDecoration(
                          hintText: t.authLoginPasswordPlaceholder,
                          suffixIcon: IconButton(
                            tooltip: _show ? t.authLoginHidePassword : t.authLoginShowPassword,
                            icon: Icon(_show ? LucideIcons.eyeOff : LucideIcons.eye, size: 16, color: context.tw(Tw.zinc500, Tw.zinc400)),
                            onPressed: () => setState(() => _show = !_show),
                          ),
                        ),
                      ),
                      if (_error != null) ...[const SizedBox(height: 12), notice(_error!, danger: true)],
                      if (_info != null) ...[const SizedBox(height: 12), notice(_info!, danger: false)],
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 44,
                        child: FilledButton(
                          onPressed: _submitting ? null : _submit,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_submitting) ...[
                                SizedBox.square(
                                    dimension: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Theme.of(context).colorScheme.onPrimary)),
                                const SizedBox(width: 8),
                              ],
                              Text(_submitting ? t.authLoginSubmitting : t.authLoginSubmit),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Hệ thống đóng: tài khoản do admin cấp, không có đăng ký
                      Text(t.accessContactAdmin,
                          textAlign: TextAlign.center, style: TextStyle(fontSize: TwSize.text11, color: context.tw(Tw.zinc500, Tw.zinc400))),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
