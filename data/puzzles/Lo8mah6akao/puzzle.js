// Title: Inception
// Author: Sumanta (Anu)
// Video: https://www.youtube.com/watch?v=Lo8mah6akao
// Source: https://tinyurl.com/SumantaInception

// Normal sudoku rules apply.
// Thermometers: strictly increasing from the bulb (first cell in each list).
// Killer cages: distinct digits summing to the printed total.
// Between lines: interior digits strictly between the two endpoint circles.
// Odd circles: single cells restricted to an odd digit (no dedicated Odd
// class exists in this solver; encoded as a multi-value Given).

const thermos = [
  ['R3C3', 'R3C4', 'R4C4', 'R4C3', 'R5C3'],
  ['R7C4', 'R7C3', 'R6C3', 'R6C4', 'R5C4'],
  ['R3C7', 'R3C6', 'R4C6', 'R4C7', 'R5C7'],
  ['R7C6', 'R7C7', 'R6C7', 'R6C6', 'R5C6'],
].map(cells => new Thermo(...cells));

const cages = [
  [11, 'R1C5', 'R2C5'],
  [11, 'R8C5', 'R9C5'],
  [12, 'R8C1', 'R9C1'],
  [12, 'R8C2', 'R9C2'],
].map(([total, ...cells]) => new Cage(total, ...cells));

const betweenLines = [
  ['R9C7', 'R9C8', 'R9C9', 'R8C8', 'R8C9', 'R7C9'],
  ['R1C3', 'R1C2', 'R1C1', 'R2C2', 'R2C1', 'R3C1'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9'],
].map(cells => new Between(...cells));

const oddCells = ['R1C5', 'R5C1', 'R9C5', 'R5C9'].map(
  cell => new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  ...oddCells,
  ...thermos,
  ...cages,
  ...betweenLines,
];
