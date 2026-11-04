import 'package:flutter/material.dart';

/// Placeholder action for links to pages that have not been rebuilt in
/// Flutter yet. Only the landing page exists for now.
void showComingSoon(BuildContext context, String label) {
  final width = MediaQuery.sizeOf(context).width;
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text('$label is coming soon.'),
        duration: const Duration(seconds: 2),
        width: width > 400 ? 360 : null,
      ),
    );
}
