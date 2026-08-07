// Title: Renban-Anti-Kropki
// Author: Klausku
// Video: https://www.youtube.com/watch?v=Aq16DYbLuI0
// Source: https://app.crackingthecryptic.com/sudoku/NMpgqR73rH

// Standard sudoku (default 9x9 shape with default 3x3 boxes) plus two rules:
// - Renban: digits on each purple line form a set of consecutive digits, in
//   any order.
// - Negative Kropki: no orthogonally adjacent pair may be consecutive digits
//   or in a 1:2 ratio, since the rules state all Kropki dots are drawn and
//   none appear in the grid.

const renbanLines = [
  ['R1C6', 'R2C6', 'R2C5', 'R2C4', 'R3C5'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C2'],
  ['R4C8', 'R5C8', 'R5C9', 'R6C9'],
  ['R7C9', 'R8C8', 'R9C7'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 8),
  new Given('R7C3', 8),

  ...renbanLines.map(cells => new Renban(...cells)),

  // No dots are drawn anywhere in the grid, so every adjacent pair is
  // negatively constrained.
  new StrictKropki(),
];
