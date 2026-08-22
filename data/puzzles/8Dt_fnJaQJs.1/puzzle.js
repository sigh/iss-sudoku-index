// Title: Nov. 23, 2021: Thing of Shapes
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://tinyurl.com/z3ce74mc

// Normal sudoku rules apply. Digits along thermometers strictly increase
// from bulb (first cell below) to tip. Digits cannot repeat on either
// marked diagonal.

const givens = [
  ['R1C5', 7], ['R2C3', 7], ['R2C7', 4], ['R3C2', 6], ['R3C8', 5],
  ['R5C1', 6], ['R5C9', 5], ['R7C2', 7], ['R7C8', 1], ['R8C3', 3],
  ['R8C7', 6], ['R9C5', 6],
];

// Bulb-to-tip cell order, transcribed from the raw `thermometer` lines.
const thermos = [
  ['R1C1', 'R2C2', 'R3C3'],
  ['R9C9', 'R8C8', 'R7C7'],
  ['R9C1', 'R8C2', 'R7C3'],
  ['R1C9', 'R2C8', 'R3C7'],
  ['R5C4', 'R4C5', 'R5C6', 'R6C5'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'],
  ['R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(cells => new Thermo(...cells)),
  new Diagonal(1),
  new Diagonal(-1),
];
