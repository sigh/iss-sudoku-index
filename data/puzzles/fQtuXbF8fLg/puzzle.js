// Title: The Miracle Square Sudoku
// Author: Peter Veenis
// Video: https://www.youtube.com/watch?v=fQtuXbF8fLg
// Source: https://app.crackingthecryptic.com/sudoku/HP83P4q2Pr
//
// Rules encoded here, in full:
//
//   Normal Sudoku rules apply. Digits in two cells separated by an X sum to
//   10. Digits in two cells separated by a V sum to 5. For any pair of
//   orthogonally adjacent cells where both cells are coloured yellow: the
//   digits cannot add to 5 or 10; the digits cannot be consecutive (a
//   difference of 1); and the digits cannot have a ratio of 1:2 (one digit
//   cannot be double the other).
//
//   NB There is no negative constraint on the Xs and Vs: an unmarked domino
//   may still sum to 10 or 5.
//
// Nothing is omitted. The board carries no given digits. Because the rules
// state that the X/V marks carry no negative constraint, plain `X` and `V`
// are used rather than the strict variants.

const graph = cellGraph('9x9');

// Drawn X marks: white "X" glyphs centred on a cell border, one per domino.
const xEdges = [
  ['R2C5', 'R2C6'],
  ['R3C5', 'R3C6'],
  ['R5C3', 'R6C3'],
  ['R7C4', 'R8C4'],
  ['R7C6', 'R8C6'],
  ['R5C8', 'R6C8'],
];

// Drawn V marks, same rendering.
const vEdges = [
  ['R2C7', 'R2C8'],
  ['R4C2', 'R5C2'],
  ['R4C3', 'R5C3'],
  ['R8C5', 'R8C6'],
];

// Drawn yellow shading: 27 gold cell squares, covering exactly the three
// boxes on the main diagonal. No other cell is shaded.
const yellowCells = [
  'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3',
  'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6',
  'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9',
];

// Each unordered yellow-yellow orthogonal edge, once. A cell outside the
// yellow set has no index, so the comparison against `undefined` is false and
// it is skipped; keeping only the higher-indexed neighbour drops the mirror
// copy of each edge. 36 edges: 12 within each of the three shaded boxes.
const yellowIndex = new Map(yellowCells.map((cell, i) => [cell, i]));
const yellowEdges = yellowCells.flatMap(
  (cell) => graph.neighbours(cell)
    .filter((other) => yellowIndex.get(other) > yellowIndex.get(cell))
    .map((other) => [cell, other]));

// The yellow rule is four negatives at once on one domino, so it is one
// generic pairwise relation per edge: sum is not 5, sum is not 10, the digits
// are not consecutive, and neither digit is twice the other.
const yellowPairKey = Pair.fnToKey(
  (a, b) => a + b !== 5
    && a + b !== 10
    && Math.abs(a - b) !== 1
    && a !== 2 * b
    && b !== 2 * a,
  graph.gridGeometry());

return [
  new Shape('9x9'),
  ...xEdges.map((edge) => new X(...edge)),
  ...vEdges.map((edge) => new V(...edge)),
  ...yellowEdges.map((edge) => new Pair(yellowPairKey, 'yellow pair', ...edge)),
];
