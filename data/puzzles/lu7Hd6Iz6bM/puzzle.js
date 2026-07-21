// Title: Transfer Right By 2
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=lu7Hd6Iz6bM
// Source: https://sudokupad.app/yvfa2jpnew

const rowNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const columnNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = rowNumbers.map(row =>
  columnNumbers.map(column => makeCellId(row, column)));

const indexingCells = rows.flatMap(row => [row[0], row[4], row[8]]);

const renbanLines = [
  ['R7C3', 'R6C4', 'R5C5', 'R4C6'],
  ['R7C8', 'R8C7'],
  ['R7C6', 'R8C5', 'R9C4'],
  ['R1C4', 'R2C3', 'R3C2'],
  ['R4C4', 'R5C3'],
];

const positiveDiagonal = rowNumbers.map(row => makeCellId(row, 10 - row));

return [
  new Shape('9x9'),

  // Every three consecutive cells in a row contain all three residues modulo 3.
  ...rows.map(row => new Modular(3, ...row)),

  // In columns 1, 5, and 9, digit V places the column number in column V.
  new Indexing('C', ...indexingCells),

  ...renbanLines.map(cells => new Renban(...cells)),

  // Nine positive digits sum to less than 24 exactly when their sum is 9-23.
  new Or(Array.from({length: 15}, (_, offset) =>
    new Sum(9 + offset, ...positiveDiagonal))),
];
