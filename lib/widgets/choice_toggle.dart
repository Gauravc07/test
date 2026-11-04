import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text.dart';

/// Compact single-choice toggle (e.g. "7 days | 28 days"). Each option is
/// as wide as its label, so labels never wrap.
class ChoiceToggle<T> extends StatelessWidget {
  const ChoiceToggle({
    super.key,
    required this.options,
    required this.selected,
    required this.onChanged,
  });

  /// Value → label, in display order.
  final Map<T, String> options;
  final T selected;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    final entries = options.entries.toList();
    // Shrinks rather than overflows on very narrow screens.
    return FittedBox(
      fit: BoxFit.scaleDown,
      alignment: Alignment.centerLeft,
      child: _buildToggle(entries),
    );
  }

  Widget _buildToggle(List<MapEntry<T, String>> entries) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final e in entries)
            Semantics(
              button: true,
              selected: e.key == selected,
              label: e.value,
              excludeSemantics: true,
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () => onChanged(e.key),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: e.key == selected
                          ? AppColors.navy
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      e.value,
                      maxLines: 1,
                      softWrap: false,
                      style: AppText.sans(
                        size: 13,
                        weight: FontWeight.w600,
                        color: e.key == selected
                            ? Colors.white
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
