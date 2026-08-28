// Title: March 7, 2022: Even Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=VrmINT5PAyk
// Source: https://tinyurl.com/3jkzbxmk

// Standard sudoku (rows, columns, boxes all-different), plus:
// - gray cells must hold an even digit, encoded as a restricted Given.
// - each killer cage's digits are distinct and sum to its printed total,
//   encoded with Cage (distinct + sum).
// Cage cell lists/totals and the even-cell list are the puzzle's drawn
// killer cages and gray cells, transcribed from the source payload.

const evenCells = [
  'R1C2', 'R1C8', 'R2C1', 'R2C9', 'R3C3', 'R3C4', 'R3C6', 'R3C7',
  'R4C3', 'R4C4', 'R4C6', 'R4C7', 'R6C3', 'R6C4', 'R6C6', 'R6C7',
  'R7C3', 'R7C4', 'R7C6', 'R7C7', 'R8C1', 'R8C9', 'R9C2', 'R9C8',
];

const cages = [
  [7, 'R1C2', 'R1C3'],
  [7, 'R1C7', 'R1C8'],
  [7, 'R2C1', 'R3C1'],
  [7, 'R2C9', 'R3C9'],
  [6, 'R3C3', 'R3C4'],
  [9, 'R3C5', 'R3C6'],
  [8, 'R3C7', 'R4C7'],
  [9, 'R4C3', 'R5C3'],
  [9, 'R4C4', 'R5C4'],
  [9, 'R4C5', 'R4C6'],
  [9, 'R5C6', 'R6C6'],
  [9, 'R5C7', 'R6C7'],
  [12, 'R6C3', 'R7C3'],
  [9, 'R6C4', 'R6C5'],
  [7, 'R7C1', 'R8C1'],
  [9, 'R7C4', 'R7C5'],
  [14, 'R7C6', 'R7C7'],
  [7, 'R7C9', 'R8C9'],
  [7, 'R9C2', 'R9C3'],
  [7, 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
