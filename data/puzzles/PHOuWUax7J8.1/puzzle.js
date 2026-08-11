// Title: 7/11: Slurpee
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=PHOuWUax7J8
// Source: https://tinyurl.com/mr4dtuhy

// Normal sudoku rules apply. Digits along thermometers must strictly
// increase from bulb to tip -- Thermo(...) takes the cells in that order,
// bulb first.

// Givens, provenance: the 12 valued cells in the payload's grid.
const givens = [
  ['R1C6', 3], ['R3C4', 7], ['R3C5', 2], ['R4C1', 3], ['R4C7', 7],
  ['R5C3', 1], ['R5C7', 2], ['R6C3', 5], ['R6C9', 3], ['R7C5', 4],
  ['R7C6', 1], ['R9C4', 8],
];

// Thermometers, provenance: the payload's `thermometer` array, one line
// entry each, cells in bulb-to-tip order as drawn.
const thermos = [
  ['R1C4', 'R1C3', 'R2C3', 'R2C4', 'R2C5', 'R1C5'],
  ['R9C6', 'R9C7', 'R8C7', 'R8C6', 'R8C5', 'R9C5'],
  ['R4C8', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R5C8'],
  ['R6C2', 'R7C2', 'R7C1', 'R6C1', 'R5C1', 'R5C2'],
  ['R8C4', 'R7C4', 'R7C3', 'R8C3'],
  ['R3C7', 'R2C7', 'R2C6', 'R3C6'],
  ['R7C8', 'R6C8', 'R6C7', 'R7C7'],
  ['R4C2', 'R3C2', 'R3C3', 'R4C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(cells => new Thermo(...cells)),
];
