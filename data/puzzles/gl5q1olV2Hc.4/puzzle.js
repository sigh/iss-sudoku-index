// Title: Sept. 16, 2023: 381654729?
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gl5q1olV2Hc
// Source: https://tinyurl.com/4z72zj5v

// Normal Sudoku with the nine given diagonal digits. Each drawn purple line is a
// Renban: its digits form a non-repeating consecutive set in any order.
const renbans = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3'],
  ['R5C2', 'R5C3', 'R6C3'],
  ['R3C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C2', 'R2C3', 'R3C3'],
  ['R1C2', 'R1C3', 'R1C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C8'],
  ['R7C7', 'R8C7', 'R8C8'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R2C7', 'R2C8', 'R3C8', 'R4C8'],
  ['R4C7', 'R5C7', 'R5C8'],
]; // Cell lists transcribed from the sixteen drawn purple lines.

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),
  ...renbans.map((cells) => new Renban(...cells)),
];
