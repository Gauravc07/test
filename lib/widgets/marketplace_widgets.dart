import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../backend/marketplace_models.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import 'app_buttons.dart';

void showToast(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}

Future<bool> confirmAction(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false;
}

/// Asks for a line of text (e.g. feedback). Null when cancelled.
Future<String?> askText(
  BuildContext context, {
  required String title,
  required String label,
  required String confirmLabel,
  String? hint,
  bool required = true,
  int maxLines = 4,
}) {
  return showDialog<String>(
    context: context,
    builder: (context) => _TextPrompt(
      title: title,
      label: label,
      confirmLabel: confirmLabel,
      hint: hint,
      required: required,
      maxLines: maxLines,
    ),
  );
}

class _TextPrompt extends StatefulWidget {
  const _TextPrompt({
    required this.title,
    required this.label,
    required this.confirmLabel,
    required this.required,
    required this.maxLines,
    this.hint,
  });

  final String title;
  final String label;
  final String confirmLabel;
  final String? hint;
  final bool required;
  final int maxLines;

  @override
  State<_TextPrompt> createState() => _TextPromptState();
}

class _TextPromptState extends State<_TextPrompt> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 420,
          child: TextFormField(
            controller: _controller,
            autofocus: true,
            minLines: 2,
            maxLines: widget.maxLines,
            maxLength: 2000,
            decoration: InputDecoration(
              labelText: widget.label,
              hintText: widget.hint,
            ),
            validator: (v) =>
                widget.required && (v ?? '').trim().isEmpty ? 'Required' : null,
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState?.validate() ?? false) {
              Navigator.pop(context, _controller.text.trim());
            }
          },
          child: Text(widget.confirmLabel),
        ),
      ],
    );
  }
}

enum Tone { neutral, info, success, warning, danger }

({Color bg, Color fg}) toneColors(Tone tone) => switch (tone) {
  Tone.neutral => (bg: AppColors.bgSecondary, fg: AppColors.textSecondary),
  Tone.info => (bg: AppColors.accentSoft, fg: AppColors.accent),
  Tone.success => (bg: const Color(0xFFE6F4EA), fg: const Color(0xFF1E6B2E)),
  Tone.warning => (bg: const Color(0xFFFEF3D9), fg: const Color(0xFF7A4D00)),
  Tone.danger => (bg: const Color(0xFFFDECEC), fg: const Color(0xFF9B1C1C)),
};

/// A small status pill. The label always carries the meaning; colour only
/// reinforces it.
class StatusChip extends StatelessWidget {
  const StatusChip(
    this.label, {
    super.key,
    this.tone = Tone.neutral,
    this.icon,
  });

  final String label;
  final Tone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = toneColors(tone);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: c.bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: c.fg),
            const SizedBox(width: 4),
          ],
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppText.sans(
                size: 12,
                weight: FontWeight.w600,
                color: c.fg,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Tone collabTone(CollabStatus s) => switch (s) {
  CollabStatus.invited || CollabStatus.applied => Tone.info,
  CollabStatus.accepted || CollabStatus.inProgress => Tone.info,
  CollabStatus.awaitingApproval => Tone.warning,
  CollabStatus.completed => Tone.success,
  CollabStatus.declined || CollabStatus.cancelled => Tone.neutral,
};

Tone campaignTone(CampaignStatus s) => switch (s) {
  CampaignStatus.active => Tone.success,
  CampaignStatus.draft => Tone.neutral,
  CampaignStatus.paused => Tone.warning,
  CampaignStatus.completed || CampaignStatus.archived => Tone.neutral,
};

Tone invoiceTone(InvoiceStatus s) => switch (s) {
  InvoiceStatus.pending => Tone.warning,
  InvoiceStatus.approved => Tone.info,
  InvoiceStatus.paid => Tone.success,
  InvoiceStatus.rejected => Tone.danger,
};

/// White card with a hairline border.
class SectionCard extends StatelessWidget {
  const SectionCard({super.key, required this.child, this.padding, this.onTap});

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: padding ?? EdgeInsets.all(context.sized(16, md: 20)),
      child: child,
    );
    return Material(
      color: AppColors.bgCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: onTap == null ? content : InkWell(onTap: onTap, child: content),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.trailing});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(child: Text(text, style: AppText.heading(18))),
          ?trailing,
        ],
      ),
    );
  }
}

/// Title, subtitle and actions at the top of a tab.
class TabHeader extends StatelessWidget {
  const TabHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actions = const [],
  });

  final String title;
  final String? subtitle;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Wrap(
        spacing: 16,
        runSpacing: 12,
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.end,
        children: [
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 620),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: AppText.heading(context.sized(26, md: 30))),
                if (subtitle != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    subtitle!,
                    style: AppText.sans(
                      size: 15,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (actions.isNotEmpty)
            Wrap(spacing: 8, runSpacing: 8, children: actions),
        ],
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });

  final IconData icon;
  final String title;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 16),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: const BoxDecoration(
              color: AppColors.accentSoft,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.accent),
          ),
          const SizedBox(height: 14),
          Text(title, textAlign: TextAlign.center, style: AppText.heading(20)),
          const SizedBox(height: 6),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Text(
              message,
              textAlign: TextAlign.center,
              style: AppText.sans(size: 14, color: AppColors.textSecondary),
            ),
          ),
          if (action != null) ...[const SizedBox(height: 18), action!],
        ],
      ),
    );
  }
}

class ErrorPanel extends StatelessWidget {
  const ErrorPanel({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.cloud_off_outlined,
      title: 'Something went wrong',
      message: message,
      action: onRetry == null
          ? null
          : OutlineActionButton(label: 'Try again', onPressed: onRetry!),
    );
  }
}

const _loading = Padding(
  padding: EdgeInsets.symmetric(vertical: 56),
  child: Center(child: CircularProgressIndicator()),
);

/// Loads data, shows a spinner or an error with retry, and reloads when
/// [refresh] fires (e.g. after any marketplace change).
class AsyncView<T> extends StatefulWidget {
  const AsyncView({
    super.key,
    required this.load,
    required this.builder,
    this.refresh,
  });

  final Future<T> Function() load;
  final Widget Function(
    BuildContext context,
    T data,
    Future<void> Function() reload,
  )
  builder;
  final Listenable? refresh;

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  late Future<T> _future = widget.load();

  @override
  void initState() {
    super.initState();
    widget.refresh?.addListener(_onRefresh);
  }

  @override
  void didUpdateWidget(AsyncView<T> old) {
    super.didUpdateWidget(old);
    if (old.refresh != widget.refresh) {
      old.refresh?.removeListener(_onRefresh);
      widget.refresh?.addListener(_onRefresh);
    }
  }

  @override
  void dispose() {
    widget.refresh?.removeListener(_onRefresh);
    super.dispose();
  }

  // Block bodies: an arrow body would hand setState the Future it assigns.
  void _onRefresh() {
    if (!mounted) return;
    final future = widget.load();
    setState(() {
      _future = future;
    });
  }

  Future<void> _reload() async {
    final future = widget.load();
    setState(() {
      _future = future;
    });
    try {
      await future;
    } catch (_) {
      // Shown by the builder below.
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          final error = snapshot.error;
          return ErrorPanel(
            message: error is MarketplaceFailure
                ? error.message
                : 'Please try again.',
            onRetry: _reload,
          );
        }
        if (!snapshot.hasData) return _loading;
        return widget.builder(context, snapshot.data as T, _reload);
      },
    );
  }
}

/// A scrolling page body, centred with a maximum width.
class PageList extends StatelessWidget {
  const PageList({
    super.key,
    required this.children,
    this.maxWidth = 1000,
    this.onRefresh,
  });

  final List<Widget> children;
  final double maxWidth;
  final Future<void> Function()? onRefresh;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final side = math.max(16.0, (c.maxWidth - maxWidth) / 2);
        final list = ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.fromLTRB(side, 24, side, 48),
          children: children,
        );
        return onRefresh == null
            ? list
            : RefreshIndicator(onRefresh: onRefresh!, child: list);
      },
    );
  }
}

/// Scaffold for pages pushed on top of the home tabs.
class ShorPage extends StatelessWidget {
  const ShorPage({
    super.key,
    required this.title,
    required this.body,
    this.actions = const [],
    this.bottomBar,
  });

  final String title;
  final Widget body;
  final List<Widget> actions;
  final Widget? bottomBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: AppText.heading(18)),
        backgroundColor: AppColors.bgPrimary,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        scrolledUnderElevation: 0,
        actions: actions,
        shape: const Border(bottom: BorderSide(color: AppColors.border)),
      ),
      body: body,
      bottomNavigationBar: bottomBar,
    );
  }
}

/// Fixed action area at the bottom of a page.
class BottomActions extends StatelessWidget {
  const BottomActions({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgCard,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1000),
              child: Wrap(
                alignment: WrapAlignment.end,
                spacing: 10,
                runSpacing: 10,
                children: children,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class Avatar extends StatelessWidget {
  const Avatar({super.key, required this.name, this.imageUrl, this.size = 40});

  final String name;
  final String? imageUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    final clean = name.replaceAll('@', '').trim();
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: AppColors.accentSoft,
      foregroundImage: imageUrl == null ? null : NetworkImage(imageUrl!),
      onForegroundImageError: imageUrl == null ? null : (_, _) {},
      child: Text(
        clean.isEmpty ? '?' : clean[0].toUpperCase(),
        style: AppText.sans(
          size: size * 0.4,
          weight: FontWeight.w700,
          color: AppColors.accent,
        ),
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow(this.label, this.value, {super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: AppText.sans(size: 14, color: AppColors.textMuted),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppText.sans(size: 14, weight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

/// A labelled number, for summaries and reports.
class MetricTile extends StatelessWidget {
  const MetricTile({
    super.key,
    required this.label,
    required this.value,
    this.caption,
  });

  final String label;
  final String value;
  final String? caption;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: AppText.label()),
          const SizedBox(height: 6),
          Text(value, style: AppText.heading(26)),
          if (caption != null) ...[
            const SizedBox(height: 2),
            Text(
              caption!,
              style: AppText.sans(size: 12, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }
}

/// A quiet paragraph of explanatory text.
class Note extends StatelessWidget {
  const Note(this.text, {super.key, this.icon = Icons.info_outline});

  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: AppText.sans(size: 13, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

/// A bordered dropdown for filter rows.
class FilterDropdown<T> extends StatelessWidget {
  const FilterDropdown({
    super.key,
    required this.value,
    required this.items,
    required this.onChanged,
    this.label,
  });

  final T value;
  final Map<T, String> items;
  final ValueChanged<T> onChanged;

  /// Read by screen readers.
  final String? label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      child: Container(
        height: 40,
        padding: const EdgeInsets.only(left: 12, right: 6),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderStrong),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<T>(
            value: value,
            isDense: true,
            borderRadius: BorderRadius.circular(8),
            style: AppText.sans(size: 14),
            icon: const Icon(Icons.expand_more, size: 18),
            items: [
              for (final e in items.entries)
                DropdownMenuItem<T>(value: e.key, child: Text(e.value)),
            ],
            onChanged: (v) => onChanged(v as T),
          ),
        ),
      ),
    );
  }
}

/// Compact solid button for inline actions.
class SmallButton extends StatelessWidget {
  const SmallButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.outlined = false,
  });

  final String label;
  final VoidCallback onPressed;
  final bool outlined;

  @override
  Widget build(BuildContext context) {
    const padding = EdgeInsets.symmetric(horizontal: 14, vertical: 9);
    return outlined
        ? OutlineActionButton(
            label: label,
            fontSize: 13,
            padding: padding,
            onPressed: onPressed,
          )
        : SolidButton(
            label: label,
            fontSize: 13,
            padding: padding,
            onPressed: onPressed,
          );
  }
}
