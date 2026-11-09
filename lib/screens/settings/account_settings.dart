import 'package:flutter/material.dart';

import '../../backend/auth_service.dart';
import '../../backend/marketplace_service.dart';
import '../../config/app_config.dart';
import '../../config/pricing.dart';
import '../../sections/pricing_section.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/links.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';

/// Help, legal pages, blocked accounts and account deletion. Shown on the
/// creator Profile and brand Account tabs.
class AccountSettingsSection extends StatelessWidget {
  const AccountSettingsSection({
    super.key,
    this.auth,
    this.marketplace,
    required this.onSignOut,
    this.pricingAudience = PlanAudience.brand,
  });

  final AuthService? auth;

  /// Which plans "Plans and pricing" opens on.
  final PlanAudience pricingAudience;
  final MarketplaceService? marketplace;
  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    Widget tile(
      IconData icon,
      String title,
      VoidCallback onTap, {
      String? subtitle,
      Color? color,
    }) => ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4),
      leading: Icon(icon, color: color ?? AppColors.textSecondary),
      title: Text(
        title,
        style: AppText.sans(
          size: 15,
          weight: FontWeight.w500,
          color: color ?? AppColors.textPrimary,
        ),
      ),
      subtitle: subtitle == null
          ? null
          : Text(
              subtitle,
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            ),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
      onTap: onTap,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionTitle('Help and settings'),
        SectionCard(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Column(
            children: [
              EmailNotificationsSwitch(service: marketplace),
              tile(
                Icons.sell_outlined,
                'Plans and pricing',
                () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => PricingPage(audience: pricingAudience),
                  ),
                ),
              ),
              tile(
                Icons.help_outline,
                'Help and support',
                () => openInAppBrowser(AppConfig.supportUrl),
                subtitle: AppConfig.supportEmail,
              ),
              tile(
                Icons.mail_outline,
                'Email support',
                () => openInAppBrowser(AppConfig.supportMailto),
              ),
              tile(
                Icons.privacy_tip_outlined,
                'Privacy policy',
                () => openInAppBrowser(AppConfig.privacyPolicyUrl),
              ),
              tile(
                Icons.gavel_outlined,
                'Terms of use',
                () => openInAppBrowser(AppConfig.termsUrl),
              ),
              tile(
                Icons.block,
                'Blocked accounts',
                () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => BlockedAccountsPage(service: marketplace),
                  ),
                ),
              ),
              tile(Icons.logout, 'Log out', onSignOut),
              tile(
                Icons.delete_outline,
                'Delete account',
                () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => DeleteAccountPage(auth: auth),
                  ),
                ),
                color: const Color(0xFF9B1C1C),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Turns notification emails on or off. In-app notifications always show.
class EmailNotificationsSwitch extends StatefulWidget {
  const EmailNotificationsSwitch({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<EmailNotificationsSwitch> createState() =>
      _EmailNotificationsSwitchState();
}

class _EmailNotificationsSwitchState extends State<EmailNotificationsSwitch> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  bool? _on;

  @override
  void initState() {
    super.initState();
    _service.emailNotifications().then(
      (v) {
        if (mounted) setState(() => _on = v);
      },
      onError: (_) {
        if (mounted) setState(() => _on = true);
      },
    );
  }

  Future<void> _set(bool v) async {
    final before = _on;
    setState(() => _on = v);
    try {
      await _service.setEmailNotifications(v);
      if (mounted) {
        showToast(
          context,
          v
              ? 'We’ll email you about anything you miss.'
              : 'Emails off. You’ll still see notifications in the app.',
        );
      }
    } on MarketplaceFailure catch (e) {
      if (!mounted) return;
      setState(() => _on = before);
      showToast(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      key: const ValueKey('email-notifications'),
      contentPadding: const EdgeInsets.symmetric(horizontal: 4),
      secondary: const Icon(
        Icons.notifications_active_outlined,
        color: AppColors.textSecondary,
      ),
      title: Text(
        'Email notifications',
        style: AppText.sans(size: 15, weight: FontWeight.w500),
      ),
      subtitle: Text(
        'Invites, approvals, invoices and messages you haven’t seen within a few minutes',
        style: AppText.sans(size: 13, color: AppColors.textMuted),
      ),
      value: _on ?? true,
      onChanged: _on == null ? null : _set,
    );
  }
}

class BlockedAccountsPage extends StatelessWidget {
  const BlockedAccountsPage({super.key, this.service});

  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'Blocked accounts',
      body: PageList(
        maxWidth: 720,
        children: [
          AsyncView<List<BlockedUser>>(
            refresh: marketplaceRevision,
            load: _service.blockedUsers,
            builder: (context, blocked, reload) {
              if (blocked.isEmpty) {
                return const EmptyState(
                  icon: Icons.verified_user_outlined,
                  title: 'You haven’t blocked anyone',
                  message:
                      'Block someone from their profile, a campaign or a chat. '
                      'They can’t contact you and you won’t see their content.',
                );
              }
              return Column(
                children: [
                  for (final b in blocked) ...[
                    SectionCard(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      child: Row(
                        children: [
                          Avatar(name: b.name, size: 38),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  b.name,
                                  style: AppText.sans(
                                    size: 15,
                                    weight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  'Blocked ${timeAgo(b.blockedAt)}',
                                  style: AppText.sans(
                                    size: 12,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SmallButton(
                            label: 'Unblock',
                            outlined: true,
                            onPressed: () async {
                              try {
                                await _service.unblock(b.id);
                                if (context.mounted) {
                                  showToast(context, '${b.name} is unblocked.');
                                }
                              } on MarketplaceFailure catch (e) {
                                if (context.mounted) {
                                  showToast(context, e.message);
                                }
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

/// Permanently deletes the account after the person types DELETE.
class DeleteAccountPage extends StatefulWidget {
  const DeleteAccountPage({super.key, this.auth});

  final AuthService? auth;

  @override
  State<DeleteAccountPage> createState() => _DeleteAccountPageState();
}

class _DeleteAccountPageState extends State<DeleteAccountPage> {
  final _confirm = TextEditingController();
  bool _busy = false;
  String? _error;

  AuthService get _auth => widget.auth ?? authService;

  @override
  void dispose() {
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _delete() async {
    if (_busy) return;
    if (_confirm.text.trim() != 'DELETE') {
      setState(() => _error = 'Type DELETE in capitals to confirm.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await _auth.deleteAccount();
      navigator.popUntil((route) => route.isFirst);
      messenger.showSnackBar(
        const SnackBar(content: Text('Your Shor account has been deleted.')),
      );
    } on AuthFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget point(String text) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 7, right: 10),
            child: Icon(Icons.circle, size: 6, color: AppColors.textSecondary),
          ),
          Expanded(
            child: Text(text, style: AppText.sans(size: 15, height: 1.45)),
          ),
        ],
      ),
    );

    return ShorPage(
      title: 'Delete account',
      body: PageList(
        maxWidth: 640,
        children: [
          Text('Delete your Shor account', style: AppText.heading(26)),
          const SizedBox(height: 12),
          Text(
            'This is permanent and can’t be undone. We delete:',
            style: AppText.sans(size: 15, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          point('Your login, profile and settings.'),
          point(
            'Your campaigns or collaborations, drafts, submissions and messages.',
          ),
          point('Your Instagram connection and all insights Shor stored.'),
          point('Your lists, blocks and reports.'),
          const SizedBox(height: 12),
          Text(
            'We keep invoices for the other party’s records, without your '
            'name or contact details, as required for accounting.',
            style: AppText.sans(size: 15, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _confirm,
            enabled: !_busy,
            autocorrect: false,
            decoration: const InputDecoration(
              labelText: 'Type DELETE to confirm',
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 10),
            Text(
              _error!,
              style: AppText.sans(size: 14, color: const Color(0xFF9B1C1C)),
            ),
          ],
          const SizedBox(height: 20),
          SolidButton(
            label: _busy ? 'Deleting…' : 'Delete my account',
            color: const Color(0xFFB42318),
            hoverColor: const Color(0xFF912018),
            fullWidth: true,
            onPressed: _delete,
          ),
        ],
      ),
    );
  }
}
