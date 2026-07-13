// Title: Happy 30th Birthday
// Author: Marv
// Video: https://www.youtube.com/watch?v=3s5hp5ymc7Y
// Source: https://sudokupad.app/its5y30p4k

// Normal sudoku rules apply.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// The remaining cages are unclued but all share one common (unknown) sum.
// Enforce all-different within each cage, then tie every cage's total to the
// same value with one EqualSum.
const unsummedCages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R2C1', 'R2C2', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6'],
  ['R1C8', 'R2C7', 'R2C8', 'R3C7', 'R3C8', 'R4C8'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R7C8', 'R8C7', 'R8C8', 'R9C7', 'R9C8'],
  ['R7C6', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5', 'R8C4', 'R8C5'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
];

return [
  new Shape('9x9'),

  // Givens (includes one digit drawn as a single-cell 1-clued cage at R3C6).
  new Given('R2C3', 9),
  new Given('R3C6', 1),
  new Given('R5C4', 1),
  new Given('R5C5', 2),
  new Given('R5C6', 3),
  new Given('R7C3', 6),

  // "A (non-arrow) clue outside the grid shows the sum of the digits
  // sandwiched between the 1 and the 9 in that row/column."
  Sandwich.fromCells(30, graph.column(7), geometry),
  Sandwich.fromCells(30, graph.row(8), geometry),

  // "An (arrow) clue outside the grid shows the sum of the indicated
  // diagonal." Three diagonal arrows, each summing to 30. LittleKiller's
  // fromCells derives the canonical on-grid corner from the diagonal's
  // cells, which need not be the cell nearest the drawn arrow badge.
  LittleKiller.fromCells(30, graph.ray('R6C1', -1, 1), geometry), // badge at the left of row 7
  LittleKiller.fromCells(30, graph.ray('R3C1', 1, 1), geometry), // badge at the left of row 2
  LittleKiller.fromCells(30, graph.ray('R9C6', -1, 1), geometry), // badge at the right of row 5

  // "Digits in a cage cannot repeat. Some cages show their sum; the others
  // share the same sum, which must be determined."
  // One cage shows its sum (29); apply it directly as a killer cage.
  new Cage(29, 'R4C7', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7'),

  ...unsummedCages.map(cage => new AllDifferent(...cage)),
  new EqualSum(...unsummedCages),
];
