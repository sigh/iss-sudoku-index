// Title: Peculiar Operations
// Author: Finest
// Video: https://www.youtube.com/watch?v=7C4bqdeN_n8
// Source: https://app.crackingthecryptic.com/sudoku/8bFHjTJF7L

// Normal sudoku rules apply (default 9x9 shape with standard 3x3 boxes).
// Along a blue line, each digit must be a multiple or factor of its
// neighbour. This is a per-edge relation between cells adjacent on the
// drawn line, applied below with one Pair per edge (or one sequential Pair
// per straight run of cells).
// Digits in a cage may not repeat and must sum to the given total: Cage.
// A grey circle shows an odd digit: Given restricted to {1,3,5,7,9}.
// A circle joining two cells shows the difference between the two digits:
// one Pair per marked edge, keyed on the printed number.

const shape = new Shape('9x9');

// Killer cages (drawn dashed cages, distinct + sum -> Cage).
const cages = [
  new Cage(18, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(36, 'R2C5', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Cage(11, 'R5C4', 'R6C4'),
  new Cage(18, 'R5C5', 'R6C5', 'R7C5'),
];

// Odd (grey) circles, one per cell.
const oddCells = ['R7C2', 'R9C2'];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

// Blue-line "multiple or factor" relation, applied per edge.
const ratioKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, shape);

// The drawn blue mark at R2C2 is a vertical and a horizontal 3-cell stroke
// sharing that cell, forming one connected plus-shaped line. Because the
// rule is a pairwise relation between line-adjacent cells, the four drawn
// edges are encoded individually rather than as one ordered path.
const plusEdgesR2C2 = [
  ['R1C2', 'R2C2'], ['R2C2', 'R3C2'], ['R2C1', 'R2C2'], ['R2C2', 'R2C3'],
];
// The drawn blue mark at R8C8 is the two 3-cell diagonal strokes of its
// box sharing that cell, forming one connected X-shaped line; same
// per-edge treatment as the R2C2 plus.
const xEdgesR8C8 = [
  ['R7C7', 'R8C8'], ['R8C8', 'R9C9'], ['R7C9', 'R8C8'], ['R8C8', 'R9C7'],
];
const ratioEdgePairs = [...plusEdgesR2C2, ...xEdgesR8C8].map(
  ([a, b]) => new Pair(ratioKey, 'ratio', a, b));

// The three other drawn blue lines are simple unbranched strokes: one
// sequential Pair each covers every adjacent edge on that stroke.
const ratioLinePairs = [
  new Pair(ratioKey, 'ratio', 'R2C7', 'R2C8', 'R2C9'),
  new Pair(ratioKey, 'ratio', 'R8C1', 'R8C2', 'R8C3'),
  new Pair(ratioKey, 'ratio',
    'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
];

// Difference circles: edge-positioned markers printed with a number.
// Each entry is [printed value, cellA, cellB]. A printed 1 is the Kropki
// white-dot relation (consecutive digits), so those use the native
// WhiteDot instead of a hand-written difference predicate.
const differenceClues = [
  [3, 'R1C5', 'R1C6'],
  [3, 'R6C6', 'R6C7'],
  [2, 'R5C8', 'R5C9'],
  [2, 'R5C7', 'R5C8'],
  [2, 'R4C6', 'R4C7'],
  [1, 'R5C6', 'R5C7'],
  [1, 'R9C2', 'R9C3'],
  [1, 'R9C3', 'R9C4'],
  [1, 'R7C7', 'R8C7'],
  [1, 'R7C9', 'R8C9'],
  [1, 'R2C8', 'R3C8'],
  [6, 'R2C9', 'R3C9'],
  [6, 'R1C7', 'R2C7'],
];
const whiteDots = differenceClues
  .filter(([n]) => n === 1)
  .map(([, a, b]) => new WhiteDot(a, b));
const otherDifferenceClues = differenceClues.filter(([n]) => n !== 1);
const differenceKeys = new Map(
  [...new Set(otherDifferenceClues.map(([n]) => n))].map(
    n => [n, Pair.fnToKey((a, b) => Math.abs(a - b) === n, shape)]));
const differencePairs = otherDifferenceClues.map(
  ([n, a, b]) => new Pair(differenceKeys.get(n), `difference ${n}`, a, b));

return [
  shape,
  ...cages,
  ...oddGivens,
  ...ratioEdgePairs,
  ...ratioLinePairs,
  ...whiteDots,
  ...differencePairs,
];
