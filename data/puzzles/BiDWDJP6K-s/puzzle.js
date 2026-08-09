// Title: Kropki on Steroids Sudoku
// Author: MarcinJ
// Video: https://www.youtube.com/watch?v=BiDWDJP6K-s
// Source: https://app.crackingthecryptic.com/sudoku/Pd2RLT7dpm

// Normal sudoku: default 9x9 row/column/box AllDifferent from Shape. Main
// diagonal all-different (rules: "digits cannot repeat on the indicated
// diagonal"; the drawn line runs R1C1-R9C9, top-left to bottom-right, i.e.
// Diagonal(-1)). Four thick blue lines each carry an equal sum N within
// every 3x3 box they cross, N independent per line (RegionSumLine).
//
// Kropki dots (black = 1:2 ratio, white = consecutive) join cells that are
// orthogonally OR diagonally adjacent, per the rules text. "Not all
// possible dots are given" is a negative-space note, not a rule to encode:
// undrawn pairs stay unconstrained. WhiteDot/BlackDot only bind
// grid-orthogonal adjacency, so orthogonal dots use those classes directly
// and diagonal dots use an equivalent Pair predicate.
//
// A dot centred exactly on the 4-cell grid-line intersection marks BOTH
// diagonal pairs crossing that corner: the rules' own worked example for
// the black dot ("R1C2 and R2C3 have a 1:2 ratio, and so do R2C2 and R1C3")
// gives both diagonals of that same corner, so every corner dot (white and
// black alike) is read the same way.

// Sum lines, cells in drawn path order (the four thick blue strokes).
const sumLines = [
  ['R1C3', 'R2C2', 'R3C1', 'R4C2'],
  ['R2C6', 'R1C6', 'R1C7', 'R2C8', 'R3C9', 'R4C8'],
  ['R7C9', 'R8C8', 'R9C7', 'R9C6'],
  ['R6C2', 'R6C1', 'R7C1', 'R8C2', 'R9C3', 'R8C4'],
];

// Orthogonal dots: the one white edge mark, and the two black edge marks.
const orthogonalWhiteDots = [
  ['R1C5', 'R1C6'],
];
const orthogonalBlackDots = [
  ['R6C1', 'R6C2'],
  ['R1C6', 'R2C6'],
];

// Corner dots (both diagonals per corner, see header note): the one white
// corner mark, and the four black corner marks.
const cornerWhiteDots = [
  ['R5C7', 'R6C8'], ['R5C8', 'R6C7'],
];
const cornerBlackDots = [
  ['R8C7', 'R9C8'], ['R8C8', 'R9C7'],
  ['R8C2', 'R9C3'], ['R8C3', 'R9C2'],
  ['R1C2', 'R2C3'], ['R1C3', 'R2C2'],
  ['R1C7', 'R2C8'], ['R1C8', 'R2C7'],
];

const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

return [
  new Shape('9x9'),
  new Diagonal(-1),
  ...sumLines.map(cells => new RegionSumLine(...cells)),
  ...orthogonalWhiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...orthogonalBlackDots.map(([a, b]) => new BlackDot(a, b)),
  ...cornerWhiteDots.map(([a, b]) => new Pair(consecutiveKey, 'white dot (diagonal)', a, b)),
  ...cornerBlackDots.map(([a, b]) => new Pair(ratioKey, 'black dot (diagonal)', a, b)),
];
