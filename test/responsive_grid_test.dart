import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/widgets/responsive_grid.dart';

/// Finds a real font file shipped with the Flutter SDK, or null.
File? _sdkFont() {
  final root = Platform.environment['FLUTTER_ROOT'];
  if (root == null) return null;
  final file = File(
    '$root/bin/cache/artifacts/material_fonts/roboto-regular.ttf',
  );
  return file.existsSync() ? file : null;
}

const _long =
    'Get matched with campaigns that fit your niche and audience. Track your growth '
    'with detailed analytics and performance metrics. Earn verified badges and climb '
    'creator levels for recognition.';

Widget _cell(Key key, String text) => Container(
  key: key,
  color: Colors.white,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        text,
        style: const TextStyle(fontFamily: 'LateWebFont', fontSize: 14),
      ),
    ],
  ),
);

void main() {
  testWidgets(
    'rows re-measure when a web font finishes loading after first layout',
    (tester) async {
      final font = _sdkFont();
      if (font == null) {
        markTestSkipped('Flutter SDK font not found; set FLUTTER_ROOT.');
        return;
      }

      const a = ValueKey('a');
      const b = ValueKey('b');
      await tester.pumpWidget(
        const Directionality(
          textDirection: TextDirection.ltr,
          child: Align(
            alignment: Alignment.topLeft,
            child: SizedBox(width: 500, child: _Grid()),
          ),
        ),
      );
      final before = tester.getSize(find.byKey(a)).height;

      // The font arrives after the first layout, as Google Fonts does on web.
      final bytes = font.readAsBytesSync();
      await tester.runAsync(() async {
        final loader = FontLoader('LateWebFont')
          ..addFont(Future.value(ByteData.sublistView(bytes)));
        await loader.load();
      });
      await tester.pump();
      await tester.pump();

      final textHeight = tester.getSize(find.text(_long)).height;
      final rowHeight = tester.getSize(find.byKey(a)).height;
      expect(
        textHeight,
        isNot(moreOrLessEquals(before)),
        reason: 'font load should change text metrics',
      );
      expect(
        rowHeight,
        moreOrLessEquals(textHeight),
        reason: 'row must fit the re-laid-out text',
      );
      expect(tester.getSize(find.byKey(b)).height, moreOrLessEquals(rowHeight));
      expect(tester.takeException(), isNull);
    },
  );
}

class _Grid extends StatelessWidget {
  const _Grid();

  @override
  Widget build(BuildContext context) {
    return ResponsiveGrid(
      columns: 2,
      children: [
        _cell(const ValueKey('a'), _long),
        _cell(const ValueKey('b'), 'Short'),
      ],
    );
  }
}
