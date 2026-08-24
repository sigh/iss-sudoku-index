// Title: League Against Camels
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=3y2NOuwZ7aI
// Source: https://app.crackingthecryptic.com/sudoku/FjNPfrp29T

// Normal sudoku (rows, columns, 3x3 boxes). Five killer cages (sum to the
// printed total, no repeated digit in the cage). Five grey lines are
// palindromes. The arrow drawn at R1C1 pointing off-grid, paired with the
// "45" label, is the standard indicated-diagonal marker: the main diagonal
// R1C1..R9C9 sums to 45, and digits may repeat on it (a Sum, not a Cage).
// Cells a "camel move" (a {1,3} leaper move, i.e. an elongated knight's
// move) apart may not hold the same digit -- enforced globally over every
// such pair on the grid.

const cages = [
  // Cage totals and cells transcribed from the drawn cage boxes.
  { sum: 33, cells: ['R3C6', 'R4C6', 'R5C6', 'R4C5', 'R4C7'] },
  { sum: 18, cells: ['R6C3', 'R7C3', 'R8C3', 'R7C2', 'R7C4'] },
  { sum: 20, cells: ['R8C6', 'R8C7', 'R8C8'] },
  { sum: 6, cells: ['R9C8', 'R9C7', 'R9C9'] },
  { sum: 15, cells: ['R4C9', 'R5C9', 'R6C9'] },
];

const palindromes = [
  // Cell paths transcribed from the drawn grey lines.
  ['R2C6', 'R1C7', 'R1C8'],
  ['R3C1', 'R4C2'],
  ['R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6'],
  ['R9C2', 'R9C3', 'R8C4'],
  ['R7C7', 'R7C8', 'R6C9'],
];

const graph = cellGraph('9x9');
const diagonal = graph.ray('R1C1', 1, 1);

// Camel-move pairs: every cell pair an elongated-knight (1,3) leap apart.
// Generated from the grid geometry rather than hand-enumerated, deduped so
// each unordered pair produces one constraint. Each pair is a size-2
// AllDifferent (a "not equal" relation is exactly a 2-cell all-different).
const CAMEL_STEPS = [
  [1, 3], [1, -3], [-1, 3], [-1, -3],
  [3, 1], [3, -1], [-3, 1], [-3, -1],
];
const camelPairKeys = new Set();
const camelPairs = [];
for (const cell of graph.cells()) {
  for (const [dRow, dCol] of CAMEL_STEPS) {
    const other = graph.step(cell, dRow, dCol);
    if (!other) continue;
    const key = [cell, other].sort().join('-');
    if (camelPairKeys.has(key)) continue;
    camelPairKeys.add(key);
    camelPairs.push([cell, other]);
  }
}

return [
  new Shape('9x9'),

  ...cages.map(c => new Cage(c.sum, ...c.cells)),

  ...palindromes.map(p => new Palindrome(...p)),

  new Sum(45, ...diagonal),

  ...camelPairs.map(([a, b]) => new AllDifferent(a, b)),
];
