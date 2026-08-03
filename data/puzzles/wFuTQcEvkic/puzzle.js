// Title: May the 4's Be With You
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=wFuTQcEvkic
// Source: https://app.crackingthecryptic.com/sudoku/tMq37fgf63

// Normal sudoku rules apply (standard 3x3 boxes, drawn as such).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits in a cage cannot repeat and must add to the given total -> Cage.
// Along the marked diagonal, digits must add to the given total -> LittleKiller.
//
// The marked diagonal is drawn as a short off-grid arrow entering the grid at
// R8C1 and running down-right, paired with the nearest "11" outside-clue
// badge; walking that diagonal from R8C1 stays on-grid for exactly R8C1 and
// R9C2 before it exits. LittleKiller.fromCells derives the canonical corner
// cell from this drawn cell list.

const nines = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C3', 'R1C4', 'R2C3'],
  ['R1C8', 'R2C7', 'R2C8'],
  ['R2C5', 'R3C5', 'R3C6'],
  ['R4C3', 'R4C4', 'R5C3'],
  ['R4C6', 'R4C7'],
  ['R4C8', 'R5C8', 'R5C9'],
  ['R5C2', 'R6C2'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C9', 'R7C9'],
  ['R7C1', 'R7C2'],
  ['R7C3', 'R7C4'],
  ['R7C8', 'R8C8', 'R8C9'],
  ['R8C5', 'R9C5', 'R9C6'],
]; // Cage cells, transcribed from the payload's `cages` array (all total 11).

return [
  new Shape('9x9'),

  // Givens: digit 4, transcribed from `cells[][].value`.
  new Given('R1C2', 4),
  new Given('R2C9', 4),
  new Given('R3C4', 4),
  new Given('R4C5', 4),
  new Given('R5C1', 4),
  new Given('R6C7', 4),
  new Given('R7C6', 4),
  new Given('R8C3', 4),
  new Given('R9C8', 4),

  new AntiKnight(),

  ...nines.map(cells => new Cage(11, ...cells)),

  LittleKiller.fromCells(11, cellGraph('9x9').ray('R8C1', 1, 1), cellGeometry('9x9')),
];
