import 'package:flutter/material.dart';

import '../../backend/auth_service.dart';
import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';

/// Brand side: the company profile creators see, and log out.
class BrandAccountTab extends StatelessWidget {
  const BrandAccountTab({
    super.key,
    required this.account,
    required this.onSignOut,
    this.service,
  });

  final Account account;
  final VoidCallback onSignOut;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  @override
  Widget build(BuildContext context) {
    return PageList(
      maxWidth: 760,
      children: [
        const TabHeader(
          title: 'Brand profile',
          subtitle: 'Creators see this on your campaigns and invitations.',
        ),
        AsyncView<BrandProfileData>(
          load: _service.myBrandProfile,
          builder: (context, profile, reload) => _BrandForm(
            profile: profile,
            email: account.email,
            service: _service,
          ),
        ),
        const SizedBox(height: 24),
        Align(
          alignment: Alignment.centerLeft,
          child: OutlineActionButton(
            label: 'Log out',
            trailingIcon: Icons.logout,
            onPressed: onSignOut,
          ),
        ),
      ],
    );
  }
}

class _BrandForm extends StatefulWidget {
  const _BrandForm({
    required this.profile,
    required this.email,
    required this.service,
  });

  final BrandProfileData profile;
  final String email;
  final MarketplaceService service;

  @override
  State<_BrandForm> createState() => _BrandFormState();
}

class _BrandFormState extends State<_BrandForm> {
  final _formKey = GlobalKey<FormState>();
  late final _company = TextEditingController(text: widget.profile.companyName);
  late final _website = TextEditingController(
    text: widget.profile.website ?? '',
  );
  late final _industry = TextEditingController(
    text: widget.profile.industry ?? '',
  );
  late final _about = TextEditingController(
    text: widget.profile.description ?? '',
  );
  bool _busy = false;

  @override
  void dispose() {
    for (final c in [_company, _website, _industry, _about]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (_busy || !(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await widget.service.saveBrandProfile(
        BrandProfileData(
          companyName: _company.text,
          website: _website.text,
          industry: _industry.text,
          description: _about.text,
        ),
      );
      if (mounted) showToast(context, 'Brand profile saved.');
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _company,
              maxLength: 160,
              decoration: const InputDecoration(
                labelText: 'Company or brand name',
              ),
              validator: (v) =>
                  (v ?? '').trim().isEmpty ? 'Enter your brand name' : null,
            ),
            const SizedBox(height: 4),
            TextFormField(
              controller: _website,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                labelText: 'Website',
                hintText: 'https://',
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _industry,
              decoration: const InputDecoration(
                labelText: 'Industry',
                hintText: 'e.g. Skincare, D2C fashion, Fintech',
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _about,
              minLines: 3,
              maxLines: 6,
              maxLength: 2000,
              decoration: const InputDecoration(
                labelText: 'About the brand',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Signed in as ${widget.email}',
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerLeft,
              child: SolidButton(
                label: _busy ? 'Saving…' : 'Save profile',
                onPressed: _save,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
