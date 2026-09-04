// Title: The Magic Column
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=FXxdeBEKqfc
// Source: https://app.crackingthecryptic.com/sudoku/DrTgmjtJtq

// Rules encoded (10x10 grid, digits 1-9):
// - Each column holds the digits 1-9 once each, plus exactly one empty
//   cell. Rows may repeat digits (stated explicitly), so this is a Raw
//   shape widened to 10 values: value 10 stands in for "empty", and only
//   the columns are made AllDifferent over the widened 1-10 alphabet --
//   there is no implicit row/column/box rule to fall back on.
// - No digit repeats along any diagonal, in either direction. The rules
//   say "any diagonal" (a universal quantifier over every diagonal line),
//   not "either diagonal" or "the diagonals", so every diagonal of length
//   >= 2 in both directions is covered, not only the two long corner-to-
//   corner ones. An empty cell holds no digit, so two empty cells may
//   still share a diagonal. Encoded as one seen-digit-bitmask NFA per
//   diagonal: reading a 1-9 digit already in the mask rejects, reading
//   the empty marker (10) leaves the mask unchanged.
// - Exactly one column is magic (which one is not given, so this
//   disjoins over all 10 candidates). For every row, if that row's cell
//   in the magic column holds digit v, then v appears exactly v times
//   across that whole row, itself included (the worked example: "the 3
//   in the magic column has exactly three 3s in its row"). If that row's
//   magic-column cell is instead the column's one empty cell, the rule
//   is silent -- it only speaks of "each digit in the magic column".
// - Each blue line's digits sum to 10 in total: the rules say digits
//   "along" the line "add up to 10", one aggregate total for the whole
//   drawn run, not a per-adjacent-pair or freely-segmented total (no
//   wording here about pairs or splitting into groups, unlike ISS's
//   segment-based SumLine). Blue lines never cross the empty cell, so
//   every blue-line cell is restricted to an actual digit (1-9).

const N = 10;
const EMPTY = 10;
const shape = new Shape('10x10', 10, 'Raw');
const graph = cellGraph(shape);

const columns = graph.columns();
const rows = graph.rows();

// -- Givens (R#C# is safe here: every given is within rows/cols 1-9). --
const givens = [
  new Given('R1C4', 3),
  new Given('R1C7', 6),
  new Given('R2C1', 3),
  new Given('R2C3', 8),
  new Given('R4C7', 5),
  new Given('R6C1', 7),
  new Given('R8C8', 9),
];

// -- Each column: digits 1-9 once, plus the empty marker (10) once. --
const columnRules = columns.map(col => new AllDifferent(...col));

// -- Diagonals: no digit (1-9) repeats along any diagonal of length >= 2,
// in either direction; the empty marker (10) is exempt and may recur.
// Built from the grid's own dimensions (not hand-transcribed) using
// makeCellId so row/column 10 serialize correctly (base-17 'a', not '10').
function diagonalCells(dr, dc, kMin, kMax, cellsForK) {
  const groups = [];
  for (let k = kMin; k <= kMax; k++) {
    const cells = cellsForK(k);
    if (cells.length >= 2) groups.push(cells);
  }
  return groups;
}

// r - c = k, k in -9..9; exclude the two single-cell corners (k = +-9).
const nwSeGroups = diagonalCells(1, 1, -8, 8, k => {
  const cells = [];
  const rStart = Math.max(1, 1 + k);
  const rEnd = Math.min(N, N + k);
  for (let r = rStart; r <= rEnd; r++) cells.push(makeCellId(r, r - k));
  return cells;
});

// r + c = k, k in 2..20; exclude the two single-cell corners (k = 2, 20).
const neSwGroups = diagonalCells(1, -1, 3, 19, k => {
  const cells = [];
  const rStart = Math.max(1, k - N);
  const rEnd = Math.min(N, k - 1);
  for (let r = rStart; r <= rEnd; r++) cells.push(makeCellId(r, k - r));
  return cells;
});

// State = bitmask of 1-9 digits already seen on this diagonal. Reading
// EMPTY (10) leaves the mask unchanged, so repeats of "no digit" are free.
const diagonalSpec = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => {
    if (value === EMPTY) return state;
    const bit = 1 << (value - 1);
    return (state & bit) ? undefined : (state | bit);
  },
  accept: () => true,
}, N);

const diagonalRules = [...nwSeGroups, ...neSwGroups].map(
  cells => new NFA(diagonalSpec, 'diagonal-no-repeat', ...cells));

// -- Magic column: disjoin over which of the 10 columns is magic. Inside
// each candidate branch, every row is independently either the magic
// column's own empty cell (no count asserted) or a digit v with exactly
// v occurrences across that row (ContainExact leaves undrawn digits'
// counts unrestricted, matching "each digit .. tells you how many times
// that digit appears", said only of the digits actually in that column).
const magicColumnBranches = columns.map((col, colIdx) => {
  const perRow = rows.map(rowCells => {
    const magicCell = rowCells[colIdx];
    const digitBranches = [];
    for (let v = 1; v <= 9; v++) {
      const clue = Array(v).fill(String(v)).join('_');
      digitBranches.push(new And([
        new Given(magicCell, v),
        new ContainExact(clue, ...rowCells),
      ]));
    }
    digitBranches.push(new Given(magicCell, EMPTY));
    return new Or(digitBranches);
  });
  return new And(perRow);
});
const magicColumnRule = new Or(magicColumnBranches);

// -- Blue lines: coordinates transcribed from the drawn line paths;
// makeCellId covers row/column 10 (R10.. / ..C10). Each line's total is
// 10, and no line cell may be the empty marker.
const blueLineCoords = [
  [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
  [[5, 1], [5, 2], [6, 3]],
  [[1, 8], [2, 8]],
  [[1, 5], [1, 6]],
  [[1, 10], [2, 10], [3, 10], [4, 10]],
  [[5, 9], [5, 8]],
  [[5, 10], [6, 9]],
  [[6, 5], [5, 6], [6, 7]],
  [[5, 3], [5, 4]],
  [[8, 1], [9, 1]],
  [[10, 2], [10, 3], [10, 4], [10, 5]],
  [[10, 8], [9, 8]],
];
const blueLines = blueLineCoords.map(
  coords => coords.map(([r, c]) => makeCellId(r, c)));
const blueLineSumRules = blueLines.map(cells => new Sum(10, ...cells));
const blueLineCells = [...new Set(blueLines.flat())];
const blueLineNoEmptyRules = blueLineCells.map(
  cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  shape,
  ...givens,
  ...columnRules,
  ...diagonalRules,
  magicColumnRule,
  ...blueLineSumRules,
  ...blueLineNoEmptyRules,
];
