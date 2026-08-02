// Title: Saturn's Outermost Ring
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=4K_UvuHhdWw
// Source: https://sudokupad.app/zvd9zuzz6p

// Normal Sudoku; opposite highlighted outer-ring cells sum to 10; killer cages
// are distinct and have their drawn total when one is printed.
const oppositePairs = [
  ['R1C1', 'R9C9'], ['R1C2', 'R9C8'], ['R1C3', 'R9C7'],
  ['R1C4', 'R9C6'], ['R1C5', 'R9C5'], ['R1C6', 'R9C4'],
  ['R1C7', 'R9C3'], ['R1C8', 'R9C2'], ['R1C9', 'R9C1'],
  ['R2C1', 'R8C9'], ['R2C9', 'R8C1'], ['R3C1', 'R7C9'],
  ['R3C9', 'R7C1'], ['R4C1', 'R6C9'], ['R4C9', 'R6C1'],
  ['R5C1', 'R5C9'],
];
const oppositeKey = Pair.fnToKey((a, b) => a + b === 10, 9);
const oppositeSums = oppositePairs.map(([a, b]) =>
  new Pair(oppositeKey, 'opposite highlighted cells sum to 10', a, b));

// Cage cells and totals transcribed from the drawn killer-cage outlines.
const cages = [
  new Cage(9, 'R3C1', 'R3C2'),
  new Cage(29, 'R1C7', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Cage(28, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C3'),
  new Cage(27, 'R4C2', 'R5C1', 'R5C2', 'R6C2', 'R7C2'),
  new Cage(27, 'R3C8', 'R4C8', 'R5C8', 'R5C9', 'R6C8'),
  new Cage(19, 'R1C8', 'R1C9', 'R2C9', 'R3C9'),
  new Cage(14, 'R6C5', 'R6C6', 'R7C6', 'R7C7'),
  new Cage(13, 'R6C1', 'R7C1'),
  new Cage(9, 'R6C3', 'R7C3'),
  new Cage(10, 'R2C1', 'R2C2'),
  new Cage(12, 'R4C3', 'R4C4'),
  new AllDifferent('R7C8', 'R7C9', 'R8C8', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'),
  new Cage(10, 'R3C6', 'R3C7'),
];

return [
  new Shape('9x9'),
  ...oppositeSums,
  ...cages,
];
