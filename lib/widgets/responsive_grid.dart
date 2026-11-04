import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

/// Lays children out in rows of [columns], giving every cell in a row the
/// same width and height, like a CSS grid.
class ResponsiveGrid extends StatelessWidget {
  const ResponsiveGrid({
    super.key,
    required this.columns,
    required this.children,
    this.spacing = 16,
    this.runSpacing,
  });

  final int columns;
  final List<Widget> children;
  final double spacing;
  final double? runSpacing;

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i += columns) {
      if (rows.isNotEmpty) rows.add(SizedBox(height: runSpacing ?? spacing));
      rows.add(
        EqualHeightRow(
          spacing: spacing,
          children: [
            for (var c = 0; c < columns; c++)
              i + c < children.length
                  ? children[i + c]
                  : const SizedBox.shrink(),
          ],
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: rows,
    );
  }
}

/// A row of equal-width cells that all match the tallest cell's height.
///
/// Unlike `IntrinsicHeight` + `Row`, this measures cells with a real layout
/// pass every time, so it stays correct when text metrics change after the
/// first frame (for example when a web font finishes loading).
class EqualHeightRow extends MultiChildRenderObjectWidget {
  const EqualHeightRow({super.key, this.spacing = 0, required super.children});

  final double spacing;

  @override
  RenderEqualHeightRow createRenderObject(BuildContext context) =>
      RenderEqualHeightRow(spacing: spacing);

  @override
  void updateRenderObject(
    BuildContext context,
    RenderEqualHeightRow renderObject,
  ) {
    renderObject.spacing = spacing;
  }
}

class _CellParentData extends ContainerBoxParentData<RenderBox> {}

class RenderEqualHeightRow extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _CellParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _CellParentData> {
  RenderEqualHeightRow({double spacing = 0}) : _spacing = spacing;

  double get spacing => _spacing;
  double _spacing;
  set spacing(double value) {
    if (value == _spacing) return;
    _spacing = value;
    markNeedsLayout();
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _CellParentData) {
      child.parentData = _CellParentData();
    }
  }

  double _cellWidth(double totalWidth) => childCount == 0
      ? 0
      : math.max(0, (totalWidth - spacing * (childCount - 1)) / childCount);

  @override
  void performLayout() {
    assert(
      constraints.hasBoundedWidth,
      'EqualHeightRow needs a bounded width.',
    );
    final width = constraints.maxWidth;
    final cellWidth = _cellWidth(width);

    // Pass 1: natural height of every cell at the shared width.
    var rowHeight = 0.0;
    var child = firstChild;
    while (child != null) {
      child.layout(
        BoxConstraints.tightFor(width: cellWidth),
        parentUsesSize: true,
      );
      rowHeight = math.max(rowHeight, child.size.height);
      child = childAfter(child);
    }

    // Pass 2: stretch every cell to the tallest one and position it.
    //
    // The height is a minimum, not a tight value: a child with tight
    // constraints becomes a relayout boundary, and then a text change inside
    // it (such as a web font finishing loading) would never reach this row.
    var x = 0.0;
    child = firstChild;
    while (child != null) {
      child.layout(
        BoxConstraints(
          minWidth: cellWidth,
          maxWidth: cellWidth,
          minHeight: rowHeight,
        ),
        parentUsesSize: true,
      );
      (child.parentData! as _CellParentData).offset = Offset(x, 0);
      x += cellWidth + spacing;
      child = childAfter(child);
    }

    size = constraints.constrain(Size(width, rowHeight));
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final width = constraints.maxWidth;
    final cellWidth = _cellWidth(width);
    var rowHeight = 0.0;
    var child = firstChild;
    while (child != null) {
      rowHeight = math.max(
        rowHeight,
        child.getDryLayout(BoxConstraints.tightFor(width: cellWidth)).height,
      );
      child = childAfter(child);
    }
    return constraints.constrain(Size(width, rowHeight));
  }

  double _maxChildHeight(
    double width,
    double Function(RenderBox child, double width) measure,
  ) {
    final cellWidth = _cellWidth(width);
    var result = 0.0;
    var child = firstChild;
    while (child != null) {
      result = math.max(result, measure(child, cellWidth));
      child = childAfter(child);
    }
    return result;
  }

  double _sumChildWidths(
    double height,
    double Function(RenderBox child, double height) measure,
  ) {
    var widest = 0.0;
    var child = firstChild;
    while (child != null) {
      widest = math.max(widest, measure(child, height));
      child = childAfter(child);
    }
    // Every cell gets the same width, so the row needs the widest cell's
    // width for each cell.
    return childCount == 0
        ? 0
        : widest * childCount + spacing * (childCount - 1);
  }

  @override
  double computeMinIntrinsicHeight(double width) =>
      _maxChildHeight(width, (c, w) => c.getMinIntrinsicHeight(w));

  @override
  double computeMaxIntrinsicHeight(double width) =>
      _maxChildHeight(width, (c, w) => c.getMaxIntrinsicHeight(w));

  @override
  double computeMinIntrinsicWidth(double height) =>
      _sumChildWidths(height, (c, h) => c.getMinIntrinsicWidth(h));

  @override
  double computeMaxIntrinsicWidth(double height) =>
      _sumChildWidths(height, (c, h) => c.getMaxIntrinsicWidth(h));

  @override
  void paint(PaintingContext context, Offset offset) =>
      defaultPaint(context, offset);

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) =>
      defaultHitTestChildren(result, position: position);
}
