import 'dart:async';

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
import 'home_tab.dart';
import 'notifications_page.dart';
import 'terms_page.dart';

enum HomeTab {
  // Both, first
  home,
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

const _homeTab = _TabSpec(
  HomeTab.home,
  'Home',
  Icons.home_outlined,
  Icons.home,
);

const _creatorTabs = [
  _homeTab,
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
  _homeTab,
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
  /// Chats with unread messages, for the Messages tab badge. One message
  /// notification exists per unread chat.
  final _unreadChats = ValueNotifier<int>(0);
  StreamSubscription<List<AppNotification>>? _notes;

  @override
  void initState() {
    super.initState();
    _notes = (widget.marketplace ?? marketplaceService).notifications().listen(
      (notes) => _unreadChats.value = notes
          .where((n) => n.kind == 'message' && n.unread)
          .length,
      onError: (_) {},
    );
  }

  @override
  void dispose() {
    _notes?.cancel();
    _unreadChats.dispose();
    super.dispose();
  }

  int _badge(HomeTab tab) => tab == HomeTab.messages ? _unreadChats.value : 0;

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

  void _go(HomeDestination d) => _select(switch (d) {
    HomeDestination.campaigns => HomeTab.campaigns,
    HomeDestination.creators => HomeTab.creators,
    HomeDestination.work => HomeTab.work,
    HomeDestination.messages => HomeTab.messages,
    HomeDestination.payments => HomeTab.payments,
    HomeDestination.profile => HomeTab.profile,
  });

  Widget _page(HomeTab tab) => switch (tab) {
    HomeTab.home => HomeDashboard(
      account: widget.account,
      service: widget.marketplace,
      onGo: _go,
    ),
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
  Widget build(BuildContext context) => ValueListenableBuilder<int>(
    valueListenable: _unreadChats,
    builder: (context, _, _) => _buildShell(context),
  );

  Widget _buildShell(BuildContext context) {
    final body = IndexedStack(
      index: _index,
      children: [
        for (var i = 0; i < _tabs.length; i++)
          _built.contains(i) ? _page(_tabs[i].tab) : const SizedBox.shrink(),
      ],
    );

    if (context.isMd) {
      return Scaffold(
        backgroundColor: AppColors.appBg,
        body: SafeArea(
          child: Row(
            children: [
              NavigationRail(
                selectedIndex: _index,
                onDestinationSelected: _selectIndex,
                labelType: NavigationRailLabelType.all,
                backgroundColor: AppColors.appBg,
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
                      icon: _CountBadge(
                        count: _badge(t.tab),
                        child: Icon(t.icon),
                      ),
                      selectedIcon: _CountBadge(
                        count: _badge(t.tab),
                        child: Icon(t.selectedIcon),
                      ),
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

    final onHome = _tabs[_index].tab == HomeTab.home;
    return Scaffold(
      backgroundColor: AppColors.appBg,
      // Content scrolls behind the floating bar; PageList pads for it.
      extendBody: true,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            if (!onHome)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
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
      bottomNavigationBar: _FloatingNavBar(
        tabs: _tabs,
        index: _index,
        onSelect: _selectIndex,
        badge: _badge,
      ),
    );
  }
}

/// Navy pill floating above the content, one round button per tab. The
/// selected tab is a white disc. Labels are read out and shown as tooltips.
class _FloatingNavBar extends StatelessWidget {
  const _FloatingNavBar({
    required this.tabs,
    required this.index,
    required this.onSelect,
    required this.badge,
  });

  final List<_TabSpec> tabs;
  final int index;
  final ValueChanged<int> onSelect;
  final int Function(HomeTab) badge;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        child: Center(
          heightFactor: 1,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Container(
              height: 66,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              decoration: BoxDecoration(
                color: AppColors.navy,
                borderRadius: BorderRadius.circular(999),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.navyAlpha(0.3),
                    blurRadius: 24,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  for (var i = 0; i < tabs.length; i++)
                    _NavButton(
                      spec: tabs[i],
                      selected: i == index,
                      count: badge(tabs[i].tab),
                      onTap: () => onSelect(i),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.spec,
    required this.selected,
    required this.onTap,
    this.count = 0,
  });

  final _TabSpec spec;
  final bool selected;
  final VoidCallback onTap;

  /// Unread items, shown as a dot with a number.
  final int count;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: count > 0 ? '${spec.label}, $count unread' : spec.label,
      excludeSemantics: true,
      child: Tooltip(
        message: spec.label,
        child: InkResponse(
          onTap: onTap,
          radius: 28,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: selected ? Colors.white : AppColors.white(0.04),
              border: Border.all(
                color: selected ? Colors.white : AppColors.white(0.14),
              ),
            ),
            child: _CountBadge(
              count: count,
              child: Icon(
                selected ? spec.selectedIcon : spec.icon,
                size: 22,
                color: selected ? AppColors.navy : AppColors.white(0.85),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CountBadge extends StatelessWidget {
  const _CountBadge({required this.count, required this.child});

  final int count;
  final Widget child;

  @override
  Widget build(BuildContext context) => Badge(
    isLabelVisible: count > 0,
    backgroundColor: const Color(0xFFE5484D),
    label: Text(count > 9 ? '9+' : '$count'),
    child: child,
  );
}
