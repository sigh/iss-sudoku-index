// Title: Solve A Sudoku And Win An Ekster Wallet!
// Author: Kurt Hugo Schneider
// Video: https://www.youtube.com/watch?v=v0Vz7g6EWTs
// Source: https://bit.ly/KHS6x6

// Place 1-6 once in every row and column. Divide the grid into six
// orthogonally connected regions of six cells each; each region holds 1-6
// once. Every drawn boundary segment lies on a region border, i.e. the two
// cells it separates are in different regions. Seven digits are given.
//
// The source states no rules, so the region partition being solver-found
// rather than drawn is read off the board: eleven one-unit segments are drawn
// on cell boundaries, and 11 is short of the minimum a drawn partition needs.
// A 6x6 grid has 60 internal boundaries and a six-cell polyomino absorbs at
// most 7 internal adjacencies (a 2x3 rectangle), so any partition into six
// connected six-cell regions puts a border on at least 60 - 6*7 = 18 of them.
// The segments are not a partial drawing of a standard box layout either:
// six of the eleven fall strictly inside a 2-row-by-3-column box, and eight
// fall strictly inside a 3-row-by-2-column box.
//
// Nothing drawn on the board is omitted.

const graph = cellGraph('6x6');
// Region-label cell per grid cell, declared by ChaosConstruction; used here
// only to name the two labels a drawn segment must keep apart.
const cc = graph.makeOverlay('CC');

// Transcribed from the eleven boundary segments drawn on the board, each as
// the pair of cells it separates.
const BORDER_SEGMENTS = [
  ['R1C2', 'R2C2'], ['R2C1', 'R2C2'], ['R2C2', 'R3C2'],
  ['R1C3', 'R1C4'],
  ['R3C3', 'R4C3'], ['R3C4', 'R4C4'], ['R4C3', 'R4C4'],
  ['R6C3', 'R6C4'],
  ['R4C5', 'R5C5'], ['R5C4', 'R5C5'], ['R5C5', 'R6C5'],
];

// Transcribed from the seven digits written in cells.
const GIVENS = [
  ['R1C1', 1], ['R2C2', 2], ['R3C3', 3],
  ['R4C4', 4], ['R5C5', 5], ['R6C6', 6],
  ['R6C5', 2],
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...BORDER_SEGMENTS.map(([a, b]) => new AllDifferent(cc.at(a), cc.at(b))),
];
