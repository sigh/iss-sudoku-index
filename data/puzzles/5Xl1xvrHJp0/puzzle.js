// Title: Triple Kill
// Author: thunderstrucken
// Video: https://www.youtube.com/watch?v=5Xl1xvrHJp0
// Source: https://tinyurl.com/2bxmrpcv
//
// Normal sudoku on a 9x9 grid. Killer cages sum to the small clue in the
// cage's top-left cell and forbid repeats within the cage (Cage). Little
// killer clues outside the grid give the diagonal's sum, repeats allowed
// along the diagonal (LittleKiller.fromCells, which derives each clue's
// on-grid corner from its cell list). A black dot marks a 1:2 ratio between
// two cells (BlackDot); the rules say not every such pair is marked, so this
// is the plain (non-exhaustive) dot reading, not StrictKropki.

const geometry = cellGeometry('9x9');

const givens = [
  new Given('R2C8', 9),
  new Given('R8C2', 9),
];

// Killer cages: [total, ...cells], cells top-left-first as printed in the
// source payload.
const cages = [
  [6, 'R1C1', 'R2C1'],
  [6, 'R4C1', 'R4C2'],
  [6, 'R3C4', 'R4C4'],
  [6, 'R1C3', 'R1C4'],
  [6, 'R9C8', 'R9C9'],
  [6, 'R8C6', 'R9C6'],
  [6, 'R6C6', 'R6C7'],
  [6, 'R6C9', 'R7C9'],
  [9, 'R3C9', 'R4C9'],
  [9, 'R1C6', 'R1C7'],
  [9, 'R6C1', 'R7C1'],
  [9, 'R9C3', 'R9C4'],
  [12, 'R6C3', 'R6C4', 'R7C4'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// Little killer sums: [total, ...diagonalCells], cells as drawn from the
// off-grid badge inward.
const littleKillers = [
  [30, 'R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5'],
  [18, 'R1C7', 'R2C8', 'R3C9'],
  [18, 'R7C1', 'R8C2', 'R9C3'],
  [33, 'R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'],
  [27, 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
].map(([sum, ...cells]) => LittleKiller.fromCells(sum, cells, geometry));

const blackDots = [
  new BlackDot('R6C5', 'R7C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...littleKillers,
  ...blackDots,
];
