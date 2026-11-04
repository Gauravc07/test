import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../widgets/app_buttons.dart';
import '../widgets/marketplace_widgets.dart';

/// Opened from a password reset email: set a new password.
class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key, this.auth});

  final AuthService? auth;

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _busy = false;
  bool _done = false;
  String? _error;

  AuthService get _auth => widget.auth ?? authService;

  @override
  void dispose() {
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_busy || !(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await _auth.updatePassword(_password.text);
      if (mounted) setState(() => _done = true);
    } on AuthFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'New password',
      body: PageList(
        maxWidth: 480,
        children: [
          if (_done) ...[
            const Icon(
              Icons.check_circle_outline,
              size: 40,
              color: AppColors.accent,
            ),
            const SizedBox(height: 12),
            Text('Password updated', style: AppText.heading(26)),
            const SizedBox(height: 8),
            Text(
              'Use your new password the next time you log in, on the web or in the app.',
              style: AppText.sans(size: 15, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            SolidButton(
              label: 'Continue',
              fullWidth: true,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ] else
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Choose a new password', style: AppText.heading(26)),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _password,
                    obscureText: true,
                    enabled: !_busy,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: const InputDecoration(
                      labelText: 'New password',
                    ),
                    validator: (v) => (v ?? '').length < 8
                        ? 'Use at least 8 characters'
                        : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _confirm,
                    obscureText: true,
                    enabled: !_busy,
                    decoration: const InputDecoration(
                      labelText: 'Confirm new password',
                    ),
                    validator: (v) =>
                        v != _password.text ? 'Passwords do not match' : null,
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: AppText.sans(
                        size: 14,
                        color: const Color(0xFF9B1C1C),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  SolidButton(
                    label: _busy ? 'Saving…' : 'Save password',
                    fullWidth: true,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
