// Title: Lilliputian Arrows
// Author: 99% Sneaky
// Video: https://www.youtube.com/watch?v=UdMkQW8VG8Y
// Source: https://app.crackingthecryptic.com/sudoku/TL9FdFpj3d

// Normal Sudoku rules apply (standard 3x3 boxes). Each arrow's bulb cell
// equals the sum of that arrow's arm cells; five bulbs carry two separate
// arrows (both sum to the same shared bulb). Cages show their sums (killer
// cages: cells within a cage do not repeat).
const arrows = [
  ['R4C6', 'R4C7', 'R4C8'], ['R4C6', 'R5C7', 'R6C7'],
  ['R6C4', 'R6C3', 'R6C2'], ['R6C4', 'R5C3', 'R4C3'],
  ['R4C4', 'R3C4', 'R2C4'], ['R4C4', 'R3C5', 'R3C6'],
  ['R6C6', 'R7C6', 'R8C6'], ['R6C6', 'R7C5', 'R7C4'],
  ['R3C7', 'R3C8', 'R3C9'], ['R3C7', 'R2C7', 'R1C7'],
  ['R7C3', 'R8C4', 'R9C3'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R7C7', 'R7C8', 'R7C9'],
];
const cages = [
  ['R1C4', 'R1C5', 9], ['R2C8', 'R2C9', 10], ['R3C1', 'R3C2', 6],
  ['R4C9', 'R5C9', 9], ['R5C1', 'R6C1', 9], ['R8C1', 'R8C2', 15],
  ['R8C8', 'R8C9', 5], ['R9C4', 'R9C5', 9],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([a, b, sum]) => new Cage(sum, a, b)),
];
