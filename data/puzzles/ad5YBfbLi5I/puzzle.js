// Title: Mystery Killer N
// Author: FinnishGuy
// Video: https://www.youtube.com/watch?v=ad5YBfbLi5I
// Source: https://app.crackingthecryptic.com/sudoku/dG8D6BBL3R

// Normal sudoku rules apply (default row/column/box all-different).
// Killer cages: cells in a cage sum to the small clue printed in its
// top-left corner. Eight of the twelve cages print no number, only the
// letter "N" -- the rules state N is one unknown value the solver must
// determine, so all eight of those cages share the same (unknown) total.
// That shared-unknown-sum relation is EqualSum, which ties the segments
// without ever materializing N. Every "N" cage is a 2-cell domino confined
// to a single row or column (checked below), so the cage's own internal
// distinctness is already the row/column all-different -- no separate
// AllDifferent is added for them.
// Outside-grid arrows on each side give the sum of digits along the short
// (2-cell) diagonal they point into -- LittleKiller.
// White-filled edge overlays (5) mark orthogonally adjacent cells that must
// hold consecutive digits -- WhiteDot.
// The two grey lines (colour #CFCFCF, thickness 8) are palindromes.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Numbered cages: the four drawn cages with a printed integer total.
const numberedCages = [
  [7, 'R2C6', 'R2C7'],
  [12, 'R3C8', 'R4C8'],
  [13, 'R6C2', 'R7C2'],
  [3, 'R8C3', 'R8C4'],
];

// "N" cages: the eight drawn cages whose printed value is the letter "N".
// Each pair sits in one row or one column (R2C3/R2C4 same row; R3C2/R4C2
// same column; etc.), so the row/column all-different already forces the
// two cage cells apart -- no separate AllDifferent is added.
const mysteryCages = [
  ['R2C3', 'R2C4'],
  ['R3C2', 'R4C2'],
  ['R3C5', 'R4C5'],
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
  ['R6C5', 'R7C5'],
  ['R6C8', 'R7C8'],
  ['R8C6', 'R8C7'],
];

// Outside diagonal clues: [total, startCell, dRow, dCol] walked to the grid
// edge with graph.ray(), matching each drawn arrow's on-grid entry cell and
// direction. Every one of the four stops after 2 cells here, since each
// arrow enters one cell in from the puzzle's true corner.
const diagonalClues = [
  [3, 'R2C1', -1, 1],
  [4, 'R1C8', 1, 1],
  [17, 'R9C2', -1, -1],
  [16, 'R8C9', 1, -1],
];

// White dots: edge-sized rounded marks with white fill / black border.
const whiteDots = [
  ['R3C1', 'R3C2'],
  ['R4C6', 'R4C7'],
  ['R4C9', 'R5C9'],
  ['R5C6', 'R6C6'],
  ['R6C3', 'R7C3'],
];

// Palindrome lines: drawn grey line waypoints interpolated to cell paths.
const palindromeLines = [
  ['R2C3', 'R3C2', 'R4C2'],
  ['R5C7', 'R5C6', 'R6C5', 'R7C5', 'R8C6', 'R8C7', 'R7C8'],
];

return [
  new Shape('9x9'),

  ...numberedCages.map(([sum, a, b]) => new Cage(sum, a, b)),

  new EqualSum(...mysteryCages),

  ...diagonalClues.map(
    ([sum, cell, dr, dc]) =>
      LittleKiller.fromCells(sum, graph.ray(cell, dr, dc), geometry)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  ...palindromeLines.map(cells => new Palindrome(...cells)),
];
