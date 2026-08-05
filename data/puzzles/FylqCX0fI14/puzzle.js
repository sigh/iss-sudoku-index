// Title: Symmetry?
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=FylqCX0fI14
// Source: https://app.crackingthecryptic.com/sudoku/FJf8mBHjH9

// Standard 9x9 sudoku; red columns 1, 5, and 9 index the positions of 1, 5, and 9 in each row.
// The two blue main diagonals have no repeated digits. Kropki dots are non-exhaustive.
const rows = Array.from({length: 9}, (_, i) => i + 1);
const redColumn = column => rows.map(row => makeCellId(row, column));
const blackDots = [
  ['R1C1', 'R1C2'], ['R2C1', 'R2C2'],
  ['R1C8', 'R1C9'], ['R2C8', 'R2C9'],
  ['R8C1', 'R8C2'], ['R8C8', 'R8C9'],
]; // Drawn black dots.
const whiteDots = [
  ['R1C5', 'R2C5'], ['R9C4', 'R9C5'], ['R9C5', 'R9C6'],
]; // Drawn white dots.

return [
  new Shape('9x9'),
  new Indexing('C', ...redColumn(1)),
  new Indexing('C', ...redColumn(5)),
  new Indexing('C', ...redColumn(9)),
  new Diagonal(1),
  new Diagonal(-1),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
