// Title: August 1, 2021: Consec Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=jWpJqOra_Jk
// Source: https://tinyurl.com/3zv9utxv
//
// Standard sudoku rules apply. Digits on either side of a white dot must be
// consecutive. Not all possible dots are necessarily given: an unmarked
// adjacent pair carries no constraint (this is the ordinary WhiteDot
// semantics, not the exhaustively-marked StrictKropki variant).

// Dot cell pairs, transcribed from the payload's `difference` array (each
// entry has no explicit `value`, which is the fpuzzles default of 1 --
// i.e. a white/consecutive dot, matching the rules text).
const DOTS = [
  ['R3C5', 'R3C4'],
  ['R3C5', 'R3C6'],
  ['R7C6', 'R7C5'],
  ['R7C4', 'R7C5'],
  ['R5C3', 'R4C3'],
  ['R6C3', 'R5C3'],
  ['R6C7', 'R5C7'],
  ['R4C7', 'R5C7'],
  ['R4C4', 'R3C4'],
  ['R7C6', 'R6C6'],
  ['R6C3', 'R6C4'],
  ['R4C7', 'R4C6'],
  ['R2C7', 'R3C7'],
  ['R3C8', 'R3C7'],
  ['R7C3', 'R7C2'],
  ['R8C3', 'R7C3'],
  ['R3C3', 'R2C3'],
  ['R3C3', 'R3C2'],
  ['R2C2', 'R2C1'],
  ['R1C2', 'R2C2'],
  ['R2C8', 'R1C8'],
  ['R2C8', 'R2C9'],
  ['R8C2', 'R8C1'],
  ['R8C2', 'R9C2'],
  ['R2C9', 'R3C9'],
  ['R7C1', 'R8C1'],
  ['R6C5', 'R7C5'],
  ['R4C5', 'R3C5'],
];

return [
  new Shape('9x9'),

  new Given('R3C4', 3),
  new Given('R4C3', 4),
  new Given('R5C5', 9),
  new Given('R6C7', 6),
  new Given('R7C6', 5),

  // One WhiteDot per dot, called separately per pair: WhiteDot binds by grid
  // adjacency, so combining all dot cells into a single call would also
  // constrain any incidentally-adjacent cells from different dots that carry
  // no drawn dot between them.
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
