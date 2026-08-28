// Title: Latin 5x5
// Author: Michal58
// Video: https://www.youtube.com/watch?v=boqWUATiW9E
// Source: https://cracking-the-cryptic.web.app/sudoku/NpBjdf9g9d

// Normal sudoku rules apply (9x9, default rows/cols/3x3 boxes).
//
// 25 cells are shaded, forming a diamond inscribed in the grid. The rules
// state the shaded cells hold a tilted 5x5 Latin square: each of digits 1-5
// appears once in each of its "rows" and "columns", which run as the two
// diagonal directions of the grid. Each diagonal line has exactly 5 shaded
// cells, so restricting those cells' candidates to {1,2,3,4,5} and requiring
// AllDifferent along each line together force each line to be a permutation
// of 1-5, i.e. the Latin-square property. Shaded-cell coordinates below are
// transcribed from the payload's grey underlay list (25 cells).

const shaded = [
  'R1C5', 'R2C4', 'R2C6', 'R3C3', 'R3C5', 'R3C7', 'R4C2', 'R4C4', 'R4C6',
  'R4C8', 'R5C1', 'R5C3', 'R5C5', 'R5C7', 'R5C9', 'R6C2', 'R6C4', 'R6C6',
  'R6C8', 'R7C3', 'R7C5', 'R7C7', 'R8C4', 'R8C6', 'R9C5',
];

// Restrict every shaded cell to digits 1-5 (the tilted Latin square's digit
// set).
const restrictedToFive = shaded.map((cell) => new Given(cell, 1, 2, 3, 4, 5));

// The 10 tilted-grid lines (5 cells each): five running NE-SW (constant
// row+col) and five running NW-SE (constant row-col), derived from `shaded`
// rather than hand-enumerated a second time.
const cellsByAntiDiag = new Map(); // key: row+col
const cellsByDiag = new Map(); // key: row-col
for (const cellId of shaded) {
  const { row, col } = parseCellId(cellId);
  const antiKey = row + col;
  const diagKey = row - col;
  if (!cellsByAntiDiag.has(antiKey)) cellsByAntiDiag.set(antiKey, []);
  if (!cellsByDiag.has(diagKey)) cellsByDiag.set(diagKey, []);
  cellsByAntiDiag.get(antiKey).push(cellId);
  cellsByDiag.get(diagKey).push(cellId);
}

const latinLines = [
  ...[...cellsByAntiDiag.values()].map((cells) => new AllDifferent(...cells)),
  ...[...cellsByDiag.values()].map((cells) => new AllDifferent(...cells)),
];

return [
  new Shape('9x9'),

  new Given('R1C4', 3),
  new Given('R2C3', 6),
  new Given('R2C7', 9),
  new Given('R3C2', 8),
  new Given('R3C8', 7),
  new Given('R4C9', 4),
  new Given('R6C1', 2),
  new Given('R7C2', 9),
  new Given('R7C8', 6),
  new Given('R8C3', 7),
  new Given('R8C7', 8),
  new Given('R9C6', 1),

  ...restrictedToFive,
  ...latinLines,
];
