import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Type system: Source Serif 4 for editorial headlines and body copy,
/// DM Sans for interface text, section headings, and labels.
class AppText {
  AppText._();

  /// Tests turn this off so no fonts are fetched from the network.
  static bool useGoogleFonts = true;

  static TextStyle _font(
    TextStyle Function({
      double? fontSize,
      FontWeight? fontWeight,
      FontStyle? fontStyle,
      Color? color,
      double? height,
      double? letterSpacing,
    })
    google,
    TextStyle style,
  ) {
    if (!useGoogleFonts) return style;
    return google(
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      color: style.color,
      height: style.height,
      letterSpacing: style.letterSpacing,
    );
  }

  static TextStyle _serif({
    double? fontSize,
    FontWeight? fontWeight,
    FontStyle? fontStyle,
    Color? color,
    double? height,
    double? letterSpacing,
  }) => GoogleFonts.sourceSerif4(
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    color: color,
    height: height,
    letterSpacing: letterSpacing,
  );

  static TextStyle _sans({
    double? fontSize,
    FontWeight? fontWeight,
    FontStyle? fontStyle,
    Color? color,
    double? height,
    double? letterSpacing,
  }) => GoogleFonts.dmSans(
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    color: color,
    height: height,
    letterSpacing: letterSpacing,
  );

  static TextStyle serif({
    double size = 18,
    FontWeight weight = FontWeight.w400,
    FontStyle style = FontStyle.normal,
    Color color = AppColors.textSecondary,
    double height = 1.7,
    double letterSpacing = 0,
  }) {
    return _font(
      _serif,
      TextStyle(
        fontSize: size,
        fontWeight: weight,
        fontStyle: style,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      ),
    );
  }

  static TextStyle sans({
    double size = 15,
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.textPrimary,
    double height = 1.4,
    double letterSpacing = 0,
  }) {
    return _font(
      _sans,
      TextStyle(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      ),
    );
  }

  /// Small uppercase tracked label, e.g. "FOR CREATORS".
  static TextStyle label({
    Color color = AppColors.textMuted,
    double size = 11,
  }) {
    return _font(
      _sans,
      TextStyle(
        fontSize: size,
        fontWeight: FontWeight.w600,
        color: color,
        height: 1.4,
        letterSpacing: size * 0.14,
      ),
    );
  }

  /// Large section heading in DM Sans with tight tracking.
  static TextStyle heading(double size, {Color color = AppColors.textPrimary}) {
    return _font(
      _sans,
      TextStyle(
        fontSize: size,
        fontWeight: FontWeight.w500,
        color: color,
        height: 1.15,
        letterSpacing: -size * 0.025,
      ),
    );
  }
}
