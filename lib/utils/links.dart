import 'package:url_launcher/url_launcher.dart';

/// Opens an external page. Tests replace it to avoid launching anything.
Future<bool> Function(Uri uri, {bool sameTab}) openExternalUrl =
    (uri, {sameTab = false}) => launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
      webOnlyWindowName: sameTab ? '_self' : '_blank',
    );

/// Opens [url] if it is a valid http(s) link.
Future<void> openLink(String url) async {
  final uri = Uri.tryParse(url.trim());
  if (uri == null || !(uri.scheme == 'https' || uri.scheme == 'http')) return;
  await openExternalUrl(uri);
}
