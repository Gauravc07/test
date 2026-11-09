import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../backend/instagram_service.dart';
import '../backend/marketplace_service.dart';
import '../config/app_config.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/marketplace_widgets.dart';
import 'brand/brand_account_tab.dart';
import 'brand/brand_campaigns_tab.dart';
import 'brand/discover_creators_tab.dart';
import 'brand/payments_tab.dart';
import 'creator/creator_profile_tab.dart';
import 'creator/discover_campaigns_tab.dart';
import 'creator/my_work_tab.dart';
import 'instagram_dashboard_page.dart';
import 'messages_tab.dart';
import 'notifications_page.dart';
import 'terms_page.dart';

enum HomeTab {
  // Creators
  campaigns,
  work,
  insights,
  // Brands
  brandCampaigns,
  creators,
  payments,
  // Both
  messages,
  profile,
}

/// Where signed-in users land: creator or brand tabs, depending on the
/// account type.
class HomeShell extends StatefulWidget {
  const HomeShell({
    super.key,
    this.auth,
    this.marketplace,
    this.instagram,
    this.initialTab,
    this.instagramNotice,
  });

  final AuthService? auth;
  final MarketplaceService? marketplace;
  final InstagramService? instagram;
  final HomeTab? initialTab;

  /// `?instagram=` result after returning from Instagram's login page.
  final ({String result, String? reason})? instagramNotice;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  AuthService get _auth => widget.auth ?? authService;
  late Future<Account> _account = _auth.loadAccount();

  Future<void> _signOut() async {
    try {
      await _auth.signOut();
    } on AuthFailure {
      // The local session is cleared even if the server call fails.
    }
    if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Account>(
      future: _account,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          final error = snapshot.error;
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ErrorPanel(
                    message: error is AuthFailure
                        ? error.message
                        : 'Please try again.',
                    onRetry: () {
                      final account = _auth.loadAccount();
                      setState(() {
                        _account = account;
                      });
                    },
                  ),
                  TextButton(onPressed: _signOut, child: const Text('Log out')),
                ],
              ),
            ),
          );
        }
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final account = snapshot.data!;
        // Nothing can be posted before the current terms are accepted.
        if (account.needsTerms) {
          return TermsAcceptancePage(
            auth: _auth,
            onSignOut: _signOut,
            onAccepted: () {
              final reloaded = _auth.loadAccount();
              setState(() {
                _account = reloaded;
              });
            },
          );
        }
        return _RoleShell(
          account: account,
          auth: widget.auth,
          marketplace: widget.marketplace,
          instagram: widget.instagram,
          initialTab: widget.initialTab,
          instagramNotice: widget.instagramNotice,
          onSignOut: _signOut,
        );
      },
    );
  }
}

class _TabSpec {
  const _TabSpec(this.tab, this.label, this.icon, this.selectedIcon);

  final HomeTab tab;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

const _creatorTabs = [
  _TabSpec(
    HomeTab.campaigns,
    'Campaigns',
    Icons.campaign_outlined,
    Icons.campaign,
  ),
  _TabSpec(HomeTab.work, 'My work', Icons.work_outline, Icons.work),
  _TabSpec(
    HomeTab.insights,
    'Insights',
    Icons.insights_outlined,
    Icons.insights,
  ),
  _TabSpec(
    HomeTab.messages,
    'Messages',
    Icons.chat_bubble_outline,
    Icons.chat_bubble,
  ),
  _TabSpec(HomeTab.profile, 'Profile', Icons.person_outline, Icons.person),
];

const _brandTabs = [
  _TabSpec(
    HomeTab.brandCampaigns,
    'Campaigns',
    Icons.campaign_outlined,
    Icons.campaign,
  ),
  _TabSpec(HomeTab.creators, 'Creators', Icons.groups_outlined, Icons.groups),
  _TabSpec(
    HomeTab.messages,
    'Messages',
    Icons.chat_bubble_outline,
    Icons.chat_bubble,
  ),
  _TabSpec(
    HomeTab.payments,
    'Payments',
    Icons.receipt_long_outlined,
    Icons.receipt_long,
  ),
  _TabSpec(
    HomeTab.profile,
    'Account',
    Icons.storefront_outlined,
    Icons.storefront,
  ),
];

class _RoleShell extends StatefulWidget {
  const _RoleShell({
    required this.account,
    required this.onSignOut,
    this.auth,
    this.marketplace,
    this.instagram,
    this.initialTab,
    this.instagramNotice,
  });

  final Account account;
  final VoidCallback onSignOut;
  final AuthService? auth;
  final MarketplaceService? marketplace;
  final InstagramService? instagram;
  final HomeTab? initialTab;
  final ({String result, String? reason})? instagramNotice;

  @override
  State<_RoleShell> createState() => _RoleShellState();
}

class _RoleShellState extends State<_RoleShell> {
  late final List<_TabSpec> _tabs = widget.account.role == AccountRole.brand
      ? _brandTabs
      : [
          for (final t in _creatorTabs)
            // Hidden in store builds until Meta approves the Instagram app.
            if (t.tab != HomeTab.insights || AppConfig.instagramEnabled) t,
        ];
  late int _index = () {
    final i = _tabs.indexWhere((t) => t.tab == widget.initialTab);
    return i < 0 ? 0 : i;
  }();

  /// Tabs are built the first time they are opened, then kept alive.
  late final Set<int> _built = {_index};

  void _select(HomeTab tab) {
    final i = _tabs.indexWhere((t) => t.tab == tab);
    if (i >= 0) _selectIndex(i);
  }

  void _selectIndex(int i) => setState(() {
    _index = i;
    _built.add(i);
  });

  Widget _page(HomeTab tab) => switch (tab) {
    HomeTab.campaigns => DiscoverCampaignsTab(service: widget.marketplace),
    HomeTab.work => MyWorkTab(
      service: widget.marketplace,
      onFindCampaigns: () => _select(HomeTab.campaigns),
    ),
    HomeTab.insights => InstagramDashboardPage(
      embedded: true,
      service: widget.instagram,
      returnNotice: widget.instagramNotice,
    ),
    HomeTab.brandCampaigns => BrandCampaignsTab(service: widget.marketplace),
    HomeTab.creators => DiscoverCreatorsTab(service: widget.marketplace),
    HomeTab.payments => PaymentsTab(service: widget.marketplace),
    HomeTab.messages => MessagesTab(service: widget.marketplace),
    HomeTab.profile =>
      widget.account.role == AccountRole.brand
          ? BrandAccountTab(
              account: widget.account,
              onSignOut: widget.onSignOut,
              auth: widget.auth,
              service: widget.marketplace,
            )
          : CreatorProfileTab(
              account: widget.account,
              onSignOut: widget.onSignOut,
              onOpenInsights: AppConfig.instagramEnabled
                  ? () => _select(HomeTab.insights)
                  : null,
              auth: widget.auth,
              service: widget.marketplace,
            ),
  };

  @override
  Widget build(BuildContext context) {
    final body = IndexedStack(
      index: _index,
      children: [
        for (var i = 0; i < _tabs.length; i++)
          _built.contains(i) ? _page(_tabs[i].tab) : const SizedBox.shrink(),
      ],
    );

    if (context.isMd) {
      return Scaffold(
        body: SafeArea(
          child: Row(
            children: [
              NavigationRail(
                selectedIndex: _index,
                onDestinationSelected: _selectIndex,
                labelType: NavigationRailLabelType.all,
                backgroundColor: AppColors.bgPrimary,
                indicatorColor: AppColors.accentSoft,
                selectedIconTheme: const IconThemeData(color: AppColors.accent),
                unselectedIconTheme: const IconThemeData(
                  color: AppColors.textSecondary,
                ),
                selectedLabelTextStyle: AppText.sans(
                  size: 12,
                  weight: FontWeight.w600,
                  color: AppColors.accent,
                ),
                unselectedLabelTextStyle: AppText.sans(
                  size: 12,
                  color: AppColors.textSecondary,
                ),
                leading: Padding(
                  padding: const EdgeInsets.only(top: 12, bottom: 20),
                  child: Column(
                    children: [
                      const Wordmark(),
                      const SizedBox(height: 6),
                      Text(
                        widget.account.role == AccountRole.brand
                            ? 'Brand'
                            : 'Creator',
                        style: AppText.label(),
                      ),
                    ],
                  ),
                ),
                trailing: Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: NotificationBell(service: widget.marketplace),
                ),
                destinations: [
                  for (final t in _tabs)
                    NavigationRailDestination(
                      icon: Icon(t.icon),
                      selectedIcon: Icon(t.selectedIcon),
                      label: Text(t.label),
                    ),
                ],
              ),
              const VerticalDivider(width: 1, color: AppColors.border),
              Expanded(child: body),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              height: 52,
              padding: const EdgeInsets.only(left: 16, right: 4),
              decoration: const BoxDecoration(
                color: AppColors.bgPrimary,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  const Wordmark(),
                  const Spacer(),
                  NotificationBell(service: widget.marketplace),
                ],
              ),
            ),
            Expanded(child: body),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: _selectIndex,
        backgroundColor: AppColors.bgCard,
        indicatorColor: AppColors.accentSoft,
        surfaceTintColor: Colors.transparent,
        height: 66,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: [
          for (final t in _tabs)
            NavigationDestination(
              icon: Icon(t.icon),
              selectedIcon: Icon(t.selectedIcon, color: AppColors.accent),
              label: t.label,
            ),
        ],
      ),
    );
  }
}
