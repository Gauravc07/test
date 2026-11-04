import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens an external page. Tests replace it to avoid launching anything.
Future<bool> Function(Uri uri, {bool sameTab}) openExternalUrl =
    (uri, {sameTab = false}) => launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
      webOnlyWindowName: sameTab ? '_self' : '_blank',
    );

/// Opens a page in an in-app browser sheet (Safari View Controller /
/// Custom Tabs) so people stay in the app, e.g. for legal pages.
Future<bool> Function(Uri uri) openInAppBrowser = (uri) =>
    uri.scheme == 'mailto'
    ? launchUrl(uri)
    : launchUrl(
        uri,
        mode: LaunchMode.inAppBrowserView,
        webOnlyWindowName: '_blank',
      );

/// Runs an OAuth flow in the system's in-app authentication sheet
/// (ASWebAuthenticationSession / Custom Tabs) and returns the final URL
/// the provider redirected to. Tests replace it.
Future<String> Function(Uri url, String callbackScheme) authenticateInApp =
    (url, callbackScheme) => FlutterWebAuth2.authenticate(
      url: url.toString(),
      callbackUrlScheme: callbackScheme,
    );

/// Opens [url] if it is a valid http(s) link.
Future<void> openLink(String url) async {
  final uri = Uri.tryParse(url.trim());
  if (uri == null || !(uri.scheme == 'https' || uri.scheme == 'http')) return;
  await openExternalUrl(uri);
}
