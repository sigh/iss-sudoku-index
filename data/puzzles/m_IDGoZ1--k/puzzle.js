// Title: Reflections
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=m_IDGoZ1--k
// Source: https://app.crackingthecryptic.com/sudoku/p8hG26GnbL

// Normal sudoku rules apply. Cells separated by a knight's move cannot
// contain the same digit (AntiKnight). Cages: digits sum to the small
// clue and cannot repeat within the cage (Cage). No givens.

// Cage cell lists transcribed from the source payload's cage geometry.
const cages = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R5C3', 'R5C2'],
  ['R3C3', 'R3C2', 'R4C2', 'R4C3'],
  ['R2C5', 'R2C6', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R5C6', 'R5C5'],
  ['R3C5', 'R3C6', 'R4C6', 'R4C5'],
  ['R2C8', 'R2C9'],
  ['R5C8', 'R5C9'],
  ['R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3', 'R7C3'],
  ['R6C7', 'R7C7', 'R8C7'],
];
const cageTotals = [36, 14, 38, 26, 7, 11, 25, 9];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map((cells, i) => new Cage(cageTotals[i], ...cells)),
];
