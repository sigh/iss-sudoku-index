// Title: Twisted Knights Whispering
// Author: FinnishGuy
// Video: https://www.youtube.com/watch?v=VSyMjcbaG04
// Source: https://app.crackingthecryptic.com/sudoku/g6NdNgMLBn

// Rules encoded here:
//   BOARD SHAPE   nine 3x3 boxes sit at fixed positions on an 11x11 canvas,
//                 arranged as a diagonal staircase; the 40 cells outside
//                 every box hold no digit (drawn grey in the source, and
//                 exactly the cells no box's cell list covers). Populate the
//                 81 real cells with digits 1-9 so that no digit repeats in
//                 a box ("cage" in the rules text -- the source's `regions`
//                 and `cages` arrays list the identical nine 3x3 cell sets,
//                 so one AllDifferent per box covers both), nor in the real
//                 cells of any grid row or column. Because of the staircase,
//                 rows/columns 3-9 hold all nine real cells each; rows/
//                 columns 1, 2, 10, 11 hold only 3 or 6.
//   ANTI-KNIGHT   identical digits may not be a knight's move apart, checked
//                 only between pairs of real cells -- a hole holds no digit,
//                 so no rule about digits applies to it.
//   WHISPER (green line)     adjacent cells differ by >= 5.
//   PALINDROME (grey line)   every drawn one here is 2 cells, so "reads the
//                            same forwards and backwards" is just equality.
//   WHITE DOT   consecutive.
//   BLACK DOT   1:2 ratio.
// Nothing is omitted.
//
// The real grid cannot live on the ISS main grid: rows/columns are
// unconditionally all-different over every declared cell, and there is no
// way to declare an 11x11 canvas with 40 cells excluded from that. It
// instead lives on a `VD` overlay Var group over the same 11x11 canvas:
//   VD  each cell's value: 0 outside every box, else its digit 1-9
// The native main grid holds nothing real, so it is pinned to a fixed
// cyclic Latin square (boxes dropped) that adds no search of its own.
const SIZE = 11;
const shape = new Shape('11x11', '0-10');
const grid = cellGraph('11x11');
const value = grid.makeOverlay('VD');
const valueVar = value.toVar('Digits');
const at = cells => value.at(cells);

const filler = grid.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(cell, (row - 1 + col - 1) % SIZE);
});

// Nine fixed 3x3 boxes, transcribed from the source's `cages` (identical to
// its `regions`), row-major within each box.
const BOXES = [
  ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R3C5'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R3C9', 'R3Ca', 'R3Cb', 'R4C9', 'R4Ca', 'R4Cb', 'R5C9', 'R5Ca', 'R5Cb'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C4'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'],
  ['R6C8', 'R6C9', 'R6Ca', 'R7C8', 'R7C9', 'R7Ca', 'R8C8', 'R8C9', 'R8Ca'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'RaC4', 'RaC5', 'RaC6'],
  ['R9C7', 'R9C8', 'R9C9', 'RaC7', 'RaC8', 'RaC9', 'RbC7', 'RbC8', 'RbC9'],
];
const REAL_CELLS = BOXES.flat();
const REAL_SET = new Set(REAL_CELLS);
const HOLES = grid.cells().filter(c => !REAL_SET.has(c));

const boxes = BOXES.map(cells => new AllDifferent(...at(cells)));

// Holes carry no digit; real cells hold 1-9. Neither is compared against
// another hole or real cell by any other constraint, so a single shared
// placeholder (0) is enough for every hole.
const emptyHoles = HOLES.map(c => new Given(value.at(c), 0));
// All 81 real cells get the identical 1-9 restriction, so stamp it with one
// Replicate instead of 81 hand-written Givens (lint: stamped-copies-without-replicate).
const realDomain = value.makeReplicate(
  new Given(value.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9), at(REAL_CELLS));

// Rows/columns: all-different over each row's/column's real cells only,
// grouped from the box geometry above.
const byRow = new Map(), byCol = new Map();
for (const c of REAL_CELLS) {
  const { row, col } = parseCellId(c);
  if (!byRow.has(row)) byRow.set(row, []);
  if (!byCol.has(col)) byCol.set(col, []);
  byRow.get(row).push(c);
  byCol.get(col).push(c);
}
const rowsAndCols = [
  ...[...byRow.values()].map(cells => new AllDifferent(...at(cells))),
  ...[...byCol.values()].map(cells => new AllDifferent(...at(cells))),
];

// ---- Anti-knight, scoped to real cells only (computed from REAL_CELLS'
// coordinates; each unordered pair added once). A 2-cell not-equal relation
// is exactly AllDifferent, per lint guidance pair-all-different.
const KNIGHT_OFFSETS = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
const seenKnightPairs = new Set();
const knightPairs = [];
for (const c of REAL_CELLS) {
  const { row, col } = parseCellId(c);
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const r2 = row + dr, c2 = col + dc;
    if (r2 < 1 || r2 > SIZE || c2 < 1 || c2 > SIZE) continue;
    const other = makeCellId(r2, c2);
    if (!REAL_SET.has(other)) continue;
    const key = c < other ? `${c}_${other}` : `${other}_${c}`;
    if (seenKnightPairs.has(key)) continue;
    seenKnightPairs.add(key);
    knightPairs.push(new AllDifferent(value.at(c), value.at(other)));
  }
}

// ---- Green whisper lines, transcribed cell-by-cell from the drawn stroke
// paths (interpolated waypoints); several run diagonally across box
// boundaries -- the "twisted" of the title.
const WHISPERS = [
  ['R9C1', 'R9C2', 'R8C1', 'R7C1'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R5C2', 'R6C3', 'R6C4'],
  ['R4C7', 'R3C6', 'R2C5', 'R1C4', 'R1C5'],
  ['R2C5', 'R3C5'],
  ['R7C5', 'R7C6', 'R6C5'],
  ['R6C7', 'R5C6', 'R5C7'],
  ['R8C5', 'R9C6', 'RaC7', 'RbC8', 'RbC7'],
  ['RaC5', 'RaC6'],
  ['R2C6', 'R2C7'],
  ['R9C7', 'RaC7'],
  ['R3Cb', 'R3Ca', 'R4Cb', 'R5Cb'],
  ['R6Ca', 'R7Ca', 'R8Ca'],
  ['R6C8', 'R6C9', 'R7Ca'],
];
const whispers = WHISPERS.map(cells => new Whisper(5, ...at(cells)));

// ---- Grey palindrome lines: two cells each, from the drawn strokes.
const PALINDROMES = [
  ['R5Cb', 'R6Ca'],
  ['R1C5', 'R2C6'],
  ['R7C1', 'R6C2'],
  ['RaC6', 'RbC7'],
  ['R6C4', 'R7C5'],
  ['R5C7', 'R6C8'],
];
const palindromes = PALINDROMES.map(cells => new Palindrome(...at(cells)));

// ---- Kropki dots: white = consecutive, black = 1:2 ratio. WhiteDot/
// BlackDot validate their cells as grid-adjacent, which the VD overlay
// cells are not (they address the paired grid cell, not a native one), so
// the relation is applied directly via Pair instead.
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const ratio2 = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, shape);
const WHITE_DOTS = [['R9C9', 'RaC9'], ['R8C5', 'R8C6']];
const BLACK_DOTS = [['R1C3', 'R1C4'], ['R7C1', 'R7C2']];
const dots = [
  ...WHITE_DOTS.map(cells => new Pair(consecutive, 'white-dot', ...at(cells))),
  ...BLACK_DOTS.map(cells => new Pair(ratio2, 'black-dot', ...at(cells))),
];

return [
  shape,
  new NoBoxes(),
  ...filler,
  valueVar,
  ...boxes,
  ...emptyHoles,
  realDomain,
  ...rowsAndCols,
  ...knightPairs,
  ...whispers,
  ...palindromes,
  ...dots,
];
