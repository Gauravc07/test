import 'package:flutter/material.dart';

/// Editorial light palette: warm off-white surfaces, navy ink, and a single
/// dark navy-blue accent used sparingly for emphasis.
class AppColors {
  AppColors._();

  // Surfaces.
  static const bgPrimary = Color(0xFFFAFAF8);
  static const bgSecondary = Color(0xFFF4F1EC);
  static const bgCard = Color(0xFFFFFFFF);
  static const bgHover = Color(0xFFF5F3EF);

  /// Deep navy used for headings, dark sections, and the footer.
  static const navy = Color(0xFF0A1628);

  /// Slightly lifted navy for cards that sit on [navy] backgrounds.
  static const navyRaised = Color(0xFF13213A);

  // Text.
  static const textPrimary = navy;
  static const textSecondary = Color(0xFF4A5568);
  static const textMuted = Color(0xFF8896A8);
  static const textInverse = Colors.white;

  // Accent: dark navy blue.
  static const accent = Color(0xFF1E3A8A);
  static const accentHover = Color(0xFF172E6E);

  /// Pale wash of the accent for chips and highlights on light surfaces.
  static const accentSoft = Color(0xFFE6EBF5);

  /// Lighter navy tint so accents stay visible on dark navy backgrounds.
  static const accentOnDark = Color(0xFF8FA6D8);

  // Borders.
  static const border = Color(0xFFE8E4DE);
  static const borderStrong = Color(0xFFD4CFC8);

  // Sticky-note yellow for the "before" collage.
  static const note = Color(0xFFFDF6DD);
  static const noteBorder = Color(0xFFF1E4B3);

  static Color white(double opacity) => Colors.white.withValues(alpha: opacity);
  static Color navyAlpha(double opacity) => navy.withValues(alpha: opacity);
}
