// Title: Antiknight Killer Sudoku
// Author: PotatoHead21
// Video: https://www.youtube.com/watch?v=wps4c6WZKeM
// Source: https://app.crackingthecryptic.com/sudoku/FmTJm94bMR
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits along a cage sum to the small clue in its top-left cell, and
// cannot repeat within a cage -> Cage(total, ...cells) per cage.
//
// Cage cells and totals transcribed from the payload's `cages` array.
const cages = [
  [11, 'R1C1', 'R2C1', 'R2C2', 'R1C2'],
  [15, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [12, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [13, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [12, 'R3C3', 'R3C4', 'R4C3'],
  [10, 'R6C5', 'R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
