import 'package:flutter/widgets.dart';

/// Breakpoints matching Tailwind's defaults so the layout behaves like the
/// original site.
class Breakpoints {
  Breakpoints._();

  static const double sm = 640;
  static const double md = 768;
  static const double lg = 1024;
  static const double xl = 1280;
}

extension ResponsiveContext on BuildContext {
  double get screenWidth => MediaQuery.sizeOf(this).width;
  double get screenHeight => MediaQuery.sizeOf(this).height;

  bool get isSm => screenWidth >= Breakpoints.sm;
  bool get isMd => screenWidth >= Breakpoints.md;
  bool get isLg => screenWidth >= Breakpoints.lg;
  bool get isXl => screenWidth >= Breakpoints.xl;

  /// Picks the value for the largest breakpoint that applies, falling back to
  /// smaller ones, like Tailwind's `base sm: md: lg: xl:` prefixes.
  T responsive<T>(T base, {T? sm, T? md, T? lg, T? xl}) {
    final w = screenWidth;
    if (w >= Breakpoints.xl) return xl ?? lg ?? md ?? sm ?? base;
    if (w >= Breakpoints.lg) return lg ?? md ?? sm ?? base;
    if (w >= Breakpoints.md) return md ?? sm ?? base;
    if (w >= Breakpoints.sm) return sm ?? base;
    return base;
  }

  /// Non-generic [responsive] for sizes. Safe to tear off as a shorthand
  /// (`final r = context.sized;`), which the generic version is not on web.
  double sized(double base, {double? sm, double? md, double? lg, double? xl}) =>
      responsive<double>(base, sm: sm, md: md, lg: lg, xl: xl);
}
