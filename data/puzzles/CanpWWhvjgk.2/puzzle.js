// Title: June 7, 2022: A, as in "A GAS"
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/zwpk5zyw

// Normal sudoku rules apply.
// Arrow: digits along an arrow sum to the value in the attached (bulb)
// circle; digits may repeat along an arrow if sudoku rules allow it ->
// Arrow(bulbCell, ...armCells). Three of the arrows here are drawn as a
// single bulb with multiple branch lines (payload's per-bulb "lines"
// array); each branch is its own Arrow sharing that bulb cell.
// Quadruple: the listed digits each appear at least once among the four
// cells surrounding the white circle -> Quad(topLeftCell, ...values).

const arrows = [
  // Bulb R5C3, three branches.
  new Arrow('R5C3', 'R6C3', 'R7C3', 'R8C3'),
  new Arrow('R5C3', 'R6C4', 'R6C5'),
  new Arrow('R5C3', 'R4C3', 'R3C4'),
  // Bulb R6C7, three branches.
  new Arrow('R6C7', 'R6C6', 'R6C5'),
  new Arrow('R6C7', 'R7C7', 'R8C7'),
  new Arrow('R6C7', 'R5C7', 'R4C7'),
  // Bulb R3C6, two branches.
  new Arrow('R3C6', 'R4C7'),
  new Arrow('R3C6', 'R2C5', 'R3C4'),
];

const quads = [
  new Quad('R1C1', 1, 2, 3, 4),
  new Quad('R1C8', 3, 5, 6, 8),
  new Quad('R8C1', 1, 5, 7, 8),
  new Quad('R8C8', 1, 5, 7, 9),
];

// Givens, from the payload grid.
const givens = [
  ['R1C5', 2],
  ['R2C2', 1],
  ['R2C8', 3],
  ['R5C1', 8],
  ['R5C5', 9],
  ['R5C9', 4],
  ['R8C2', 7],
  ['R8C8', 5],
  ['R9C5', 6],
];

return [
  new Shape('9x9'),
  ...arrows,
  ...quads,
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
