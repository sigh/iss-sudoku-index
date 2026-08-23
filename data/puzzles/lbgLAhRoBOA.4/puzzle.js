// Title: Consecutive Pairs Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/FPMM9Hn3Fg

// Normal sudoku rules apply (default row/column/box all-different). A white
// dot joins two orthogonally adjacent cells with consecutive digits. "All
// white dots may not be given" is the standard GAS non-exhaustive disclaimer:
// an unmarked adjacent pair carries no constraint, so only the printed dots
// below are enforced (not StrictKropki).

// Dot pairs transcribed from the payload's 30 edge-sized overlays, each a
// white-filled rounded mark centered on the shared edge between two
// orthogonally adjacent cells.
const whiteDotPairs = [
  ['R1C8', 'R2C8'], ['R2C8', 'R3C8'], ['R3C8', 'R4C8'],
  ['R5C8', 'R6C8'], ['R6C8', 'R7C8'], ['R7C8', 'R8C8'], ['R8C8', 'R9C8'],
  ['R6C6', 'R6C7'], ['R5C6', 'R5C7'], ['R4C6', 'R4C7'],
  ['R3C6', 'R3C7'], ['R2C6', 'R2C7'],
  ['R1C5', 'R2C5'], ['R2C5', 'R3C5'], ['R4C5', 'R5C5'],
  ['R5C5', 'R6C5'], ['R7C5', 'R8C5'], ['R8C5', 'R9C5'],
  ['R8C3', 'R8C4'], ['R7C3', 'R7C4'], ['R6C3', 'R6C4'],
  ['R5C3', 'R5C4'], ['R4C3', 'R4C4'],
  ['R1C2', 'R2C2'], ['R2C2', 'R3C2'], ['R3C2', 'R4C2'],
  ['R4C2', 'R5C2'], ['R6C2', 'R7C2'], ['R7C2', 'R8C2'], ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C9', 9),
  new Given('R2C4', 2),
  new Given('R2C6', 5),
  new Given('R5C1', 3),
  new Given('R5C4', 5),
  new Given('R5C6', 8),
  new Given('R5C9', 4),
  new Given('R8C4', 8),
  new Given('R8C6', 2),
  new Given('R9C1', 7),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
];
