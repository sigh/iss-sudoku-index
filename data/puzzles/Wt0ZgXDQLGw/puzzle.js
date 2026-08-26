// Title: I See No Dots
// Author: billybeth
// Video: https://www.youtube.com/watch?v=Wt0ZgXDQLGw
// Source: https://sudokupad.app/3nizvqv1u9

// Normal sudoku rules apply (standard rows/cols/3x3 boxes via Shape).
// Adjacent digits along the green line differ by five or more: Whisper(5).
//
// "Cells joined by black dots are in the ratio of 1:2 or 1:3. All dots are
// given" -- the source payload draws zero dots anywhere (no underlays,
// overlays, or dot markers at all; hence the title). "All dots are given"
// is the standard exhaustively-marked-clue convention: every orthogonally
// adjacent pair *without* a drawn dot must NOT be in a 1:2 or 1:3 ratio.
// With no dots drawn, that negative applies to every orthogonal edge in the
// grid. No strict built-in class covers a 1:2-or-1:3 ratio (StrictKropki is
// fixed to 2:1 plus a no-consecutive clause this ruleset never states), so
// each edge gets an explicit negated-ratio Pair instead.

const greenLine = [
  'R1C4', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4',
  'R4C4', 'R4C5', 'R3C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C7',
  'R6C7', 'R6C6', 'R7C6', 'R7C5', 'R7C4', 'R6C4', 'R6C3', 'R7C2', 'R8C2',
  'R8C1', 'R9C1',
];

const notRatioKey = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a && a !== 3 * b && b !== 3 * a, 9);

// One template pair per direction, replicated (shifted) to every origin --
// all 144 orthogonal edges share these two shapes.
const graph = cellGraph('9x9');

const hOrigins = [];
const vOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (c < 9) hOrigins.push(makeCellId(r, c));
    if (r < 9) vOrigins.push(makeCellId(r, c));
  }
}

const noDotEdges = [
  graph.makeReplicate(
    new Pair(notRatioKey, 'no dot: not a 1:2 or 1:3 ratio', 'R1C1', 'R1C2'),
    hOrigins,
  ),
  graph.makeReplicate(
    new Pair(notRatioKey, 'no dot: not a 1:2 or 1:3 ratio', 'R1C1', 'R2C1'),
    vOrigins,
  ),
];

return [
  new Shape('9x9'),
  new Whisper(5, ...greenLine),
  ...noDotEdges,
];
