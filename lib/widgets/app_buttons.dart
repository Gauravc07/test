import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text.dart';

/// Solid rectangular button with an optional arrow that nudges right on
/// hover. Defaults to the navy-blue accent.
class SolidButton extends StatefulWidget {
  const SolidButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.color = AppColors.accent,
    this.hoverColor = AppColors.accentHover,
    this.fontSize = 15,
    this.padding = const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
    this.fullWidth = false,
    this.showArrow = false,
  });

  /// Deep navy variant.
  const SolidButton.navy({
    super.key,
    required this.label,
    required this.onPressed,
    this.fontSize = 15,
    this.padding = const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
    this.fullWidth = false,
    this.showArrow = false,
  }) : color = AppColors.navy,
       hoverColor = const Color(0xFF16253F);

  final String label;
  final VoidCallback onPressed;
  final Color color;
  final Color hoverColor;
  final double fontSize;
  final EdgeInsetsGeometry padding;
  final bool fullWidth;
  final bool showArrow;

  @override
  State<SolidButton> createState() => _SolidButtonState();
}

class _SolidButtonState extends State<SolidButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final textStyle = AppText.sans(
      size: widget.fontSize,
      weight: FontWeight.w600,
      color: Colors.white,
    );
    return _Pressable(
      label: widget.label,
      onTap: widget.onPressed,
      onHover: (value) => setState(() => _hovered = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: widget.fullWidth ? double.infinity : null,
        padding: widget.padding,
        decoration: BoxDecoration(
          color: _hovered ? widget.hoverColor : widget.color,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Flexible(
              child: Text(
                widget.label,
                textAlign: TextAlign.center,
                style: textStyle,
              ),
            ),
            if (widget.showArrow) ...[
              const SizedBox(width: 8),
              AnimatedSlide(
                offset: Offset(_hovered ? 0.25 : 0, 0),
                duration: const Duration(milliseconds: 200),
                child: Icon(
                  Icons.arrow_forward,
                  size: widget.fontSize + 2,
                  color: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Bordered secondary button. [onDark] switches to light colours for use on
/// navy backgrounds.
class OutlineActionButton extends StatefulWidget {
  const OutlineActionButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.fontSize = 15,
    this.padding = const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
    this.fullWidth = false,
    this.trailingIcon,
    this.onDark = false,
  });

  final String label;
  final VoidCallback onPressed;
  final double fontSize;
  final EdgeInsetsGeometry padding;
  final bool fullWidth;
  final IconData? trailingIcon;
  final bool onDark;

  @override
  State<OutlineActionButton> createState() => _OutlineActionButtonState();
}

class _OutlineActionButtonState extends State<OutlineActionButton> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final fg = widget.onDark ? Colors.white : AppColors.textPrimary;
    final border = widget.onDark
        ? AppColors.white(0.25)
        : AppColors.borderStrong;
    final hoverFill = widget.onDark ? AppColors.white(0.08) : AppColors.bgHover;
    return _Pressable(
      label: widget.label,
      onTap: widget.onPressed,
      onHover: (value) => setState(() => _hovered = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: widget.fullWidth ? double.infinity : null,
        padding: widget.padding,
        decoration: BoxDecoration(
          color: _hovered
              ? hoverFill
              : (widget.onDark ? AppColors.white(0.04) : AppColors.bgCard),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: _hovered && !widget.onDark ? AppColors.navy : border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Flexible(
              child: Text(
                widget.label,
                textAlign: TextAlign.center,
                style: AppText.sans(
                  size: widget.fontSize,
                  weight: FontWeight.w600,
                  color: fg,
                ),
              ),
            ),
            if (widget.trailingIcon != null) ...[
              const SizedBox(width: 8),
              Icon(widget.trailingIcon, size: widget.fontSize + 1, color: fg),
            ],
          ],
        ),
      ),
    );
  }
}

/// Shared hover, cursor, tap and semantics wrapper for the buttons above.
class _Pressable extends StatelessWidget {
  const _Pressable({
    required this.label,
    required this.onTap,
    required this.onHover,
    required this.child,
  });

  final String label;
  final VoidCallback onTap;
  final ValueChanged<bool> onHover;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      excludeSemantics: true,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => onHover(true),
        onExit: (_) => onHover(false),
        child: GestureDetector(onTap: onTap, child: child),
      ),
    );
  }
}
