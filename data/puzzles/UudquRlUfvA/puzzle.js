// Title: XY Differences, "Borobudur"
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=UudquRlUfvA
// Source: https://tinyurl.com/Borobudur03

// Normal sudoku rules apply.
//
// Blue lines are Region Sum lines: within each box a line visits, its cells
// sum to the same total; the total may differ line to line. `RegionSumLine`
// takes the drawn cell list in order and splits it by box crossings itself.
//
// XY Difference Pairs: a diamond between two cells (`rectangle` entries,
// always orthogonally adjacent in the payload) means their digits differ by
// the digit in the anchor cell that shares their row/column -- the leftmost
// cell of the row for a horizontally-placed diamond, the topmost cell of the
// column for a vertically-placed one (matching the worked examples in the
// rules text: R9C3/R9C4 -> R9C1; R2C1/R3C1 -> R1C1). The rules text says not
// every possible diamond is drawn, so only the drawn ones are constrained.
// |a - b| = anchor has two sign cases -- a = b + anchor, or a + anchor = b --
// each stated as an EqualSum over the two sides, and both offered with
// Or(...) since which cell of the pair is larger is not given.

const givens = [
  new Given('R1C1', 7), // sole given (grid payload)
];

// Region Sum lines, one array per drawn blue line (source: `line` payload
// entries, all outlineC #99CCFF/width 0.3). Two further payload `line`
// entries (R8C7-R7C7 and R6C8-R6C9) are sub-segments already covered by the
// fifth line below and lie entirely inside one box each, so they add no
// constraint beyond it; they are UI-only duplicate strokes and are omitted.
const regionSumLineCells = [
  ['R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C4', 'R6C5', 'R5C6'],
  ['R5C1', 'R6C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R4C5', 'R4C6', 'R5C7', 'R6C7', 'R7C6', 'R7C5'],
  ['R1C4', 'R1C5', 'R2C6', 'R3C7', 'R3C8'],
  ['R8C7', 'R8C8', 'R7C7', 'R6C8', 'R5C8', 'R6C9'],
];
const regionSumLines = regionSumLineCells.map(
  (cells) => new RegionSumLine(...cells));

// XY Difference Pair diamonds (source: `rectangle` payload entries, all
// angle -45). Each pair is two orthogonally adjacent cells; the anchor is
// derived from whether the pair shares a row or a column.
const diffPairCells = [
  ['R2C1', 'R3C1'],
  ['R1C3', 'R1C2'],
  ['R1C6', 'R1C7'],
  ['R6C1', 'R7C1'],
  ['R7C5', 'R7C6'],
  ['R6C7', 'R5C7'],
  ['R6C5', 'R6C4'],
  ['R3C5', 'R3C4'],
  ['R5C6', 'R5C7'],
  ['R3C7', 'R4C7'],
  ['R9C3', 'R9C4'],
];

const diffPairs = diffPairCells.map(([a, b]) => {
  const pa = parseCellId(a);
  const pb = parseCellId(b);
  let anchor;
  if (pa.row === pb.row) {
    // Horizontally-placed diamond: anchor is the leftmost cell of the row.
    anchor = makeCellId(pa.row, 1);
  } else {
    // Vertically-placed diamond: anchor is the topmost cell of the column.
    anchor = makeCellId(1, pa.col);
  }
  return new Or([
    new EqualSum([a], [b, anchor]),
    new EqualSum([a, anchor], [b]),
  ]);
});

return [
  new Shape('9x9'),
  ...givens,
  ...regionSumLines,
  ...diffPairs,
];
