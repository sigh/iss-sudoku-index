// Title: A Killer Sandwich Sudoku - but not too vicious!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IIYsKSVgpak
// Source: https://cracking-the-cryptic.web.app/sudoku/J667H76B9R

// Normal sudoku (standard 9x9, standard boxes). Killer cages sum to their
// printed total, no repeats within a cage. Three cages print no total; those
// still forbid repeats among their own cells (Cage('', ...)) but assert no
// sum. Outside clues give the Sandwich total: digits strictly between the 1
// and the 9 in that row/column. The payload carries no rules text; Sandwich
// is the only outside-clue type consistent with the printed values (two
// clues are 0, which only a between-the-bookends sum can read -- X-Sum and
// Skyscraper never read 0; several others exceed 9, which rules out
// Skyscraper, Hidden Skyscraper, Numbered Room and Full Rank) and there is
// no drawn arrow, which rules out Little Killer. A handful of plain givens
// are printed directly in the grid.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages with a printed total (sum, cells). Provenance: payload `cages`
// array entries carrying a numeric `value`.
const killerCages = [
  [28, ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8']],
  [14, ['R1C2', 'R2C2', 'R2C3']],
  [21, ['R2C1', 'R3C1', 'R3C2']],
  [21, ['R2C7', 'R2C8', 'R3C7', 'R3C8', 'R3C9']],
  [14, ['R1C9', 'R2C9']],
  [21, ['R4C2', 'R5C1', 'R5C2', 'R6C2']],
  [21, ['R7C1', 'R7C2', 'R8C2', 'R9C2']],
  [21, ['R9C3', 'R9C4', 'R9C5', 'R8C5', 'R8C6']],
  [21, ['R9C7', 'R9C8', 'R8C8']],
  [14, ['R8C9', 'R9C9']],
];

// Cages with `value: ""` in the payload: real cages (no-repeat only), no
// printed total.
const noTotalCages = [
  ['R4C3', 'R4C4', 'R5C3', 'R5C4', 'R6C3', 'R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R7C6', 'R7C7'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
];

// Plain givens. Provenance: payload `cells[row][col].value`.
const givens = [
  ['R1C6', 7],
  ['R3C7', 7],
  ['R4C5', 7],
  ['R5C2', 6],
  ['R6C3', 7],
  ['R7C2', 7],
  ['R9C4', 7],
];

// Sandwich clues (value, row-or-column cells). Provenance: payload
// `overlays` margin text, 1-indexed row/column per the printed position.
const sandwichRows = [
  [1, 0],
  [3, 2],
  [4, 3],
  [5, 17],
  [7, 33],
  [9, 17],
];
const sandwichCols = [
  [1, 4],
  [3, 0],
  [5, 28],
  [6, 7],
  [9, 7],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...killerCages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new Cage('', ...cells)),

  ...sandwichRows.map(([row, value]) =>
    Sandwich.fromCells(value, graph.row(row), geometry)),
  ...sandwichCols.map(([col, value]) =>
    Sandwich.fromCells(value, graph.column(col), geometry)),
];
