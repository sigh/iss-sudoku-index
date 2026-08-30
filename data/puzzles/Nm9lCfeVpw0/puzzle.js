// Title: Renban Sudoku - Test Your Logic!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Nm9lCfeVpw0
// Source: https://cracking-the-cryptic.web.app/sudoku/P2hFjr3J7d

// Normal sudoku rules apply (standard 3x3 boxes).
// Grey areas: each must contain a set of consecutive digits, any order
// -> Renban(...cells). The payload draws each grey area as single-cell
// underlays with no line path; the cell sets below were recovered by
// grouping the 29 shaded cells into orthogonally-connected components.

const renbanLines = [
  new Renban('R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3'),
  new Renban('R1C5', 'R2C5', 'R3C5'),
  new Renban('R2C8', 'R2C7', 'R3C7'),
  new Renban('R4C1', 'R5C1', 'R5C2'),
  new Renban('R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1'),
  new Renban('R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
];

const givens = [
  new Given('R1C6', 8), new Given('R1C7', 5),
  new Given('R2C4', 7), new Given('R2C9', 3),
  new Given('R3C1', 3), new Given('R3C6', 1),
  new Given('R4C2', 8), new Given('R4C4', 5), new Given('R4C7', 2),
  new Given('R6C6', 9), new Given('R6C8', 4),
  new Given('R7C5', 1),
  new Given('R8C4', 4), new Given('R8C5', 8),
  new Given('R9C6', 7),
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
];
