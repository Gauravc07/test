import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../widgets/choice_toggle.dart';
import '../../widgets/marketplace_widgets.dart';
import '../collaboration_page.dart';

/// Creator side: invitations, applications and campaigns in progress.
class MyWorkTab extends StatefulWidget {
  const MyWorkTab({super.key, this.service, this.onFindCampaigns});

  final MarketplaceService? service;

  /// Switches to the campaign feed.
  final VoidCallback? onFindCampaigns;

  @override
  State<MyWorkTab> createState() => _MyWorkTabState();
}

enum _Group { active, invites, applied, done }

class _MyWorkTabState extends State<MyWorkTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  _Group? _group;
  int _version = 0;

  static bool _inGroup(Collaboration c, _Group g) => switch (g) {
    _Group.active => c.status.isActive,
    _Group.invites => c.status == CollabStatus.invited,
    _Group.applied => c.status == CollabStatus.applied,
    _Group.done => c.status.isClosed,
  };

  @override
  Widget build(BuildContext context) {
    return PageList(
      maxWidth: 860,
      onRefresh: () async => setState(() => _version++),
      children: [
        const TabHeader(
          title: 'My collaborations',
          subtitle:
              'Invitations, applications and the campaigns you are working on.',
        ),
        AsyncView<List<Collaboration>>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _service.myCollaborations,
          builder: (context, all, reload) {
            if (all.isEmpty) {
              return EmptyState(
                icon: Icons.work_outline,
                title: 'Nothing here yet',
                message:
                    'Apply to a campaign or wait for a brand to invite you. '
                    'Everything you work on shows up here.',
                action: widget.onFindCampaigns == null
                    ? null
                    : SmallButton(
                        label: 'Find campaigns',
                        onPressed: widget.onFindCampaigns!,
                      ),
              );
            }
            final counts = {
              for (final g in _Group.values)
                g: all.where((c) => _inGroup(c, g)).length,
            };
            // Start on whatever needs attention.
            final group =
                _group ??
                (counts[_Group.invites]! > 0
                    ? _Group.invites
                    : counts[_Group.active]! > 0
                    ? _Group.active
                    : counts[_Group.applied]! > 0
                    ? _Group.applied
                    : _Group.done);
            final shown = all.where((c) => _inGroup(c, group)).toList();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: ChoiceToggle<_Group>(
                    key: const ValueKey('work-groups'),
                    options: {
                      _Group.active: 'Active (${counts[_Group.active]})',
                      _Group.invites: 'Invites (${counts[_Group.invites]})',
                      _Group.applied: 'Applied (${counts[_Group.applied]})',
                      _Group.done: 'Done (${counts[_Group.done]})',
                    },
                    selected: group,
                    onChanged: (g) => setState(() => _group = g),
                  ),
                ),
                const SizedBox(height: 16),
                if (shown.isEmpty)
                  const EmptyState(
                    icon: Icons.inbox_outlined,
                    title: 'Nothing in this list',
                    message: 'Check the other lists above.',
                  )
                else
                  for (final c in shown) ...[
                    CollabTile(
                      collaboration: c,
                      brandView: false,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => CollaborationPage(
                            collaborationId: c.id,
                            service: widget.service,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
              ],
            );
          },
        ),
      ],
    );
  }
}
