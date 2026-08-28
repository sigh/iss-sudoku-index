// Title: Feb 24, 2022: Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=5KkjaYmgOBc
// Source: https://tinyurl.com/2p92fkfs

// Normal sudoku rules apply. Numbers along an arrow must add up to the total
// in the adjoining circle. All 12 circles here sit on a given digit, and each
// arm is a straight 2-cell line.

const givens = [
  ['R1C4', 5], ['R1C7', 7], ['R2C2', 3], ['R3C4', 6], ['R5C2', 9],
  ['R5C3', 5], ['R5C7', 4], ['R5C8', 7], ['R7C6', 7], ['R8C8', 4],
  ['R9C3', 8], ['R9C6', 4],
];

// Arrow: circle cell first, then arm cells (ISS Arrow constructor order).
const arrows = [
  ['R2C2', ['R3C2', 'R4C2']],
  ['R5C2', ['R6C2', 'R7C2']],
  ['R8C8', ['R7C8', 'R6C8']],
  ['R5C8', ['R4C8', 'R3C8']],
  ['R1C4', ['R1C5', 'R1C6']],
  ['R1C7', ['R1C8', 'R1C9']],
  ['R9C6', ['R9C5', 'R9C4']],
  ['R9C3', ['R9C2', 'R9C1']],
  ['R7C6', ['R6C5', 'R5C4']],
  ['R3C4', ['R4C5', 'R5C6']],
  ['R5C7', ['R4C7', 'R3C7']],
  ['R5C3', ['R6C3', 'R7C3']],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(([circle, arm]) => new Arrow(circle, ...arm)),
];
