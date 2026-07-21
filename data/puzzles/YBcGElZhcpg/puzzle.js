// Title: Terrace
// Author: Qodec
// Video: https://www.youtube.com/watch?v=YBcGElZhcpg
// Source: https://sudokupad.app/bpm965ze9a

// Standard sudoku. R7C2 is even. Every 5 has a 1 immediately above it or a
// 9 immediately below it (or both). In each row, the digits in columns 1, 5,
// and 9 index the positions of 1, 5, and 9 respectively. X-marked pairs sum
// to 10; the X rule is not negative.

const indexingCells = [
  ...cellGraph('9x9').column(1),
  ...cellGraph('9x9').column(5),
  ...cellGraph('9x9').column(9),
];

const xPairs = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R8C2', 'R8C1'],
  ['R4C2', 'R5C2'],
  ['R8C7', 'R8C8'],
  ['R9C4', 'R9C5'],
  ['R4C5', 'R4C6'],
].map(cells => new X(...cells));

return [
  new Shape('9x9'),
  new Given('R7C2', 2, 4, 6, 8),
  new DutchFlatmates(),
  new Indexing('C', ...indexingCells),
  ...xPairs,
];
