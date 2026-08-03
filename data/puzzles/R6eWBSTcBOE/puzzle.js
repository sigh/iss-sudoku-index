// Title: Papier-mache
// Author: perladel
// Video: https://www.youtube.com/watch?v=R6eWBSTcBOE
// Source: https://app.crackingthecryptic.com/sudoku/NfPFf8BFnd

// Normal sudoku rules apply.
// Digits joined by a black dot must have a ratio of 1:2 (BlackDot below).
// If a green cell (R,C) has value V then cell (V,C) has value R
// (Indexing below, row-indexing, scoped to just the green cells).

// Black dot edges (drawn overlays; each connects two green cells below).
const blackDots = [
  ['R3C1', 'R3C2'],
  ['R3C8', 'R3C9'],
  ['R2C5', 'R3C5'],
  ['R6C1', 'R7C1'],
  ['R6C1', 'R6C2'],
  ['R8C3', 'R8C4'],
  ['R8C6', 'R8C7'],
  ['R6C7', 'R6C8'],
  ['R9C2', 'R9C3'],
  ['R6C9', 'R7C9'],
];

// Green-shaded cells (underlay fill), from the source geometry.
const greenCells = [
  'R2C5', 'R3C1', 'R3C2', 'R3C5', 'R3C8', 'R3C9',
  'R6C1', 'R6C2', 'R6C7', 'R6C8', 'R6C9',
  'R7C1', 'R7C9',
  'R8C3', 'R8C4', 'R8C6', 'R8C7',
  'R9C2', 'R9C3',
];

return [
  new Shape('9x9'),
  new Given('R2C7', 5),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  // Indexing('R', ...cells) applies once per listed cell: for control cell
  // (R,C) holding value V, it forces cell (V,C) to hold R. Passing only
  // greenCells here scopes the rule to the green cells, as stated.
  new Indexing('R', ...greenCells),
];
