// Title: Mar 8, 2022: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=VrmINT5PAyk
// Source: https://tinyurl.com/2p88mcv8

// Rules: Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Numbers along each thermometer strictly increase starting
// from the bulb end (Thermo, bulb-first cell order per the payload's
// thermometer.lines convention).

const givens = [
  ['R1C1', 1], ['R1C2', 8], ['R1C3', 9], ['R1C6', 5], ['R1C7', 6], ['R1C9', 7],
  ['R2C9', 3],
  ['R3C1', 5], ['R3C9', 9],
  ['R4C1', 6], ['R4C5', 2],
  ['R5C4', 7], ['R5C6', 8],
  ['R6C5', 9], ['R6C9', 4],
  ['R7C1', 7], ['R7C9', 5],
  ['R8C1', 8],
  ['R9C1', 9], ['R9C3', 2], ['R9C4', 3], ['R9C7', 8], ['R9C8', 7], ['R9C9', 6],
];

// Thermometers, cells listed bulb-first (bulb is the circle drawn on the grid).
const thermoCells = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R9C5', 'R8C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermoCells.map((cells) => new Thermo(...cells)),
];
