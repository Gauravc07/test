import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../widgets/app_buttons.dart';
import 'home_shell.dart';

enum AuthMode { signIn, signUp }

/// Opens the signed-in home when there is a session, otherwise the login /
/// sign-up screen in [mode].
void openAccount(BuildContext context, {AuthMode mode = AuthMode.signIn}) {
  Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => authService.isSignedIn
          ? const HomeShell()
          : AuthPage(initialMode: mode),
    ),
  );
}

/// Login and sign-up for creators and brands.
class AuthPage extends StatefulWidget {
  const AuthPage({super.key, this.initialMode = AuthMode.signIn, this.service});

  final AuthMode initialMode;

  /// Defaults to the app-wide [authService].
  final AuthService? service;

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _company = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();

  late AuthMode _mode = widget.initialMode;
  AccountRole _role = AccountRole.creator;
  bool _busy = false;
  bool _obscure = true;
  String? _error;

  /// Set after sign-up when the user still has to confirm their email.
  String? _confirmationSentTo;

  AuthService get _service => widget.service ?? authService;
  bool get _signUp => _mode == AuthMode.signUp;

  @override
  void dispose() {
    for (final c in [_name, _company, _email, _password, _confirm]) {
      c.dispose();
    }
    super.dispose();
  }

  void _switchMode(AuthMode mode) {
    setState(() {
      _mode = mode;
      _error = null;
      _confirmationSentTo = null;
    });
  }

  Future<void> _submit() async {
    if (_busy) return;
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (_signUp) {
        final outcome = await _service.signUp(
          email: _email.text,
          password: _password.text,
          fullName: _name.text,
          role: _role,
          companyName: _company.text,
        );
        if (!mounted) return;
        if (outcome == SignUpOutcome.confirmEmail) {
          setState(() => _confirmationSentTo = _email.text.trim());
          return;
        }
      } else {
        await _service.signIn(email: _email.text, password: _password.text);
      }
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => HomeShell(auth: widget.service),
        ),
      );
    } on AuthFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Wordmark(onTap: () => Navigator.of(context).pop()),
                  ),
                  const SizedBox(height: 28),
                  Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: _confirmationSentTo != null
                        ? _buildCheckInbox()
                        : _buildForm(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCheckInbox() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(
          Icons.mark_email_unread_outlined,
          size: 32,
          color: AppColors.accent,
        ),
        const SizedBox(height: 16),
        Text('Check your inbox', style: AppText.heading(26)),
        const SizedBox(height: 10),
        Text(
          'We sent a confirmation link to $_confirmationSentTo. '
          'Click it, then log in here.',
          style: AppText.serif(size: 16, height: 1.6),
        ),
        const SizedBox(height: 24),
        SolidButton(
          label: 'Go to login',
          fullWidth: true,
          onPressed: () => _switchMode(AuthMode.signIn),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              _signUp ? 'Join Shor' : 'Welcome back',
              style: AppText.heading(28),
            ),
            const SizedBox(height: 6),
            Text(
              _signUp
                  ? 'Create your account and start collaborating.'
                  : 'Log in to your Shor account.',
              style: AppText.serif(size: 16, height: 1.5),
            ),
            const SizedBox(height: 24),
            if (_signUp) ...[
              Text('I AM A', style: AppText.label()),
              const SizedBox(height: 8),
              SegmentedButton<AccountRole>(
                key: const ValueKey('role-toggle'),
                showSelectedIcon: false,
                segments: const [
                  ButtonSegment(
                    value: AccountRole.creator,
                    label: Text('Creator'),
                    icon: Icon(Icons.auto_awesome_outlined, size: 18),
                  ),
                  ButtonSegment(
                    value: AccountRole.brand,
                    label: Text('Brand'),
                    icon: Icon(Icons.storefront_outlined, size: 18),
                  ),
                ],
                selected: {_role},
                onSelectionChanged: (s) => setState(() => _role = s.first),
              ),
              const SizedBox(height: 20),
              _field(
                controller: _name,
                label: 'Full name',
                autofill: AutofillHints.name,
                validator: (v) =>
                    (v ?? '').trim().isEmpty ? 'Enter your name' : null,
              ),
              if (_role == AccountRole.brand)
                _field(
                  controller: _company,
                  label: 'Company or brand name',
                  autofill: AutofillHints.organizationName,
                  validator: (v) => (v ?? '').trim().isEmpty
                      ? 'Enter your company name'
                      : null,
                ),
            ],
            _field(
              controller: _email,
              label: 'Email',
              keyboard: TextInputType.emailAddress,
              autofill: AutofillHints.email,
              validator: (v) {
                final value = (v ?? '').trim();
                return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)
                    ? null
                    : 'Enter a valid email';
              },
            ),
            _field(
              controller: _password,
              label: 'Password',
              obscure: _obscure,
              autofill: _signUp
                  ? AutofillHints.newPassword
                  : AutofillHints.password,
              suffix: IconButton(
                tooltip: _obscure ? 'Show password' : 'Hide password',
                icon: Icon(
                  _obscure
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  size: 20,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
              validator: (v) {
                if ((v ?? '').isEmpty) return 'Enter your password';
                if (_signUp && v!.length < 8) {
                  return 'Use at least 8 characters';
                }
                return null;
              },
              onSubmitted: _signUp ? null : (_) => _submit(),
            ),
            if (_signUp)
              _field(
                controller: _confirm,
                label: 'Confirm password',
                obscure: _obscure,
                autofill: AutofillHints.newPassword,
                validator: (v) =>
                    v != _password.text ? 'Passwords do not match' : null,
                onSubmitted: (_) => _submit(),
              ),
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDECEC),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFF5C2C2)),
                ),
                child: Text(
                  _error!,
                  style: AppText.sans(size: 14, color: const Color(0xFF9B1C1C)),
                ),
              ),
              const SizedBox(height: 16),
            ],
            const SizedBox(height: 4),
            SolidButton(
              label: _busy
                  ? 'Please wait…'
                  : (_signUp ? 'Create account' : 'Log in'),
              fullWidth: true,
              onPressed: _submit,
            ),
            const SizedBox(height: 20),
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  _signUp ? 'Already have an account?' : 'New to Shor?',
                  style: AppText.sans(size: 14, color: AppColors.textSecondary),
                ),
                TextButton(
                  onPressed: () =>
                      _switchMode(_signUp ? AuthMode.signIn : AuthMode.signUp),
                  child: Text(_signUp ? 'Log in' : 'Create an account'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String label,
    String? Function(String?)? validator,
    TextInputType? keyboard,
    String? autofill,
    bool obscure = false,
    Widget? suffix,
    ValueChanged<String>? onSubmitted,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(labelText: label, suffixIcon: suffix),
        validator: validator,
        keyboardType: keyboard,
        autofillHints: autofill == null ? null : [autofill],
        obscureText: obscure,
        enableSuggestions: !obscure,
        autocorrect: false,
        enabled: !_busy,
        textInputAction: onSubmitted != null
            ? TextInputAction.done
            : TextInputAction.next,
        onFieldSubmitted: onSubmitted,
      ),
    );
  }
}
